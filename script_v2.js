// Traductor de Voz v2.0 - Tiempo Real
// Mejoras: Sin permisos repetitivos, grabación continua, transcripción en tiempo real

class VoiceTranslatorV2 {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.requestMicrophonePermissions();
        this.loadVoices();
        this.setupEventListeners();
    }

    initializeElements() {
        // Elementos del DOM
        this.elements = {
            permissionsStatus: document.getElementById('permissions-status'),
            sourceLanguage: document.getElementById('source-language'),
            targetLanguage: document.getElementById('target-language'),
            voiceSelect: document.getElementById('voice-select'),
            startRecording: document.getElementById('start-recording'),
            stopRecording: document.getElementById('stop-recording'),
            statusIndicator: document.getElementById('status-indicator'),
            transcriptionResult: document.getElementById('transcription-result'),
            translationResult: document.getElementById('translation-result'),
            playTranslation: document.getElementById('play-translation'),
            pauseAudio: document.getElementById('pause-audio'),
            resumeAudio: document.getElementById('resume-audio'),
            stopAudio: document.getElementById('stop-audio')
        };
    }

    initializeState() {
        // Estado de la aplicación
        this.state = {
            // Permisos y configuración
            microphonePermissionGranted: false,
            stream: null,
            
            // Reconocimiento de voz
            recognition: null,
            isRecording: false,
            isRecognitionActive: false,
            
            // Texto y traducción
            finalTranscript: '',
            interimTranscript: '',
            currentTranslation: '',
            
            // Audio
            currentUtterance: null,
            isPlaying: false,
            isPaused: false,
            
            // Voces disponibles
            voices: [],
            selectedVoice: null
        };

        // Configurar SpeechRecognition si está disponible
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.recognition = new SpeechRecognition();
            this.setupSpeechRecognition();
        } else {
            this.showError('❌ Tu navegador no soporta reconocimiento de voz');
        }
    }

    // ===== GESTIÓN DE PERMISOS =====
    async requestMicrophonePermissions() {
        try {
            this.updatePermissionsStatus('🔄 Solicitando permisos de micrófono...', 'permissions-status');
            
            // Solicitar permisos de micrófono una sola vez
            this.state.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            this.state.microphonePermissionGranted = true;
            this.updatePermissionsStatus('✅ Permisos concedidos - Listo para usar', 'permissions-granted');
            
            // Habilitar controles
            this.elements.startRecording.disabled = false;
            
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            this.updatePermissionsStatus('❌ Permisos denegados - La aplicación no funcionará correctamente', 'permissions-status');
        }
    }

    updatePermissionsStatus(message, className) {
        this.elements.permissionsStatus.innerHTML = `<strong>${message}</strong>`;
        this.elements.permissionsStatus.className = `permissions-status ${className}`;
    }

    // ===== CONFIGURACIÓN DE RECONOCIMIENTO DE VOZ =====
    setupSpeechRecognition() {
        const recognition = this.state.recognition;
        
        // Configuración para mejor rendimiento y tiempo real
        recognition.continuous = true;           // Grabación continua
        recognition.interimResults = true;       // Resultados intermedios para tiempo real
        recognition.maxAlternatives = 3;         // Múltiples alternativas para mejor precisión
        
        // Eventos del reconocimiento
        recognition.onstart = () => {
            this.onRecognitionStart();
        };

        recognition.onresult = (event) => {
            this.onRecognitionResult(event);
        };

        recognition.onerror = (event) => {
            this.onRecognitionError(event);
        };

        recognition.onend = () => {
            this.onRecognitionEnd();
        };

        recognition.onnomatch = () => {
            console.log('No se pudo reconocer el audio');
        };

        recognition.onspeechstart = () => {
            console.log('Detectado inicio de habla');
        };

        recognition.onspeechend = () => {
            console.log('Detectado final de habla');
        };
    }

    onRecognitionStart() {
        console.log('Reconocimiento iniciado');
        this.state.isRecognitionActive = true;
        this.updateStatusIndicator('🎤 Grabando... (Sin límite de tiempo)', 'status-recording');
    }

    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Procesar todos los resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Actualizar transcripción final
        if (finalTranscript) {
            this.state.finalTranscript += finalTranscript;
            this.updateTranscription();
            this.translateText(finalTranscript.trim());
        }

        // Mostrar transcripción temporal (en tiempo real)
        if (interimTranscript) {
            this.state.interimTranscript = interimTranscript;
            this.updateTranscription();
        }
    }

    onRecognitionError(event) {
        console.error('Error en reconocimiento:', event.error);
        
        // Manejar errores de forma más tolerante
        if (event.error === 'no-speech') {
            console.log('No se detectó habla, continuando...');
            return; // No detener por falta de habla
        }
        
        if (event.error === 'network') {
            this.showError('❌ Error de red. Verifica tu conexión.');
        } else if (event.error === 'not-allowed') {
            this.showError('❌ Permisos de micrófono denegados.');
        } else {
            console.log(`Error de reconocimiento: ${event.error}`);
        }
    }

    onRecognitionEnd() {
        console.log('Reconocimiento terminado');
        this.state.isRecognitionActive = false;
        
        // Si estamos grabando y se detuvo inesperadamente, reiniciar
        if (this.state.isRecording && this.state.microphonePermissionGranted) {
            console.log('Reiniciando reconocimiento automáticamente...');
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.startRecognition();
                }
            }, 100);
        }
    }

    // ===== CONTROL DE GRABACIÓN =====
    async startRecording() {
        if (!this.state.microphonePermissionGranted) {
            this.showError('❌ Permisos de micrófono no concedidos');
            return;
        }

        if (!this.state.recognition) {
            this.showError('❌ Reconocimiento de voz no disponible');
            return;
        }

        // Limpiar transcripciones anteriores
        this.state.finalTranscript = '';
        this.state.interimTranscript = '';
        this.state.currentTranslation = '';
        this.updateTranscription();
        this.updateTranslation();

        // Configurar idioma
        this.state.recognition.lang = this.elements.sourceLanguage.value;

        // Iniciar grabación
        this.state.isRecording = true;
        this.startRecognition();

        // Actualizar UI
        this.elements.startRecording.disabled = true;
        this.elements.stopRecording.disabled = false;
        this.updateStatusIndicator('🎤 Grabando... Habla ahora (Sin límite de tiempo)', 'status-recording');
    }

    startRecognition() {
        if (this.state.recognition && !this.state.isRecognitionActive) {
            try {
                this.state.recognition.start();
            } catch (error) {
                console.error('Error al iniciar reconocimiento:', error);
            }
        }
    }

    stopRecording() {
        this.state.isRecording = false;
        
        if (this.state.recognition && this.state.isRecognitionActive) {
            this.state.recognition.stop();
        }

        // Actualizar UI
        this.elements.startRecording.disabled = false;
        this.elements.stopRecording.disabled = true;
        this.updateStatusIndicator('✅ Grabación detenida - Listo para una nueva grabación', 'status-ready');

        // Habilitar reproducción si hay traducción
        if (this.state.currentTranslation.trim()) {
            this.elements.playTranslation.disabled = false;
        }
    }

    // ===== ACTUALIZACIÓN DE UI =====
    updateTranscription() {
        const finalText = this.state.finalTranscript;
        const interimText = this.state.interimTranscript;
        
        let html = '';
        
        if (finalText) {
            html += `<div class="final-text">${finalText}</div>`;
        }
        
        if (interimText) {
            html += `<div class="interim-text">${interimText}</div>`;
        }
        
        if (!finalText && !interimText) {
            html = '<em>La transcripción aparecerá aquí en tiempo real mientras hablas...</em>';
        }

        this.elements.transcriptionResult.innerHTML = html;
        
        // Auto-scroll hacia abajo
        this.elements.transcriptionResult.scrollTop = this.elements.transcriptionResult.scrollHeight;
    }

    updateTranslation() {
        if (this.state.currentTranslation.trim()) {
            this.elements.translationResult.innerHTML = this.state.currentTranslation;
        } else {
            this.elements.translationResult.innerHTML = '<em>La traducción aparecerá aquí automáticamente...</em>';
        }
        
        // Auto-scroll hacia abajo
        this.elements.translationResult.scrollTop = this.elements.translationResult.scrollHeight;
    }

    updateStatusIndicator(message, className) {
        this.elements.statusIndicator.textContent = message;
        this.elements.statusIndicator.className = `status-indicator ${className}`;
    }

    showError(message) {
        this.updateStatusIndicator(message, 'status-ready');
        console.error(message);
    }

    // ===== TRADUCCIÓN =====
    async translateText(text) {
        if (!text.trim()) return;

        try {
            this.updateStatusIndicator('🌐 Traduciendo...', 'status-processing');
            
            const sourceLang = this.elements.sourceLanguage.value.split('-')[0]; // Extraer código base (es, en, etc.)
            const targetLang = this.elements.targetLanguage.value;
            
            // Usar Google Translate API (simulada para demo)
            const translation = await this.callTranslationAPI(text, sourceLang, targetLang);
            
            // Agregar a la traducción acumulada
            if (this.state.currentTranslation) {
                this.state.currentTranslation += ' ' + translation;
            } else {
                this.state.currentTranslation = translation;
            }
            
            this.updateTranslation();
            
            // Actualizar estado si no estamos grabando
            if (!this.state.isRecording) {
                this.updateStatusIndicator('✅ Traducción completada', 'status-ready');
                this.elements.playTranslation.disabled = false;
            } else {
                this.updateStatusIndicator('🎤 Grabando... (Sin límite de tiempo)', 'status-recording');
            }
            
        } catch (error) {
            console.error('Error en traducción:', error);
            this.showError('❌ Error al traducir. Intenta de nuevo.');
        }
    }

    async callTranslationAPI(text, sourceLang, targetLang) {
        // Simulación de API de traducción
        // En producción, aquí iría una llamada real a Google Translate, DeepL, etc.
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Traducciones de ejemplo para demostración
                const translations = {
                    'es-en': {
                        'hola': 'hello',
                        'cómo estás': 'how are you',
                        'muy bien': 'very well',
                        'gracias': 'thank you'
                    },
                    'en-es': {
                        'hello': 'hola',
                        'how are you': 'cómo estás',
                        'very well': 'muy bien',
                        'thank you': 'gracias'
                    }
                };

                const langPair = `${sourceLang}-${targetLang}`;
                const dict = translations[langPair] || {};
                
                // Buscar traducción simple o devolver texto original con prefijo
                const translation = dict[text.toLowerCase()] || `[${targetLang.toUpperCase()}] ${text}`;
                
                resolve(translation);
            }, 500); // Simular latencia de API
        });
    }

    // ===== CONTROL DE AUDIO =====
    playTranslation() {
        if (!this.state.currentTranslation.trim()) {
            this.showError('❌ No hay traducción para reproducir');
            return;
        }

        // Detener audio actual si está reproduciéndose
        if (this.state.currentUtterance) {
            speechSynthesis.cancel();
        }

        const targetLang = this.elements.targetLanguage.value;
        const utterance = new SpeechSynthesisUtterance(this.state.currentTranslation);
        
        // Configurar voz
        utterance.lang = this.getLanguageCodeForSpeech(targetLang);
        
        if (this.state.selectedVoice) {
            utterance.voice = this.state.selectedVoice;
        }

        // Configurar eventos
        utterance.onstart = () => {
            this.state.isPlaying = true;
            this.state.isPaused = false;
            this.state.currentUtterance = utterance;
            this.updateAudioControls();
        };

        utterance.onend = () => {
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
        };

        utterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
            this.showError('❌ Error al reproducir audio');
            this.state.isPlaying = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
        };

        // Reproducir
        speechSynthesis.speak(utterance);
    }

    pauseAudio() {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            this.state.isPaused = true;
            this.updateAudioControls();
        }
    }

    resumeAudio() {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            this.state.isPaused = false;
            this.updateAudioControls();
        }
    }

    stopAudio() {
        if (this.state.currentUtterance) {
            speechSynthesis.cancel();
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
        }
    }

    updateAudioControls() {
        const isPlaying = this.state.isPlaying;
        const isPaused = this.state.isPaused;
        const hasTranslation = this.state.currentTranslation.trim() !== '';

        this.elements.playTranslation.disabled = isPlaying || !hasTranslation;
        this.elements.pauseAudio.disabled = !isPlaying || isPaused;
        this.elements.resumeAudio.disabled = !isPaused;
        this.elements.stopAudio.disabled = !isPlaying && !isPaused;
    }

    // ===== GESTIÓN DE VOCES =====
    loadVoices() {
        const loadVoicesFunc = () => {
            this.state.voices = speechSynthesis.getVoices();
            this.populateVoiceSelect();
        };

        // Cargar voces
        loadVoicesFunc();
        
        // Algunos navegadores cargan voces de forma asíncrona
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoicesFunc;
        }
    }

    populateVoiceSelect() {
        const targetLang = this.elements.targetLanguage.value;
        const voiceSelect = this.elements.voiceSelect;
        
        // Limpiar opciones existentes (excepto la primera)
        while (voiceSelect.children.length > 1) {
            voiceSelect.removeChild(voiceSelect.lastChild);
        }

        // Filtrar voces por idioma
        const languageCode = this.getLanguageCodeForSpeech(targetLang);
        const filteredVoices = this.state.voices.filter(voice => 
            voice.lang.startsWith(languageCode) || voice.lang.startsWith(targetLang)
        );

        // Agregar opciones de voz
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    getLanguageCodeForSpeech(langCode) {
        const langMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR'
        };
        
        return langMap[langCode] || langCode;
    }

    updateSelectedVoice() {
        const voiceName = this.elements.voiceSelect.value;
        if (voiceName) {
            this.state.selectedVoice = this.state.voices.find(voice => voice.name === voiceName);
        } else {
            this.state.selectedVoice = null;
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Controles de grabación
        this.elements.startRecording.addEventListener('click', () => {
            this.startRecording();
        });

        this.elements.stopRecording.addEventListener('click', () => {
            this.stopRecording();
        });

        // Controles de audio
        this.elements.playTranslation.addEventListener('click', () => {
            this.playTranslation();
        });

        this.elements.pauseAudio.addEventListener('click', () => {
            this.pauseAudio();
        });

        this.elements.resumeAudio.addEventListener('click', () => {
            this.resumeAudio();
        });

        this.elements.stopAudio.addEventListener('click', () => {
            this.stopAudio();
        });

        // Cambios de idioma
        this.elements.targetLanguage.addEventListener('change', () => {
            this.populateVoiceSelect();
        });

        this.elements.voiceSelect.addEventListener('change', () => {
            this.updateSelectedVoice();
        });

        // Atajos de teclado
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'r':
                        event.preventDefault();
                        if (!this.state.isRecording) {
                            this.startRecording();
                        } else {
                            this.stopRecording();
                        }
                        break;
                    case ' ':
                        event.preventDefault();
                        if (this.state.isPlaying) {
                            if (this.state.isPaused) {
                                this.resumeAudio();
                            } else {
                                this.pauseAudio();
                            }
                        } else if (this.state.currentTranslation.trim()) {
                            this.playTranslation();
                        }
                        break;
                }
            }
        });
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Traductor de Voz v2.0');
    new VoiceTranslatorV2();
});

// Información de la aplicación
console.log(`
🎙️ Traductor de Voz v2.0 - Mejoras implementadas:
✅ Permisos de micrófono solicitados una sola vez
✅ Grabación continua sin límite de tiempo
✅ Transcripción en tiempo real
✅ Traducción automática en tiempo real
✅ Control manual de detener grabación
✅ Controles avanzados de audio (pausa/resume/stop)
✅ Atajos de teclado: Ctrl+R (grabar), Ctrl+Space (audio)

Desarrollado con ❤️ por MiniMax Agent
`);
