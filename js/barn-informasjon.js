// ===== KILDER OG ALDERSINNHOLD =====
// Innholdet er korte sammendrag med lenker til offentlige helsekilder.
// Aldersgruppene er en navigasjonshjelp, ikke en vurdering av utviklingen.
//
// ===== NYE KILDER – FYLLES UT VIDERE =====
// Samle forslag her: nettsted, direkte lenke, tema og aktuell aldersgruppe.
// Eksempel på format (erstatt med en ekte, vurdert kilde):
// - Nettsted: ... | Lenke: ... | Tema: ... | Alder: ...
// Forslag:
// -
//
// Før publisering: kontroller avsender, faglig innhold og dato for rådene.
// Legg deretter kilden i foreldrekilder med en unik nøkkel og bruk nøkkelen
// i behov, aktivitet eller neste under den relevante aldersgruppen.
// Visningen henter automatisk nettstedets navn fra kildens tittel.
const foreldrekilder = {
    smaabarn: ["Helsenorge: barn fra 0 til 2 år", "https://www.helsenorge.no/barn/0-2-ar/"],
    sovn: ["Helsenorge: søvn hos barn 0–2 år", "https://www.helsenorge.no/barn/sovn-hos-barn/"],
    mat: ["Helsenorge: starte med fast føde", "https://www.helsenorge.no/barn/spedbarnsmat-og-amming/fast-fode-til-babyen/"],
    lek: ["Helsenorge: lek og aktivitet 0–5 år", "https://www.helsenorge.no/trening-og-fysisk-aktivitet/fysisk-aktivitet-0-5-ar/"],
    sikkerhet: ["Helsenorge: sikkerhet for små barn", "https://www.helsenorge.no/forstehjelp/sikkerhet-for-sma-barn"],
    tenner: ["Helsenorge: tannstell hos barn", "https://www.helsenorge.no/tannhelse/tannstell-hos-barn/"],
    skole: ["Helsenorge: aktivitet i skolealder", "https://www.helsenorge.no/trening-og-fysisk-aktivitet/fysisk-aktivitet-for-barn-skolealder/"]
};

// Hver blokk har sin egen kilde, slik at foreldrene kan lese videre.
const aldersinnhold = [
    {
        fra: 0, til: 3, navn: "0–2 måneder",
        behov: ["Søvn og trygghet", "Legg spedbarnet på ryggen ved søvn og hold puter og kosedyr ute av sengen.", "sovn"],
        aktivitet: ["Rolig samspill", "Prøv korte stunder med blikkontakt, prat og sang. Ta pauser når barnet trenger det.", "smaabarn"],
        neste: ["Spørsmål til helsestasjonen", "Skriv ned spørsmål om mating, søvn og hvordan dere har det som foreldre, før neste kontakt.", "smaabarn"]
    },
    {
        fra: 3, til: 6, navn: "3–5 måneder",
        behov: ["Mat og barnets behov", "Er dere usikre på når barnet trenger annen mat? Snakk med helsestasjonen. Fast føde skal ikke gis før fire måneder.", "mat"],
        aktivitet: ["Bevegelse gjennom lek", "Gi rom for bevegelse på et trygt underlag, sammen med en voksen. Tilpass leken til barnet.", "lek"],
        neste: ["Finn ro rundt søvn", "Se etter barnets trøtthetssignaler og prøv en rolig overgang til søvn. Søvnbehov varierer.", "sovn"]
    },
    {
        fra: 6, til: 12, navn: "6–11 måneder",
        behov: ["Bli kjent med mat", "Fra seks måneder trenger barnet fast føde i tillegg til morsmelk eller morsmelkerstatning. Les om en gradvis introduksjon.", "mat"],
        aktivitet: ["Utforsk sammen", "Lag plass til lek og bevegelse på gulvet. Følg barnets initiativ uten å presse frem bestemte ferdigheter.", "lek"],
        neste: ["Gå gjennom hjemmet", "Se etter små gjenstander og andre farer etter hvert som barnet blir mer bevegelig.", "sikkerhet"]
    },
    {
        fra: 12, til: 24, navn: "1 år",
        behov: ["Gode tannvaner", "Hjelp barnet med tannpuss, og les rådene om fluortannkrem og mengde for alderen.", "tenner"],
        aktivitet: ["Aktiv hverdag", "Sett av tid til variert lek og bevegelse, både inne og ute. Velg aktiviteter barnet liker og mestrer.", "lek"],
        neste: ["Følg opp spørsmål", "Ta opp spørsmål om mat, søvn og utvikling på helsestasjonen. Bruk gjerne en egen liste til spørsmålene.", "smaabarn"]
    },
    {
        fra: 24, til: 72, navn: "2–5 år",
        behov: ["Trygge hverdagsvaner", "Fortsett å hjelpe til med tannpussen. Tannhelsetjenesten kan veilede om barnets tenner.", "tenner"],
        aktivitet: ["Lek med variasjon", "Prøv tur, dans, ball eller annen lek sammen. Tilpass aktivitetene til barnets interesser og forutsetninger.", "lek"],
        neste: ["Sikkerhet når barnet utforsker", "Gå gjennom sikkerheten hjemme og ute etter hvert som barnet får nye ferdigheter.", "sikkerhet"]
    },
    {
        fra: 72, til: Infinity, navn: "Fra 6 år",
        behov: ["Tannhelse videre", "Barn trenger fortsatt hjelp med god tannpuss. Les rådene for barnets alder hos Helsenorge.", "tenner"],
        aktivitet: ["Bevegelse i skolealderen", "Finn aktiviteter barnet trives med, og legg til rette for bevegelse i hverdagen.", "skole"],
        neste: ["Finn råd for skolealderen", "Småbarnsrådene gjelder ikke alle aldre. Bruk informasjonen for skolebarn, og ta opp spørsmål med skolehelsetjenesten eller fastlegen.", "skole"]
    }
];

// Hele levemåneder bestemmer hvilken gruppe barnet tilhører.
function alderIMaaneder(fodselsdato, naa = new Date()) {
    const [aar, maaned, dag] = fodselsdato.split("-").map(Number);
    let alder = (naa.getFullYear() - aar) * 12 + naa.getMonth() + 1 - maaned;
    if (naa.getDate() < dag) alder--;
    return Math.max(0, alder);
}

function finnAldersinnhold(fodselsdato) {
    const alder = alderIMaaneder(fodselsdato);
    return aldersinnhold.find(gruppe => alder >= gruppe.fra && alder < gruppe.til);
}

// Vis tre tydelige kategorier og kildelenker for barnet som er valgt.
function visAldersinformasjon(fodselsdato) {
    const gruppe = finnAldersinnhold(fodselsdato);
    const beholder = document.querySelector("#alder-informasjon");
    beholder.replaceChildren();
    document.querySelector("#aldersgruppe").textContent = `Viser råd for ${gruppe.navn.toLowerCase()}`;

    const kategorier = [
        ["Hva trenger barnet?", gruppe.behov],
        ["Hva kan dere gjøre sammen?", gruppe.aktivitet],
        ["Hva kan dere gjøre videre?", gruppe.neste]
    ];
    kategorier.forEach(([kategori, [tittel, tekst, kilde]]) => {
        const seksjon = document.createElement("section");
        seksjon.className = "infoblokk";
        const overskrift = document.createElement("h4");
        overskrift.textContent = kategori;
        // Én kort forklaring per punkt. Temaet brukes i lenkens tilgjengelige navn.
        const avsnitt = document.createElement("p");
        avsnitt.textContent = tekst;
        const lenke = document.createElement("a");
        // Kildetitler skrives som "Nettsted: tema", også for fremtidige kilder.
        const nettsted = foreldrekilder[kilde][0].split(":")[0];
        lenke.textContent = `Les mer hos ${nettsted}`;
        lenke.setAttribute("aria-label", `Les mer om ${tittel.toLowerCase()}: ${foreldrekilder[kilde][0]} (åpnes i ny fane)`);
        lenke.href = foreldrekilder[kilde][1];
        // Ny fane beholder portalens demo og valgt barn i den opprinnelige fanen.
        lenke.target = "_blank";
        lenke.rel = "noopener noreferrer";
        lenke.title = "Åpnes i ny fane";
        seksjon.append(overskrift, avsnitt, lenke);
        beholder.append(seksjon);
    });
}
