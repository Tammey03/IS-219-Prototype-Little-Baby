// ===== CHATDEMO – INGEN API ELLER EKSTERN AI =====
// Spørsmål vises bare på siden og lagres ikke. Svarene er faste kildetips.
const aiSamtale = document.querySelector("#ai-samtale");
const aiFelt = document.querySelector("#ai-sporsmal");
let aiBarnId = null;

// Kalles fra Barnets side når valgt barneprofil vises.
function oppdaterChatBarn(id, navn, alder) {
    if (aiBarnId !== id) aiSamtale.replaceChildren();
    aiBarnId = id;
    document.querySelector("#ai-intro").textContent =
        `Hei! Du ser på ${navn}, som er ${alder}. I denne demoen kan jeg vise lenker om søvn, mat og foreldrerollen. Har du et spørsmål?`;
}

function leggTilChatmelding(avsender, tekst, lenke) {
    const melding = document.createElement("div");
    melding.className = avsender === "Du" ? "ai-melding ai-bruker" : "ai-melding";
    const navn = document.createElement("strong");
    navn.textContent = avsender;
    const innhold = document.createElement("p");
    // Bruk textContent, slik at innskrevet tekst ikke tolkes som HTML.
    innhold.textContent = tekst;
    melding.append(navn, innhold);
    if (lenke) {
        const a = document.createElement("a");
        a.textContent = `${lenke[0]} (ny fane)`;
        a.href = lenke[1];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        melding.append(a);
    }
    aiSamtale.append(melding);
    aiSamtale.scrollTop = aiSamtale.scrollHeight;
}

function sendDemosvar(sporsmal) {
    const tekst = sporsmal.trim();
    if (!tekst) return;
    leggTilChatmelding("Du", tekst);
    const tema = tekst.toLowerCase();
    let svar = "Jeg er en chatdemo og kan ikke vurdere spørsmålet ditt. Se informasjonen på Barnets side, eller spør helsestasjonen om råd tilpasset barnet.";
    let kilde = ["Les om foreldrehverdagen hos Bufdir", "https://www.bufdir.no/foreldrehverdag/"];
    if (/søvn|sovn|sov|legging|natt/.test(tema)) {
        svar = "Demosvar: Her vil en veileder kunne finne informasjon om søvn tilpasset barnet. Foreløpig kan du lese Helsenorges råd for barn 0–2 år; sjekk at rådene passer barnets alder.";
        kilde = ["Søvn hos barn 0–2 år – Helsenorge", "https://www.helsenorge.no/barn/sovn-hos-barn/"];
    } else if (/mat|amm|melk|spis/.test(tema)) {
        svar = "Demosvar: Her vil det komme informasjon om mat og amming. Velg informasjon som passer barnets alder hos Helsenorge. Demoen gir ikke individuelle ernæringsråd.";
        kilde = ["Informasjon om barn – Helsenorge", "https://www.helsenorge.no/barn/"];
    } else if (/foreldr|mor|far|partner|parforhold/.test(tema)) {
        svar = "Demosvar: Bufdir har informasjon om foreldrerollen og samarbeid. Du finner også egne kladdtips til mor og far på forsiden.";
    }
    leggTilChatmelding("LittleBaby AI · demo", svar, kilde);
}

document.querySelector("#ai-skjema").addEventListener("submit", hendelse => {
    hendelse.preventDefault();
    sendDemosvar(aiFelt.value);
    aiFelt.value = "";
    aiFelt.focus();
});
document.querySelectorAll("[data-chattema]").forEach(knapp => {
    knapp.addEventListener("click", () => sendDemosvar(knapp.dataset.chattema));
});
document.querySelector("#ai-nullstill").addEventListener("click", () => {
    aiSamtale.replaceChildren();
    aiFelt.value = "";
    aiFelt.focus();
});
