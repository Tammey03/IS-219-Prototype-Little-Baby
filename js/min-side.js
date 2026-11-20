// ===== DATA OG INNLOGGING =====
// Alle lister og kalendere lagres samlet i denne fanen for demoen.
// Rollen kommer fra innloggingssiden. Dette er ikke ekte tilgangskontroll.
const datanokkel = "littleBabySamlinger-v1";
const portal = document.querySelector("#portal");
const innhold = document.querySelector("#samlinger");
const statusmelding = document.querySelector("#statusmelding");
const navnefelt = document.querySelector("#nytt-navn");
let rolle;
let samlinger = [];
let visning = "liste";

function nyId() {
    return crypto.randomUUID();
}

// Hent tidligere huskeliste slik at eksisterende oppgaver blir med videre.
function gamleOppgaver(eier) {
    const lagret = sessionStorage.getItem(`littleBabyOppgaver-${eier}`);
    if (lagret) {
        const data = JSON.parse(lagret);
        if (Array.isArray(data) && data.every(o => o && typeof o.tekst === "string" && typeof o.ferdig === "boolean")) {
            return data.map(o => ({ ...o, id: nyId() }));
        }
    }
    return [{ id: nyId(), tekst: eier === "mor" ? "Pakke min veske" : "Lade kameraet", ferdig: false }];
}

function startSide() {
    try {
        rolle = sessionStorage.getItem("littleBabyRolle");
        if (!["mor", "far"].includes(rolle)) {
            window.location.replace("innlogging.html");
            return;
        }
        const lagret = sessionStorage.getItem(datanokkel);
        if (lagret !== null) {
            samlinger = JSON.parse(lagret);
            if (!Array.isArray(samlinger)) throw new Error("Ugyldige data");
        } else {
            // Begge får en egen privat huskeliste og kalender.
            for (const eier of ["mor", "far"]) {
                samlinger.push({ id: nyId(), eier, type: "liste", navn: "Min huskeliste", deling: "privat", elementer: gamleOppgaver(eier) });
                samlinger.push({ id: nyId(), eier, type: "kalender", navn: "Mine avtaler", deling: "privat", elementer: [] });
            }
            sessionStorage.setItem(datanokkel, JSON.stringify(samlinger));
        }
        // Ferdig godtatte eksempeldelinger, én fra hver forelder.
        // Faste ID-er hindrer duplikater og bevarer endringer i eksempellistene.
        for (const eier of ["mor", "far"]) {
            const id = `eksempelliste-${eier}`;
            if (!samlinger.some(s => s.id === id)) {
                samlinger.push({
                    id,
                    eier,
                    type: "liste",
                    navn: eier === "mor" ? "Innkjøp til babyen (eksempel)" : "Til stellevesken (eksempel)",
                    deling: "godtatt",
                    elementer: (eier === "mor"
                        ? ["Kjøpe bleier", "Finne frem klær", "Pakke ekstra skift"]
                        : ["Legge inn bleier", "Pakke stelleunderlag", "Finne frem kluter"]
                    ).map((tekst, indeks) => ({ id: nyId(), tekst, ferdig: indeks === 1 }))
                });
            }
        }
        sessionStorage.setItem(datanokkel, JSON.stringify(samlinger));
        document.querySelector("#hilsen").textContent = rolle === "mor" ? "Hei, mamma!" : "Hei, pappa!";
        tegnSide();
        portal.hidden = false;
    } catch {
        // Vis en feil uten å overskrive lagrede data.
        const melding = document.createElement("p");
        melding.textContent = "Kunne ikke åpne demoen. Kontroller at nettleseren tillater lagring, og prøv igjen.";
        melding.setAttribute("role", "alert");
        document.body.append(melding);
    }
}

// Lagre før skjermen oppdateres. Ved feil gjenopprettes forrige tilstand.
function endre(handling, melding) {
    const tidligere = JSON.stringify(samlinger);
    try {
        handling();
        sessionStorage.setItem(datanokkel, JSON.stringify(samlinger));
    } catch {
        samlinger = JSON.parse(tidligere);
        statusmelding.textContent = "Endringen kunne ikke lagres. Prøv igjen.";
        return false;
    }
    tegnSide();
    statusmelding.textContent = melding;
    return true;
}

// ===== HJELPERE FOR HTML =====
// textContent hindrer at brukerens tekst tolkes som HTML-kode.
function element(tag, tekst, klasse) {
    const node = document.createElement(tag);
    if (tekst !== undefined) node.textContent = tekst;
    if (klasse) node.className = klasse;
    return node;
}

function knapp(tekst, handling, klasse = "tekstknapp") {
    const node = element("button", tekst, klasse);
    node.type = "button";
    node.addEventListener("click", handling);
    return node;
}

function kanRedigere(samling) {
    return !samling.slettet && (samling.eier === rolle || samling.deling === "godtatt");
}

// ===== FANER OG KORT =====
function tegnSide() {
    const delt = visning === "delt";
    document.querySelector("#oppretting").hidden = delt;
    document.querySelector("#opprett-tittel").textContent = visning === "kalender" ? "Opprett kalender" : "Opprett liste";
    const titler = { liste: "Mine lister", kalender: "Mine kalendere", delt: "Delt med meg" };
    document.querySelector("#innhold-tittel").textContent = titler[visning];
    document.querySelectorAll("[data-visning]").forEach(node => {
        node.setAttribute("aria-pressed", String(node.dataset.visning === visning));
    });
    innhold.replaceChildren();
    const synlige = samlinger.filter(s => !s.slettet && (delt
        ? s.eier !== rolle && ["venter", "godtatt"].includes(s.deling)
        : s.eier === rolle && s.type === visning));
    if (!synlige.length) innhold.append(element("p", delt ? "Ingen delinger ennå." : "Du har ingen her ennå. Opprett en ovenfor.", "hjelpetekst"));
    synlige.forEach(tegnSamling);
}

function tegnSamling(samling) {
    const kort = element("article", undefined, "kort");
    const topp = element("div", undefined, "korttopp");
    topp.append(element("h3", samling.navn));
    const statuser = { privat: "Privat", venter: "Venter på svar", godtatt: "Delt", avslatt: "Deling avsluttet" };
    topp.append(element("span", statuser[samling.deling], "merkelapp"));
    kort.append(topp);
    if (samling.id.startsWith("eksempelliste-")) {
        kort.append(element("p", "Eksempeldata: Delingen er allerede godtatt for demonstrasjonen. Du kan endre listen eller stoppe delingen.", "hjelpetekst"));
    }
    const min = samling.eier === rolle;
    kort.append(element("p", `${samling.type === "liste" ? "Huskeliste" : "Kalender"} · ${min ? "Opprettet av deg" : `Fra ${samling.eier}`}`, "hjelpetekst"));

    // Mottakeren ser ikke innhold før delingen er godtatt.
    if (!min && samling.deling === "venter") {
        kort.append(element("p", "Vil du dele dette innholdet? Etter godkjenning kan begge legge til og fjerne innhold."));
        const valg = element("div", undefined, "delingsknapper");
        valg.append(
            knapp("Godta", () => endre(() => { samling.deling = "godtatt"; }, "Delingen er godtatt."), "hovedknapp"),
            knapp("Avslå", () => endre(() => { samling.deling = "avslatt"; }, "Delingen er avslått."))
        );
        kort.append(valg);
    } else {
        tegnElementer(samling, kort);
        if (kanRedigere(samling)) tegnSkjema(samling, kort);
    }

    // Eieren bestemmer hva som deles. Mottakeren kan forlate delingen.
    if (min) {
        const aktiv = ["venter", "godtatt"].includes(samling.deling);
        kort.append(knapp(aktiv ? "Stopp deling" : `Del med ${rolle === "mor" ? "far" : "mor"}`, () => {
            endre(() => { samling.deling = aktiv ? "privat" : "venter"; }, aktiv ? "Delingen er stoppet." : "Forespørselen er sendt.");
        }));
        kort.append(element("p", samling.deling === "godtatt" ? "Begge kan redigere. Nye endringer deles også." : "Bare denne listen eller kalenderen deles når du velger det.", "hjelpetekst"));
        if (samling.type === "liste") {
            // Bekreft sletting på siden, også i innebygd mobil-preview.
            const bekreftelse = element("div", undefined, "slettebekreftelse");
            bekreftelse.hidden = true;
            bekreftelse.append(element("p", "Slette hele listen? Oppgavene fjernes også hos den andre forelderen hvis listen er delt."));
            const slettKnapp = knapp("Slett liste", () => {
                bekreftelse.hidden = false;
                slettKnapp.hidden = true;
                jaKnapp.focus();
            });
            const jaKnapp = knapp("Ja, slett listen", () => {
                if (samling.eier !== rolle) return;
                if (endre(() => {
                    // Behold bare en slettemarkering, så eksempellisten ikke
                    // opprettes igjen ved oppdatering. Innholdet fjernes.
                    samling.slettet = true;
                    samling.elementer = [];
                    samling.deling = "privat";
                }, "Listen er slettet.")) {
                    navnefelt.focus();
                }
            }, "hovedknapp");
            const avbrytKnapp = knapp("Avbryt", () => {
                bekreftelse.hidden = true;
                slettKnapp.hidden = false;
                slettKnapp.focus();
            });
            bekreftelse.append(jaKnapp, avbrytKnapp);
            kort.append(slettKnapp, bekreftelse);
        }
    } else if (samling.deling === "godtatt") {
        kort.append(knapp("Forlat delingen", () => endre(() => { samling.deling = "avslatt"; }, "Du har forlatt delingen.")));
    }
    innhold.append(kort);
}

// ===== OPPGAVER OG AVTALER =====
function tegnElementer(samling, kort) {
    const liste = element("ul", undefined, "oppgaveliste");
    const poster = [...samling.elementer];
    if (samling.type === "kalender") poster.sort((a, b) => `${a.dato} ${a.tid}`.localeCompare(`${b.dato} ${b.tid}`));
    if (!poster.length) kort.append(element("p", "Ingen innhold ennå.", "hjelpetekst"));
    poster.forEach(post => {
        const rad = element("li");
        const etikett = element(samling.type === "liste" ? "label" : "div", undefined, "oppgave");
        const slett = knapp("×", () => {
            if (!kanRedigere(samling)) return;
            endre(() => { samling.elementer = samling.elementer.filter(p => p.id !== post.id); }, "Innholdet er slettet.");
        }, "fjernknapp");
        slett.setAttribute("aria-label", `Slett ${post.tekst}`);
        slett.title = "Slett";
        if (samling.type === "liste") {
            const boks = element("input");
            boks.type = "checkbox";
            boks.checked = post.ferdig;
            slett.hidden = !post.ferdig;
            boks.addEventListener("change", () => {
                if (!kanRedigere(samling)) return;
                const gammel = post.ferdig;
                const ok = endre(() => { post.ferdig = boks.checked; }, boks.checked ? "Oppgaven er fullført." : "Oppgaven er ikke fullført.");
                if (!ok) boks.checked = gammel;
            });
            etikett.append(boks, element("span", post.tekst));
        } else {
            const dato = new Date(`${post.dato}T12:00:00`).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
            etikett.append(element("span", `${dato}${post.tid ? ` kl. ${post.tid}` : ""} – ${post.tekst}`));
        }
        rad.append(etikett, slett);
        liste.append(rad);
    });
    kort.append(liste);
}

function tegnSkjema(samling, kort) {
    const skjema = element("form", undefined, "innholdsskjema");
    const tekstId = `tekst-${samling.id}`;
    const label = element("label", samling.type === "liste" ? "Ny oppgave" : "Ny avtale");
    label.htmlFor = tekstId;
    const felt = element("input");
    felt.id = tekstId;
    felt.type = "text";
    felt.required = true;
    felt.maxLength = 120;
    skjema.append(label, felt);
    let dato, tid;
    if (samling.type === "kalender") {
        // Dato er påkrevd. Klokkeslett er valgfritt.
        dato = element("input"); dato.type = "date"; dato.required = true; dato.id = `dato-${samling.id}`;
        tid = element("input"); tid.type = "time"; tid.id = `tid-${samling.id}`;
        const datolabel = element("label", "Dato"); datolabel.htmlFor = dato.id;
        const tidlabel = element("label", "Klokkeslett (valgfritt)"); tidlabel.htmlFor = tid.id;
        skjema.append(datolabel, dato, tidlabel, tid);
    }
    const leggTil = element("button", "Legg til", "hovedknapp");
    leggTil.type = "submit";
    skjema.append(leggTil);
    skjema.addEventListener("submit", hendelse => {
        hendelse.preventDefault();
        if (!felt.value.trim() || !kanRedigere(samling)) {
            statusmelding.textContent = "Skriv inn en tekst først.";
            felt.focus(); return;
        }
        endre(() => samling.elementer.push({
            id: nyId(), tekst: felt.value.trim(),
            ...(samling.type === "liste" ? { ferdig: false } : { dato: dato.value, tid: tid.value })
        }), samling.type === "liste" ? "Oppgaven er lagt til." : "Avtalen er lagt til.");
    });
    kort.append(skjema);
}

// ===== OPPRETTING, NAVIGASJON OG UTLOGGING =====
document.querySelectorAll("[data-visning]").forEach(node => {
    node.addEventListener("click", () => { visning = node.dataset.visning; statusmelding.textContent = ""; tegnSide(); });
});
document.querySelector("#opprett-skjema").addEventListener("submit", hendelse => {
    hendelse.preventDefault();
    const navn = navnefelt.value.trim();
    if (!navn || !["liste", "kalender"].includes(visning)) return;
    if (endre(() => samlinger.push({ id: nyId(), eier: rolle, type: visning, navn, deling: "privat", elementer: [] }), "Opprettet som privat.")) {
        navnefelt.value = "";
    }
});
document.querySelector("#logg-ut").addEventListener("click", () => {
    try { sessionStorage.removeItem("littleBabyRolle"); }
    finally { window.location.replace("innlogging.html"); }
});
startSide();
