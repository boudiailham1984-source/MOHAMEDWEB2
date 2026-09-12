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

const voiceProfileStatus =
    document.getElementById("voiceProfileStatus");

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

let voiceProfileName = "original";

// Les noms varient selon Android, Chrome et le moteur vocal.
// On cherche des indices connus, sans supposer que "female/male" est
// une propriété standard de SpeechSynthesisVoice.
const maleVoiceHints = [
    "male", "homme", "man", "male voice",
    "thomas", "paul", "pierre", "jean", "henri",
    "daniel", "nicolas", "antoine", "luc", "marc",
    "george", "david", "james", "alex", "antoine"
];

function isLikelyMaleVoice(voice) {
    const name = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
    return maleVoiceHints.some(hint => name.includes(hint));
}

function findLikelyMaleVoice() {
    return voices.find(isLikelyMaleVoice) || null;
}

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

function setVoiceProfileStatus(message) {
    if (voiceProfileStatus) {
        voiceProfileStatus.textContent = message || "";
    }
}

function selectVoiceObject(voice) {
    const index = voices.indexOf(voice);
    if (index >= 0) {
        voiceSelect.value = String(index);
        return true;
    }
    return false;
}

function applyVoiceProfile(profile, showStatus = true) {
    voiceProfileName = profile || "original";

    if (voiceProfileName === "homme" ||
        voiceProfileName === "homme-profond") {

        const maleVoice = findLikelyMaleVoice();

        if (maleVoice) {
            selectVoiceObject(maleVoice);

            // On modifie aussi légèrement la hauteur pour renforcer
            // le rendu grave, sans prétendre créer une nouvelle voix.
            if (voiceProfileName === "homme-profond") {
                pitch.value = "0.55";
                speed.value = "0.95";
            } else {
                pitch.value = "0.8";
                speed.value = "1";
            }

            if (showStatus) {
                setVoiceProfileStatus(
                    `Voix sélectionnée : ${maleVoice.name}`
                );
            }
        } else {
            // Aucun vrai timbre masculin n'est exposé par le navigateur.
            // On ne remplace pas silencieusement la voix choisie.
            if (showStatus) {
                setVoiceProfileStatus(
                    "Aucune voix homme détectée sur cet appareil. Ajoute une voix masculine dans les réglages de synthèse vocale Android."
                );
            }
        }
        return;
    }

    setVoiceProfileStatus("");
}

function loadVoices() {
    voices = speechSynthesis.getVoices();

    const previousValue = voiceSelect.value;
    voiceSelect.innerHTML = "";

    if (voices.length === 0) {
        const option = document.createElement("option");
        option.textContent = "Aucune voix détectée";
        voiceSelect.appendChild(option);
        return;
    }

    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${voice.name} — ${voice.lang}`;
        voiceSelect.appendChild(option);
    });

    // Conserver la voix précédemment choisie si elle existe encore.
    if (previousValue !== "" &&
        voices[Number(previousValue)]) {
        voiceSelect.value = previousValue;
    } else {
        const frenchVoice = voices.findIndex(
            voice => (voice.lang || "")
                .toLowerCase()
                .startsWith("fr")
        );

        voiceSelect.value =
            frenchVoice >= 0 ? String(frenchVoice) : "0";
    }

    // Si l'utilisateur a demandé Homme, réappliquer après voiceschanged.
    if (voiceProfileName !== "original") {
        applyVoiceProfile(voiceProfileName, true);
    }
}

if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

if (voiceProfile) {
    voiceProfile.addEventListener("change", function () {
        applyVoiceProfile(this.value, true);

        if (this.value === "homme" ||
            this.value === "homme-profond") {
            deepVoiceEnabled =
                this.value === "homme-profond";
            updateDeepVoiceUI();
        } else {
            deepVoiceEnabled = false;
            updateDeepVoiceUI();
        }

        updateCounter();
    });
}

voiceSelect.addEventListener("change", function () {
    // Une sélection manuelle doit être prioritaire.
    if (voiceProfile) {
        voiceProfile.value = "original";
    }
    voiceProfileName = "original";
    deepVoiceEnabled = false;
    updateDeepVoiceUI();
    setVoiceProfileStatus("");
});

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

    if (deepVoiceEnabled) {
        finalPitch = Math.min(finalPitch, 0.7);
    }

    if (voiceProfileName === "homme") {
        finalPitch = Math.min(finalPitch, 0.8);
    }

    if (voiceProfileName === "homme-profond") {
        finalPitch = Math.min(finalPitch, 0.55);
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

            if (voiceProfile) {
                voiceProfile.value = "homme-profond";
            }
            voiceProfileName = "homme-profond";
            applyVoiceProfile("homme-profond", true);
        } else {
            pitch.value = "1";
            pitchValue.textContent = "1.0";
            volume.value = "1";
            volumeValue.textContent = "100%";

            if (voiceProfile) {
                voiceProfile.value = "original";
            }
            voiceProfileName = "original";
            setVoiceProfileStatus("");
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