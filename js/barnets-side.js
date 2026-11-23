// ===== ELEMENTER FRA HTML =====

const skjema = document.querySelector("#barn-skjema");
const navnefelt = document.querySelector("#barn-navn");
const datofelt = document.querySelector("#barn-fodt");
const barnValg = document.querySelector("#barn-valg");
const profil = document.querySelector("#barn-profil");
const melding = document.querySelector("#melding");

// Samme nøkkel for begge foreldrene.
// Den inneholder ikke "mor" eller "far".
const lagringsnokkel = "littleBabyBarn-v1";
const valgtNokkel = "littleBabyValgtBarn";

let barn = [];
let valgtBarnId = null;

// ===== DATO OG ALDER =====

// Lokal dato i formatet ÅÅÅÅ-MM-DD.
function dagensDato() {
    const dato = new Date();
    const aar = dato.getFullYear();
    const maaned = String(dato.getMonth() + 1).padStart(2, "0");
    const dag = String(dato.getDate()).padStart(2, "0");

    return `${aar}-${maaned}-${dag}`;
}

// Hindrer valg av en fremtidig fødselsdato.
datofelt.max = dagensDato();

function beregnAlder(fodselsdato) {
    const [aar, maaned, dag] = fodselsdato.split("-").map(Number);
    const iDag = new Date();

    // Beregn antall hele måneder siden fødselen.
    let maaneder =
        (iDag.getFullYear() - aar) * 12 +
        (iDag.getMonth() + 1 - maaned);

    if (iDag.getDate() < dag) {
        maaneder--;
    }

    // For de yngste viser vi dager.
    if (maaneder < 1) {
        // UTC brukes her for å unngå feil rundt sommertid.
        const fodt = Date.UTC(aar, maaned - 1, dag);
        const naa = Date.UTC(
            iDag.getFullYear(),
            iDag.getMonth(),
            iDag.getDate()
        );

        const dager = Math.floor((naa - fodt) / 86400000);
        return `${dager} ${dager === 1 ? "dag" : "dager"}`;
    }

    if (maaneder < 12) {
        return `${maaneder} ${maaneder === 1 ? "måned" : "måneder"}`;
    }

    const heleAar = Math.floor(maaneder / 12);
    const ekstraMaaneder = maaneder % 12;

    if (ekstraMaaneder === 0) {
        return `${heleAar} år`;
    }

    return `${heleAar} år og ${ekstraMaaneder} ${
        ekstraMaaneder === 1 ? "måned" : "måneder"
    }`;
}

// ===== VIS BARNA =====

function visBarn() {
    barnValg.replaceChildren();

    if (barn.length === 0) {
        barnValg.textContent = "Ingen barn er lagt til ennå.";
        profil.hidden = true;
        return;
    }

    // Velg første barn dersom ingen er valgt.
    if (!barn.some(b => b.id === valgtBarnId)) {
        valgtBarnId = barn[0].id;
    }

    barn.forEach((barnet) => {
        const knapp = document.createElement("button");

        knapp.type = "button";
        knapp.textContent = barnet.navn;
        knapp.setAttribute(
            "aria-pressed",
            String(barnet.id === valgtBarnId)
        );

        knapp.addEventListener("click", () => {
            valgtBarnId = barnet.id;

            // Visningen virker selv om valgt barn ikke kan lagres.
            try {
                sessionStorage.setItem(valgtNokkel, valgtBarnId);
            } catch {
                melding.textContent = "Valgt barn kunne ikke huskes.";
            }

            visBarn();
        });

        barnValg.append(knapp);
    });

    visProfil();
}

function visProfil() {
    const barnet = barn.find(b => b.id === valgtBarnId);
    if (!barnet) return;

    document.querySelector("#profil-navn").textContent = barnet.navn;

    // Klokken 12 unngår at datoen forskyves rundt tidssoneskifter.
    const dato = new Date(`${barnet.fodselsdato}T12:00:00`);

    document.querySelector("#profil-fodt").textContent =
        `Født: ${dato.toLocaleDateString("nb-NO")}`;

    document.querySelector("#profil-alder").textContent =
        `Alder: ${beregnAlder(barnet.fodselsdato)}`;

    // Velg relevant informasjon ut fra barnets fødselsdato.
    visAldersinformasjon(barnet.fodselsdato);
    // Chatdemoen følger valgt barn. Samtalen tømmes ved bytte av barn.
    oppdaterChatBarn(barnet.id, barnet.navn, beregnAlder(barnet.fodselsdato));
    profil.hidden = false;
}

// ===== LEGG TIL BARN =====

skjema.addEventListener("submit", (hendelse) => {
    hendelse.preventDefault();

    const navn = navnefelt.value.trim();
    const fodselsdato = datofelt.value;

    if (!navn || !fodselsdato || fodselsdato > dagensDato()) {
        melding.textContent =
            "Skriv inn navn og en gyldig fødselsdato.";
        return;
    }

    const nyttBarn = {
        id: crypto.randomUUID(),
        navn,
        fodselsdato
    };

    const oppdatert = [...barn, nyttBarn];

    try {
        // Lagre først, slik at vi ikke viser en vellykket registrering
        // dersom nettleseren blokkerer lagring.
        sessionStorage.setItem(
            lagringsnokkel,
            JSON.stringify(oppdatert)
        );
    } catch {
        melding.textContent =
            "Barnet kunne ikke lagres. Prøv igjen.";
        return;
    }

    barn = oppdatert;
    valgtBarnId = nyttBarn.id;

    skjema.reset();
    visBarn();

    melding.textContent = `${navn} er lagt til.`;
});

// ===== LAST INN LAGREDE BARN =====

try {
    const lagret = sessionStorage.getItem(lagringsnokkel);
    const data = lagret ? JSON.parse(lagret) : [];

    // Enkel kontroll av lagrede data før de brukes.
    if (
        !Array.isArray(data) ||
        !data.every(b =>
            b &&
            typeof b.id === "string" &&
            typeof b.navn === "string" &&
            typeof b.fodselsdato === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(b.fodselsdato) &&
            !Number.isNaN(Date.parse(b.fodselsdato)) &&
            b.fodselsdato <= dagensDato()
        )
    ) {
        throw new Error("Ugyldige barnedata");
    }

    // Fiktivt eksempelbarn gir innhold klart til demo, også i eksisterende faner.
    // Fast ID hindrer duplikater når siden oppdateres. Egne barn beholdes.
    if (!data.some(b => b.id === "eksempelbarn-emma")) {
        data.push({
            id: "eksempelbarn-emma",
            navn: "Emma (eksempel)",
            fodselsdato: "2026-05-20"
        });
        sessionStorage.setItem(lagringsnokkel, JSON.stringify(data));
    }

    barn = data;
    valgtBarnId = sessionStorage.getItem(valgtNokkel);
    visBarn();
} catch {
    // Unngå å overskrive eksisterende data ved innlastingsfeil.
    melding.textContent =
        "Barnedata kunne ikke lastes. Prøv å oppdatere siden.";

    skjema.querySelector("button").disabled = true;
}
