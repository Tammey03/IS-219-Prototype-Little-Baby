// ===== DEMOINNLOGGING FOR LITTLE BABY =====
// JavaScript styrer hva som skjer når en knapp trykkes.

// Finn innloggingsknappene i HTML.
// På sider uten disse knappene vil listen være tom.
const innloggingsknapper = document.querySelectorAll(
    ".innloggingsside [data-rolle]"
);

// Finn tekstfeltet som skal vise eventuelle feil.
const feilmelding = document.querySelector(
    ".innloggingsside #feilmelding"
);

// Legg til en klikkhendelse på hver knapp.
innloggingsknapper.forEach((knapp) => {
    knapp.addEventListener("click", () => {
        // Les "mor" eller "far" fra knappens data-rolle.
        const rolle = knapp.dataset.rolle;

        try {
            // Husk valgt bruker i denne nettleserfanen.
            // Min side kan senere lese denne verdien.
            sessionStorage.setItem("littleBabyRolle", rolle);

            // Start på forsiden etter innlogging.
            window.location.href = "index.html";
        } catch {
            // Vis en forklaring hvis nettleseren blokkerer lagring.
            if (feilmelding) {
                feilmelding.textContent =
                    "Kunne ikke huske brukervalget. " +
                    "Kontroller at nettleseren tillater lagring.";

                feilmelding.hidden = false;
            }
        }
    });
});
