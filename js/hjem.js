// ===== FORSIDE: SAMME BARN SOM PÅ BARNETS SIDE =====
// Innhold lagres fortsatt bare i fanen. Ingen automatisk henting av artikler.
const barnVelger = document.querySelector("#velg-barn");
const hjemMelding = document.querySelector("#hjem-melding");
let hjemmebarn = [];
let hjemmeRolle = null;

// Kladder er redaksjonelle temaforslag, med tydelige lenker for videre lesing.
// Nye kilder kan senere legges til her med navn og direkte artikkellenke.
const foreldretips = [
    {
        tittel: "Amming og mating", tema: "mat", kilde: "Helsenorge",
        tekst: "Kladd: Her vil vi samle tips om amming, mating og hvor dere kan få veiledning.",
        lenke: "https://www.helsenorge.no/barn/spedbarnsmat-og-amming/amming-og-morsmelk/"
    },
    {
        tittel: "Trygghet og nærhet", kilde: "Bufdir",
        tekst: "Kladd: Sett av små stunder til kontakt og samspill. Her kommer flere tips om å møte barnets behov.",
        lenke: "https://www.bufdir.no/foreldrehverdag/"
    },
    {
        tittel: "Finn trygghet i morsrollen", rolle: "mor", kilde: "Bufdir",
        tekst: "Kladdtips: Gi deg selv tid til å bli kjent med barnet og rollen som mor. Du trenger ikke ha alle svarene. Snakk om det du synes er fint, og det som er vanskelig.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/foreldrerollen/"
    },
    {
        tittel: "Dine behov teller også", rolle: "mor", kilde: "Bufdir",
        tekst: "Kladdtips: Sett ord på hva du trenger av hvile, støtte og tid til deg selv. Avtal sammen hvordan dere fordeler ansvaret, slik at du ikke må holde oversikt over alt alene.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/a-ga-fra-par-til-familie-vanlige-utfordringer/"
    },
    {
        tittel: "Nærhet på dine premisser", rolle: "mor", kilde: "Bufdir",
        tekst: "Kladdtips: Snakk med partneren om hva nærhet betyr for deg nå. Det kan være en god samtale, en klem eller tid sammen. Begges ønsker og grenser skal respekteres.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/god-kommunikasjon-i-parforholdet/"
    },
    {
        tittel: "Plass til både deg og dere", rolle: "mor", kilde: "Bufdir",
        tekst: "Kladdtips: Du er fortsatt deg selv, samtidig som du er mor og partner. Snakk om hva dere savner og vil bevare fra livet som par. Dere har begge ansvar for å finne rom for hverandre.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/godt-samliv/"
    },
    {
        tittel: "Finn din rolle som far", rolle: "far", kilde: "Bufdir",
        tekst: "Kladdtips: Bli kjent med barnet gjennom egne stunder med lek, prat og stell. Du trenger ikke gjøre alt på samme måte som den andre forelderen.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/foreldrerollen/"
    },
    {
        tittel: "Ta ansvar i hverdagen", rolle: "far", kilde: "Bufdir",
        tekst: "Kladdtips: Avtal hvilke oppgaver du følger opp fra start til slutt. Snakk om hvordan dere begge kan få pauser og støtte når hverdagen er travel.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/a-ga-fra-par-til-familie-vanlige-utfordringer/"
    },
    {
        tittel: "Ta vare på parforholdet sammen", rolle: "far", kilde: "Bufdir",
        tekst: "Kladdtips: Spør partneren hvordan dagen har vært, lytt og fortell hva du selv trenger. Finn små stunder sammen uten krav om store planer. Parforholdet er et felles ansvar.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/god-kommunikasjon-i-parforholdet/"
    },
    {
        tittel: "Lær mer om livet som par", rolle: "far", kilde: "Bufdir",
        tekst: "Kladdtips: Se gjerne deler av Godt samliv sammen, og bruk det som utgangspunkt for å snakke om forventninger og livet som foreldre.",
        lenke: "https://www.bufdir.no/foreldrehverdag/a-vare-foreldre/samliv-og-familie/godt-samliv/"
    },
    {
        tittel: "Et lag i hverdagen", kilde: "Bufdir",
        tekst: "Kladd: Snakk om hva hver av dere trenger, og hvordan dere vil fordele omsorg og praktiske oppgaver. Rollene trenger ikke være faste.",
        lenke: "https://www.bufdir.no/foreldrehverdag/"
    }
];

function visHjemmebarn() {
    const barnet = hjemmebarn.find(b => b.id === barnVelger.value);
    document.querySelector("#alderstips").hidden = !barnet;
    if (!barnet) return;
    const gruppe = finnAldersinnhold(barnet.fodselsdato);
    document.querySelector("#barn-oppsummering").textContent = `${barnet.navn} · Aldersgruppe: ${gruppe.navn}`;
    visAldersinformasjon(barnet.fodselsdato);

    // Amming vises som tema for spedbarn; eldre barn får lenke om matvaner.
    const beholder = document.querySelector("#foreldretips");
    beholder.replaceChildren();
    // Vis bare den innloggede forelderens rollekort, sammen med fellestips.
    // Uten innlogging vises generelle tips og en invitasjon til å logge inn.
    foreldretips.filter(tips => !tips.rolle || tips.rolle === hjemmeRolle).forEach(tips => {
        let { tittel, tekst, lenke, kilde } = tips;
        if (tips.tema === "mat" && hjemmeRolle === "far") {
            tittel = "Din rolle rundt mating";
            tekst = "Kladd: Her kommer tips om hvordan du kan være involvert rundt mating og støtte den andre forelderen ved amming.";
        } else if (tips.tema === "mat" && hjemmeRolle === "mor") {
            tittel = "Amming og mating – støtte til deg";
            tekst = "Kladd: Her kommer informasjon om amming og mating, og hvor du kan få støtte ut fra dine og barnets behov.";
        }
        if (tips.tema === "mat" && alderIMaaneder(barnet.fodselsdato) >= 12) {
            tittel = "Mat og måltider";
            tekst = "Kladd: Her kommer innhold om måltider og gode matvaner tilpasset barnets alder.";
            lenke = "https://www.helsenorge.no/barn/";
        }
        const kort = document.createElement("article");
        kort.className = "kort";
        const overskrift = document.createElement("h3");
        overskrift.textContent = tittel;
        const avsnitt = document.createElement("p");
        avsnitt.textContent = tekst;
        const lesMer = document.createElement("a");
        lesMer.textContent = `Les mer hos ${kilde}`;
        lesMer.href = lenke;
        lesMer.target = "_blank";
        lesMer.rel = "noopener noreferrer";
        lesMer.setAttribute("aria-label", `${lesMer.textContent} om ${tittel.toLowerCase()} (åpnes i ny fane)`);
        kort.append(overskrift, avsnitt, lesMer);
        beholder.append(kort);
    });
}

try {
    const rolle = sessionStorage.getItem("littleBabyRolle");
    hjemmeRolle = ["mor", "far"].includes(rolle) ? rolle : null;
    document.querySelector("#foreldre-tittel").textContent = hjemmeRolle
        ? `For deg som ${hjemmeRolle}`
        : "Dere som foreldre";
    document.querySelector("#foreldre-intro").textContent = hjemmeRolle
        ? `Kladd til prototypen: Tips for deg som ${hjemmeRolle}, og for samarbeidet deres. Les mer hos kildene.`
        : "Logg inn som mor eller far for å se tilpassede tips. Innholdet er foreløpig kladd.";
    if (["mor", "far"].includes(rolle)) {
        document.querySelector("#velkomsttekst").textContent = rolle === "mor" ? "Hei, mamma!" : "Hei, pappa!";
        const konto = document.querySelector("#konto-lenke");
        konto.textContent = "Min side";
        konto.href = "min-side.html";
    }
    const data = JSON.parse(sessionStorage.getItem("littleBabyBarn-v1") || "[]");
    if (!Array.isArray(data) || !data.every(b => b && typeof b.id === "string" && typeof b.navn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.fodselsdato) && !Number.isNaN(Date.parse(b.fodselsdato)))) {
        throw new Error("Ugyldige barnedata");
    }
    // Samme eksempel-ID som Barnets side, slik at barnet ikke dupliseres.
    if (!data.some(b => b.id === "eksempelbarn-emma")) {
        data.push({ id: "eksempelbarn-emma", navn: "Emma (eksempel)", fodselsdato: "2026-05-20" });
        sessionStorage.setItem("littleBabyBarn-v1", JSON.stringify(data));
    }
    hjemmebarn = data;
    hjemmebarn.forEach(barnet => {
        const valg = document.createElement("option");
        valg.value = barnet.id;
        valg.textContent = barnet.navn;
        barnVelger.append(valg);
    });
    const valgt = sessionStorage.getItem("littleBabyValgtBarn");
    barnVelger.value = hjemmebarn.some(b => b.id === valgt) ? valgt : hjemmebarn[0].id;
    visHjemmebarn();
} catch {
    hjemMelding.textContent = "Kunne ikke laste barnets informasjon. Prøv å oppdatere siden.";
}

barnVelger.addEventListener("change", () => {
    visHjemmebarn();
    try { sessionStorage.setItem("littleBabyValgtBarn", barnVelger.value); }
    catch { hjemMelding.textContent = "Valget kunne ikke lagres."; }
});
