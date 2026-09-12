// ==========================================
// VOXIA V2
// ==========================================


// Récupération des éléments

const text = document.getElementById("text");

const voiceSelect =
    document.getElementById("voice");

const speed =
    document.getElementById("speed");

const volume =
    document.getElementById("volume");

const pitch =
    document.getElementById("pitch");

const speedValue =
    document.getElementById("speedValue");

const volumeValue =
    document.getElementById("volumeValue");

const pitchValue =
    document.getElementById("pitchValue");

const deepVoiceButton =
    document.getElementById("deepVoiceButton");

const deepVoiceValue =
    document.getElementById("deepVoiceValue");

const voiceProfile =
    document.getElementById("voiceProfile");

let voiceProfileValue = "original";

// Noms souvent utilisés par les moteurs pour des voix masculines.
// La disponibilité dépend du navigateur et des voix installées.
const likelyMaleNames = [
    "henri", "paul", "thomas", "daniel", "pierre",
    "nicolas", "jean", "antoine", "luc", "marc",
    "male", "homme", "male voice"
];

function findLikelyMaleVoice() {
    return voices.findIndex(voice => {
        const name = (voice.name || "").toLowerCase();
        return likelyMaleNames.some(key => name.includes(key));
    });
}

function applyVoiceProfile(profile) {
    voiceProfileValue = profile;

    if (profile === "original") {
        deepVoiceEnabled = false;
        pitch.value = "1";
        speed.value = "1";
        volume.value = "1";
    }

    if (profile === "homme") {
        deepVoiceEnabled = false;
        const maleIndex = findLikelyMaleVoice();

        if (maleIndex >= 0) {
            voiceSelect.value = String(maleIndex);
        }

        pitch.value = "0.85";
        speed.value = "0.95";
        volume.value = "1";
    }

    if (profile === "homme-profond") {
        deepVoiceEnabled = true;
        const maleIndex = findLikelyMaleVoice();

        if (maleIndex >= 0) {
            voiceSelect.value = String(maleIndex);
        }

        pitch.value = "0.55";
        speed.value = "0.92";
        volume.value = "0.95";
    }

    if (profile === "grave") {
        deepVoiceEnabled = true;
        pitch.value = "0.65";
        speed.value = "0.9";
        volume.value = "0.95";
    }

    pitchValue.textContent = Number(pitch.value).toFixed(1);
    speedValue.textContent = `${Number(speed.value).toFixed(1)}×`;
    volumeValue.textContent =
        `${Math.round(Number(volume.value) * 100)}%`;

    updateDeepVoiceUI();
}



const charCount =
    document.getElementById("charCount");

const speakButton =
    document.getElementById("speakButton");

const pauseButton =
    document.getElementById("pauseButton");

const stopButton =
    document.getElementById("stopButton");

const clearButton =
    document.getElementById("clearButton");

const saveButton =
    document.getElementById("saveButton");

const micButton =
    document.getElementById("micButton");

const micStatus =
    document.getElementById("micStatus");

const translateButton =
    document.getElementById("translateButton");

const sourceLang =
    document.getElementById("sourceLang");

const targetLang =
    document.getElementById("targetLang");

const swapLangButton =
    document.getElementById("swapLangButton");

const translationStatus =
    document.getElementById("translationStatus");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById(
        "clearHistoryButton"
    );

const themeButton =
    document.getElementById("themeButton");

const settingsButton =
    document.getElementById(
        "settingsButton"
    );

const settingsPanel =
    document.getElementById(
        "settingsPanel"
    );

const closeSettingsButton =
    document.getElementById(
        "closeSettingsButton"
    );

const autoSpeak =
    document.getElementById("autoSpeak");

const animations =
    document.getElementById("animations");

const statusText =
    document.getElementById("statusText");


// ==========================================
// VOIX
// ==========================================

let voices = [];
let deepVoiceEnabled = false;

function updateDeepVoiceUI() {

    deepVoiceButton.textContent =
        deepVoiceEnabled ? "Désactiver" : "Activer";

    deepVoiceValue.textContent =
        deepVoiceEnabled ? "On" : "Off";

    deepVoiceButton.classList.toggle(
        "active",
        deepVoiceEnabled
    );
}


function loadVoices() {

    voices =
        speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";


    if (voices.length === 0) {

        const option =
            document.createElement("option");

        option.textContent =
            "Aucune voix détectée";

        voiceSelect.appendChild(option);

        return;
    }


    voices.forEach(
        (voice, index) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = index;

            option.textContent =
                `${voice.name} — ${voice.lang}`;

            voiceSelect.appendChild(
                option
            );
        }
    );


    // Priorité au français

    const frenchVoice =
        voices.findIndex(
            voice =>
                voice.lang
                    .toLowerCase()
                    .startsWith("fr")
        );


    if (frenchVoice >= 0) {

        voiceSelect.value =
            frenchVoice;
    }
}


if ("speechSynthesis" in window) {

    speechSynthesis.onvoiceschanged =
        loadVoices;

    loadVoices();
}


// ==========================================
// STATUT
// ==========================================

function setStatus(message) {

    statusText.innerHTML =
        `<span></span>${message}`;
}


// ==========================================
// COMPTEUR
// ==========================================

function updateCounter() {

    const count =
        text.value.length;

    charCount.textContent =
        `${count.toLocaleString("fr-FR")} caractère${count > 1 ? "s" : ""}`;
}


text.addEventListener(
    "input",
    updateCounter
);

updateCounter();


// ==========================================
// LIRE
// ==========================================

function speakText() {

    const message =
        text.value.trim();


    if (!message) {

        alert(
            "✍️ Écris d'abord un texte."
        );

        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Ton navigateur ne prend pas en charge la synthèse vocale."
        );

        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            message
        );


    const selectedVoice =
        voices[
            Number(
                voiceSelect.value
            )
        ];


    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

        utterance.lang =
            selectedVoice.lang;
    }


    utterance.rate =
        Number(speed.value);

    utterance.volume =
        Number(volume.value);

    let finalPitch = Number(pitch.value);

    if (voiceProfileValue === "homme-profond") {
        finalPitch = Math.min(finalPitch, 0.55);
    } else if (voiceProfileValue === "grave") {
        finalPitch = Math.min(finalPitch, 0.65);
    } else if (deepVoiceEnabled) {
        finalPitch = Math.min(finalPitch, 0.7);
    }

    utterance.pitch = finalPitch;


    utterance.onstart =
        function () {

            setStatus(
                "🔊 Lecture en cours..."
            );

            pauseButton.textContent =
                "⏸️ Pause";
        };


    utterance.onend =
        function () {

            setStatus(
                "🟢 Lecture terminée"
            );

            pauseButton.textContent =
                "⏸️ Pause";
        };


    utterance.onerror =
        function () {

            setStatus(
                "❌ Erreur de lecture"
            );
        };


    speechSynthesis.speak(
        utterance
    );
}


speakButton.addEventListener(
    "click",
    speakText
);


// ==========================================
// PAUSE / REPRENDRE
// ==========================================

pauseButton.addEventListener(
    "click",
    function () {

        if (
            !speechSynthesis.speaking
        ) {
            return;
        }


        if (
            speechSynthesis.paused
        ) {

            speechSynthesis.resume();

            pauseButton.textContent =
                "⏸️ Pause";

            setStatus(
                "🔊 Lecture en cours..."
            );

        } else {

            speechSynthesis.pause();

            pauseButton.textContent =
                "▶️ Reprendre";

            setStatus(
                "⏸️ Lecture en pause"
            );
        }

    }
);


// ==========================================
// ARRÊTER
// ==========================================

stopButton.addEventListener(
    "click",
    function () {

        speechSynthesis.cancel();

        pauseButton.textContent =
            "⏸️ Pause";

        setStatus(
            "⏹️ Lecture arrêtée"
        );

    }
);


// ==========================================
// EFFACER
// ==========================================

clearButton.addEventListener(
    "click",
    function () {

        text.value = "";

        speechSynthesis.cancel();

        updateCounter();

        setStatus(
            "🟢 Prêt à parler"
        );

    }
);


// ==========================================
// VITESSE
// ==========================================

speed.addEventListener(
    "input",
    function () {

        speedValue.textContent =
            `${Number(speed.value).toFixed(1)}×`;

    }
);


// ==========================================
// VOLUME
// ==========================================

volume.addEventListener(
    "input",
    function () {

        const percent =
            Math.round(
                Number(volume.value) * 100
            );

        volumeValue.textContent =
            `${percent}%`;

    }
);


// ==========================================
// HAUTEUR
// ==========================================

pitch.addEventListener(
    "input",
    function () {

        pitchValue.textContent =
            Number(pitch.value)
                .toFixed(1);

    }
);


if (voiceProfile) {
    voiceProfile.addEventListener("change", function () {
        applyVoiceProfile(voiceProfile.value);
        setStatus(
            voiceProfile.value === "homme-profond"
                ? "🕶️ Voix homme profonde sélectionnée"
                : voiceProfile.value === "homme"
                    ? "👨 Voix homme sélectionnée"
                    : voiceProfile.value === "grave"
                        ? "🎧 Voix grave sélectionnée"
                        : "🟢 Voix originale"
        );
    });
}

deepVoiceButton.addEventListener(
    "click",
    function () {

        deepVoiceEnabled =
            !deepVoiceEnabled;

        if (deepVoiceEnabled) {
            pitch.value = "0.7";
            pitchValue.textContent = "0.7";
            volume.value = "0.85";
            volumeValue.textContent = "85%";
        } else {
            pitch.value = "1";
            pitchValue.textContent = "1.0";
            volume.value = "1";
            volumeValue.textContent = "100%";
        }

        if (voiceProfile) {
            voiceProfile.value = deepVoiceEnabled
                ? "grave"
                : "original";
            voiceProfileValue = voiceProfile.value;
        }

        updateDeepVoiceUI();
        setStatus(
            deepVoiceEnabled
                ? "🎧 Voix profonde activée"
                : "🟢 Voix normale"
        );
    }
);

updateDeepVoiceUI();


// ==========================================
// MICROPHONE
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;

let recognizing = false;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous =
        true;

    recognition.interimResults =
        true;


    recognition.onstart =
        function () {

            recognizing = true;

            micButton.innerHTML =
                "🔴 Écoute...";

            micStatus.textContent =
                "🎤 Parle maintenant...";
        };


    recognition.onresult =
        function (event) {

            let result = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                if (
                    event.results[i]
                        .isFinal
                ) {

                    result +=
                        event.results[i][0]
                            .transcript;
                }
            }


            if (result.trim()) {

                text.value +=
                    (text.value.trim()
                        ? " "
                        : "") +
                    result.trim();

                updateCounter();
            }
        };


    recognition.onerror =
        function (event) {

            micStatus.textContent =
                "❌ Microphone : " +
                event.error;
        };


    recognition.onend =
        function () {

            recognizing = false;

            micButton.innerHTML =
                "🎤 Parler";

            if (
                micStatus.textContent
                    .startsWith("🎤")
            ) {

                micStatus.textContent =
                    "";
            }
        };


    micButton.addEventListener(
        "click",
        function () {

            if (recognizing) {

                recognition.stop();

                return;
            }


            let language =
                sourceLang.value;


            if (language === "ar") {

                recognition.lang =
                    "ar-DZ";

            } else if (
                language === "en"
            ) {

                recognition.lang =
                    "en-US";

            } else if (
                language === "es"
            ) {

                recognition.lang =
                    "es-ES";

            } else if (
                language === "de"
            ) {

                recognition.lang =
                    "de-DE";

            } else if (
                language === "it"
            ) {

                recognition.lang =
                    "it-IT";

            } else {

                recognition.lang =
                    "fr-FR";
            }


            try {

                recognition.start();

            } catch (error) {

                micStatus.textContent =
                    "Le microphone est déjà actif.";
            }

        }
    );

} else {

    micButton.addEventListener(
        "click",
        function () {

            alert(
                "La reconnaissance vocale n'est pas disponible ici. Essaie Chrome ou Edge."
            );

        }
    );
}


// ==========================================
// TRADUCTION
// ==========================================

async function translateText() {

    const message =
        text.value.trim();


    if (!message) {

        alert(
            "✍️ Écris un texte à traduire."
        );

        return;
    }


    if (
        sourceLang.value ===
        targetLang.value
    ) {

        alert(
            "Choisis deux langues différentes."
        );

        return;
    }


    translationStatus.textContent =
        "🌍 Traduction en cours...";


    translateButton.disabled =
        true;


    try {

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(message) +
            "&langpair=" +
            encodeURIComponent(
                sourceLang.value +
                "|" +
                targetLang.value
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Service indisponible"
            );
        }


        const data =
            await response.json();


        const translated =
            data.responseData &&
            data.responseData.translatedText;


        if (!translated) {

            throw new Error(
                "Traduction impossible"
            );
        }


        text.value =
            translated;


        updateCounter();


        translationStatus.textContent =
            "✅ Traduction terminée";


        setStatus(
            "🌍 Texte traduit"
        );


        if (
            autoSpeak.checked
        ) {

            setTimeout(
                speakText,
                300
            );
        }


    } catch (error) {

        translationStatus.textContent =
            "";

        alert(
            "❌ Impossible de traduire. Vérifie ta connexion Internet."
        );

    } finally {

        translateButton.disabled =
            false;
    }
}


translateButton.addEventListener(
    "click",
    translateText
);


// ==========================================
// INVERSER LES LANGUES
// ==========================================

swapLangButton.addEventListener(
    "click",
    function () {

        const source =
            sourceLang.value;

        sourceLang.value =
            targetLang.value;

        targetLang.value =
            source;

    }
);


// ==========================================
// HISTORIQUE
// ==========================================

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "voxia_history"
            ) || "[]"
        );

    } catch {

        return [];
    }
}


function saveToHistory() {

    const message =
        text.value.trim();


    if (!message) {

        alert(
            "Il n'y a aucun texte à sauvegarder."
        );

        return;
    }


    const history =
        getHistory();


    history.unshift({

        id: Date.now(),

        text: message,

        date:
            new Date()
                .toLocaleString("fr-FR")
    });


    localStorage.setItem(

        "voxia_history",

        JSON.stringify(
            history.slice(0, 20)
        )
    );


    renderHistory();


    setStatus(
        "💾 Texte sauvegardé"
    );
}


saveButton.addEventListener(
    "click",
    saveToHistory
);


// ==========================================
// AFFICHER HISTORIQUE
// ==========================================

function renderHistory() {

    const history =
        getHistory();


    if (!history.length) {

        historyList.innerHTML =
            `<div class="empty">
                Aucun texte sauvegardé pour le moment.
            </div>`;

        return;
    }


    historyList.innerHTML =
        "";


    history.forEach(
        function (item) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "history-item";


            const info =
                document.createElement(
                    "div"
                );


            const message =
                document.createElement(
                    "div"
                );

            message.className =
                "history-text";

            message.textContent =
                item.text;


            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "history-date";

            date.textContent =
                item.date;


            info.appendChild(
                message
            );

            info.appendChild(
                date
            );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "history-actions";


            // Charger

            const use =
                document.createElement(
                    "button"
                );

            use.textContent =
                "↩️";


            use.title =
                "Charger";


            use.onclick =
                function () {

                    text.value =
                        item.text;

                    updateCounter();

                    setStatus(
                        "↩️ Texte chargé"
                    );
                };


            // Lire

            const play =
                document.createElement(
                    "button"
                );

            play.textContent =
                "▶️";


            play.title =
                "Lire";


            play.onclick =
                function () {

                    text.value =
                        item.text;

                    updateCounter();

                    speakText();
                };


            // Supprimer

            const remove =
                document.createElement(
                    "button"
                );

            remove.textContent =
                "✕";


            remove.title =
                "Supprimer";


            remove.onclick =
                function () {

                    deleteHistory(
                        item.id
                    );
                };


            actions.appendChild(
                use
            );

            actions.appendChild(
                play
            );

            actions.appendChild(
                remove
            );


            row.appendChild(
                info
            );

            row.appendChild(
                actions
            );


            historyList.appendChild(
                row
            );

        }
    );
}


// ==========================================
// SUPPRIMER UN ÉLÉMENT
// ==========================================

function deleteHistory(id) {

    const history =
        getHistory().filter(
            item =>
                item.id !== id
        );


    localStorage.setItem(

        "voxia_history",

        JSON.stringify(history)
    );


    renderHistory();
}


// ==========================================
// SUPPRIMER TOUT
// ==========================================

clearHistoryButton.addEventListener(
    "click",
    function () {

        const history =
            getHistory();


        if (!history.length) {

            return;
        }


        if (
            confirm(
                "Supprimer tout l'historique ?"
            )
        ) {

            localStorage.removeItem(
                "voxia_history"
            );

            renderHistory();

            setStatus(
                "🗑️ Historique effacé"
            );
        }

    }
);


renderHistory();


// ==========================================
// MODE SOMBRE / CLAIR
// ==========================================

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light"
        );


        const light =
            document.body.classList.contains(
                "light"
            );


        themeButton.textContent =
            light ? "☀️" : "🌙";


        localStorage.setItem(
            "voxia_theme",
            light ? "light" : "dark"
        );

    }
);


// Charger le thème

if (
    localStorage.getItem(
        "voxia_theme"
    ) === "light"
) {

    document.body.classList.add(
        "light"
    );

    themeButton.textContent =
        "☀️";
}


// ==========================================
// REGLAGES
// ==========================================

settingsButton.addEventListener(
    "click",
    function () {

        settingsPanel.classList.add(
            "open"
        );

    }
);


closeSettingsButton.addEventListener(
    "click",
    function () {

        settingsPanel.classList.remove(
            "open"
        );

    }
);


settingsPanel.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            settingsPanel
        ) {

            settingsPanel.classList.remove(
                "open"
            );
        }

    }
);


// Lecture automatique

autoSpeak.checked =
    localStorage.getItem(
        "voxia_autoSpeak"
    ) === "true";


autoSpeak.addEventListener(
    "change",
    function () {

        localStorage.setItem(

            "voxia_autoSpeak",

            autoSpeak.checked
        );

    }
);


// Animations

animations.addEventListener(
    "change",
    function () {

        document.body.style
            .setProperty(
                "--animation",
                animations.checked
                    ? "1"
                    : "0"
            );

    }
);


// ==========================================
// RACCOURCIS CLAVIER
// ==========================================

// Ctrl + Entrée = Lire

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            speakText();
        }


        // Échap = arrêter

        if (
            event.key === "Escape"
        ) {

            speechSynthesis.cancel();

            settingsPanel.classList.remove(
                "open"
            );

            setStatus(
                "⏹️ Lecture arrêtée"
            );
        }

    }
);