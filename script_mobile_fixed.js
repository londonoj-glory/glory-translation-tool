// Glory Translation Tool - Mobile Optimized Version
class MobileOptimizedTranslationTool {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.initializeEventListeners();
        this.initializeStorage();
        this.initRecognition();
        this.loadVoices();
        this.loadSettings();
        this.loadAnalytics();
        this.initializeCharts();
        this.updateLanguageCount();
    }

    initializeElements() {
        this.elements = {
            // Navigation
            navTabs: document.querySelectorAll('.nav-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Translator
            languageSelect: document.getElementById('language-select'),
            serviceSelect: document.getElementById('service-select'),
            timeSelect: document.getElementById('time-select'),
            recordBtn: document.getElementById('record-btn'),
            playTranslationBtn: document.getElementById('play-translation-btn'),
            stopAudioBtn: document.getElementById('stop-audio-btn'),
            waveCanvas: document.getElementById('wave-canvas'),
            timerDiv: document.getElementById('timer'),
            historyDiv: document.getElementById('history'),
            saveBtn: document.getElementById('save-btn'),
            translationCount: document.getElementById('translation-count'),
            audioVisualizer: document.querySelector('.audio-visualizer'),
            statusText: document.querySelector('.status-text'),
            recordBtnText: document.querySelector('.btn-text'),
            languageCount: document.getElementById('language-count'),
            
            // Analytics
            totalRecordings: document.getElementById('total-recordings'),
            totalTime: document.getElementById('total-time'),
            languagesUsed: document.getElementById('languages-used'),
            daysActive: document.getElementById('days-active'),
            dailyChart: document.getElementById('dailyChart'),
            languageChart: document.getElementById('languageChart'),
            durationChart: document.getElementById('durationChart'),
            serviceChart: document.getElementById('serviceChart'),
            
            // Settings
            googleApiKey: document.getElementById('google-api-key'),
            azureApiKey: document.getElementById('azure-api-key'),
            deeplApiKey: document.getElementById('deepl-api-key'),
            speechRate: document.getElementById('speech-rate'),
            speechPitch: document.getElementById('speech-pitch'),
            autoPlay: document.getElementById('auto-play'),
            themeSelect: document.getElementById('theme-select'),
            colorScheme: document.getElementById('color-scheme'),
            exportDataBtn: document.getElementById('export-data-btn'),
            importDataBtn: document.getElementById('import-data-btn'),
            importFile: document.getElementById('import-file'),
            clearDataBtn: document.getElementById('clear-data-btn'),
            speechRateValue: document.getElementById('speech-rate-value'),
            speechPitchValue: document.getElementById('speech-pitch-value'),
            
            // UI Elements
            loadingOverlay: document.getElementById('loading-overlay'),
            toastContainer: document.getElementById('toast-container')
        };
    }

    initializeState() {
        this.state = {
            // Recording state - MOBILE OPTIMIZED
            isRecording: false,
            recognition: null,
            audioContext: null,
            analyser: null,
            microphone: null,
            dataArray: null,
            bufferLength: null,
            timerInterval: null,
            timeLeft: 30,
            finalTranscript: '',
            interimTranscript: '',
            currentAnimation: null,
            
            // Mobile-optimized recognition settings
            recognitionActive: false,
            recognitionStarted: false,
            lastSpeechTime: null,
            recognitionTimeout: null,
            restartAttempts: 0,
            maxRestartAttempts: 2, // Reduced drastically
            silenceThreshold: 3000, // 3 seconds of silence before considering restart
            
            // Audio playback
            currentUtterance: null,
            isPlayingAudio: false,
            
            // Data
            history: [],
            voices: [],
            analytics: {
                daily: {},
                languages: {},
                durations: {},
                services: {}
            },
            
            // Settings
            settings: {
                speechRate: 1.0,
                speechPitch: 1.0,
                autoPlay: false,
                theme: 'light',
                colorScheme: 'blue'
            },
            
            // Storage keys
            storageKeys: {
                history: 'audio_translation_history',
                analytics: 'audio_translation_analytics',
                settings: 'audio_translation_settings'
            }
        };
    }

    // MOBILE-OPTIMIZED SPEECH RECOGNITION
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.showToast('Tu navegador no soporta el reconocimiento de voz', 'error');
            return;
        }

        this.state.recognition = new SpeechRecognition();
        
        // MOBILE-OPTIMIZED CONFIGURATION
        this.state.recognition.continuous = false; // Changed from true - more stable on mobile
        this.state.recognition.interimResults = true;
        this.state.recognition.maxAlternatives = 1;

        // ENHANCED ERROR HANDLING FOR MOBILE
        this.state.recognition.onresult = (event) => {
            this.state.lastSpeechTime = Date.now();
            this.state.interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.state.finalTranscript += transcript + ' ';
                    console.log('Final transcript received:', transcript);
                } else {
                    this.state.interimTranscript += transcript;
                }
            }
            
            this.updateStatusText('Procesando audio...');
            this.clearRecognitionTimeout();
        };

        this.state.recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error, event);
            
            switch (event.error) {
                case 'network':
                    this.showToast('Error de conexión. Verifica tu internet.', 'error');
                    this.forceStopRecording();
                    break;
                case 'aborted':
                    // User stopped - don't restart
                    console.log('Recognition aborted by user');
                    break;
                case 'no-speech':
                    this.updateStatusText('Habla más cerca del micrófono...');
                    this.handleNoSpeechError();
                    break;
                case 'not-allowed':
                    this.showToast('Permiso de micrófono denegado', 'error');
                    this.forceStopRecording();
                    break;
                case 'audio-capture':
                    this.showToast('Error accediendo al micrófono', 'error');
                    this.forceStopRecording();
                    break;
                default:
                    console.log('Unhandled recognition error:', event.error);
                    this.handleGenericError();
            }
        };

        this.state.recognition.onend = () => {
            console.log('Recognition ended. IsRecording:', this.state.isRecording);
            this.state.recognitionActive = false;
            
            if (this.state.isRecording) {
                this.checkIfShouldContinueRecording();
            }
        };

        this.state.recognition.onstart = () => {
            console.log('Recognition started successfully');
            this.state.recognitionActive = true;
            this.state.recognitionStarted = true;
            this.state.lastSpeechTime = Date.now();
            this.updateStatusText('Escuchando...');
            this.setRecognitionTimeout();
        };
    }

    // IMPROVED ERROR HANDLING METHODS
    handleNoSpeechError() {
        if (!this.state.isRecording) return;
        
        this.state.restartAttempts++;
        
        if (this.state.restartAttempts <= this.state.maxRestartAttempts) {
            console.log(`No speech detected, attempt ${this.state.restartAttempts}/${this.state.maxRestartAttempts}`);
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.restartRecognitionSafely();
                }
            }, 1000); // Longer delay for stability
        } else {
            this.updateStatusText('No se detectó audio. Finalizando...');
            setTimeout(() => this.finishRecording(), 1000);
        }
    }

    handleGenericError() {
        if (!this.state.isRecording) return;
        
        this.state.restartAttempts++;
        
        if (this.state.restartAttempts <= this.state.maxRestartAttempts) {
            console.log(`Generic error, restarting attempt ${this.state.restartAttempts}`);
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.restartRecognitionSafely();
                }
            }, 2000); // Even longer delay for stability
        } else {
            this.updateStatusText('Error persistente. Finalizando...');
            setTimeout(() => this.finishRecording(), 1000);
        }
    }

    checkIfShouldContinueRecording() {
        const selectedTime = parseInt(this.elements.timeSelect.value);
        const hasTimeLeft = selectedTime === 0 || (this.state.timeLeft && this.state.timeLeft > 0);
        const hasTranscript = this.state.finalTranscript.trim() || this.state.interimTranscript.trim();
        
        if (!hasTimeLeft) {
            console.log('Time limit reached, finishing recording');
            this.finishRecording();
            return;
        }

        if (hasTranscript) {
            // We have some speech, finish recording with what we have
            console.log('Speech detected, finishing recording');
            this.finishRecording();
            return;
        }

        // Check if we should restart for more speech
        if (this.state.restartAttempts < this.state.maxRestartAttempts) {
            console.log('No speech yet, restarting recognition');
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.restartRecognitionSafely();
                }
            }, 500);
        } else {
            console.log('Max restart attempts reached');
            this.finishRecording();
        }
    }

    setRecognitionTimeout() {
        this.clearRecognitionTimeout();
        
        // Set a timeout to restart recognition if no speech is detected
        this.state.recognitionTimeout = setTimeout(() => {
            if (this.state.isRecording && this.state.recognitionActive) {
                console.log('Recognition timeout reached');
                if (this.state.finalTranscript.trim() || this.state.interimTranscript.trim()) {
                    // We have speech, finish recording
                    this.finishRecording();
                } else {
                    // No speech, try to restart
                    this.handleNoSpeechError();
                }
            }
        }, 8000); // 8 seconds timeout - much more generous
    }

    clearRecognitionTimeout() {
        if (this.state.recognitionTimeout) {
            clearTimeout(this.state.recognitionTimeout);
            this.state.recognitionTimeout = null;
        }
    }

    restartRecognitionSafely() {
        if (!this.state.isRecording) return;
        
        console.log('Safely restarting recognition...');
        
        try {
            // Stop current recognition
            if (this.state.recognitionActive) {
                this.state.recognition.stop();
            }
        } catch (e) {
            console.log('Error stopping recognition:', e);
        }
        
        // Wait longer before restarting
        setTimeout(() => {
            if (this.state.isRecording) {
                this.startSpeechRecognition();
            }
        }, 1000);
    }

    forceStopRecording() {
        console.log('Force stopping recording');
        this.state.isRecording = false;
        this.state.recognitionActive = false;
        this.clearRecognitionTimeout();
        this.finishRecording();
    }

    // ENHANCED RECORDING METHODS
    async startRecording() {
        try {
            console.log('Starting recording...');
            this.state.isRecording = true;
            this.state.restartAttempts = 0;
            this.state.recognitionStarted = false;
            this.state.finalTranscript = '';
            this.state.interimTranscript = '';
            
            this.updateRecordingUI(true);
            this.startTimer();
            await this.setupAudioVisualization();
            this.startSpeechRecognition();
            this.showToast('Grabación iniciada - Habla claramente', 'success');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showToast('Error al iniciar la grabación', 'error');
            this.forceStopRecording();
        }
    }

    startSpeechRecognition() {
        if (!this.state.recognition) return;
        
        try {
            const langPair = this.elements.languageSelect.value;
            const langConfig = this.supportedLanguages[langPair];
            
            this.state.recognition.lang = langConfig.source;
            this.state.recognition.start();
            console.log('Speech recognition started for language:', langConfig.source);
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.handleGenericError();
        }
    }

    stopRecording() {
        console.log('Stopping recording...');
        this.state.isRecording = false;
        this.clearRecognitionTimeout();
        
        if (this.state.recognition && this.state.recognitionActive) {
            try {
                this.state.recognition.stop();
            } catch (e) {
                console.log('Error stopping recognition:', e);
            }
        }
        
        this.showToast('Grabación detenida', 'warning');
        // Don't call finishRecording here - let onend handle it
    }

    finishRecording() {
        console.log('Finishing recording...');
        this.state.isRecording = false;
        this.state.recognitionActive = false;
        this.clearRecognitionTimeout();
        
        this.updateRecordingUI(false);
        this.stopTimer();
        this.cleanupAudio();
        
        const finalText = this.state.finalTranscript.trim();
        const interimText = this.state.interimTranscript.trim();
        const combinedText = (finalText + ' ' + interimText).trim();
        
        console.log('Final transcript:', finalText);
        console.log('Interim transcript:', interimText);
        console.log('Combined text:', combinedText);
        
        if (combinedText) {
            this.translateAndAdd(combinedText);
        } else {
            this.showToast('No se detectó audio para traducir. Intenta hablar más cerca del micrófono.', 'warning');
        }
        
        // Reset state
        this.state.finalTranscript = '';
        this.state.interimTranscript = '';
        this.state.restartAttempts = 0;
    }

    // Continue with all other methods from original script...
    // (This is just the core recognition logic - the rest remains the same)

    // SUPPORTED LANGUAGES (same as original)
    get supportedLanguages() {
        return {
            'en-es': { source: 'en-US', target: 'es', display: '🇺🇸 Inglés → 🇪🇸 Español' },
            'es-en': { source: 'es-ES', target: 'en', display: '🇪🇸 Español → 🇺🇸 Inglés' },
            'en-fr': { source: 'en-US', target: 'fr', display: '🇺🇸 Inglés → 🇫🇷 Francés' },
            'fr-en': { source: 'fr-FR', target: 'en', display: '🇫🇷 Francés → 🇺🇸 Inglés' },
            'en-de': { source: 'en-US', target: 'de', display: '🇺🇸 Inglés → 🇩🇪 Alemán' },
            'de-en': { source: 'de-DE', target: 'en', display: '🇩🇪 Alemán → 🇺🇸 Inglés' },
            'en-it': { source: 'en-US', target: 'it', display: '🇺🇸 Inglés → 🇮🇹 Italiano' },
            'it-en': { source: 'it-IT', target: 'en', display: '🇮🇹 Italiano → 🇺🇸 Inglés' },
            'en-pt': { source: 'en-US', target: 'pt', display: '🇺🇸 Inglés → 🇵🇹 Portugués' },
            'pt-en': { source: 'pt-PT', target: 'en', display: '🇵🇹 Portugués → 🇺🇸 Inglés' },
            'es-fr': { source: 'es-ES', target: 'fr', display: '🇪🇸 Español → 🇫🇷 Francés' },
            'fr-es': { source: 'fr-FR', target: 'es', display: '🇫🇷 Francés → 🇪🇸 Español' },
            'en-ru': { source: 'en-US', target: 'ru', display: '🇺🇸 Inglés → 🇷🇺 Ruso' },
            'ru-en': { source: 'ru-RU', target: 'en', display: '🇷🇺 Ruso → 🇺🇸 Inglés' },
            'en-zh': { source: 'en-US', target: 'zh-cn', display: '🇺🇸 Inglés → 🇨🇳 Chino' },
            'zh-en': { source: 'zh-CN', target: 'en', display: '🇨🇳 Chino → 🇺🇸 Inglés' },
            'en-ja': { source: 'en-US', target: 'ja', display: '🇺🇸 Inglés → 🇯🇵 Japonés' },
            'ja-en': { source: 'ja-JP', target: 'en', display: '🇯🇵 Japonés → 🇺🇸 Inglés' }
        };
    }

    // REST OF THE METHODS (copy from original script.js)
    // Including: translateAndAdd, UI methods, analytics, settings, etc.
    // For brevity, I'm not copying all methods here, but they should be included
    
    initializeEventListeners() {
        // Navigation tabs
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Recording controls
        this.elements.recordBtn?.addEventListener('click', () => this.toggleRecording());
        this.elements.playTranslationBtn?.addEventListener('click', () => this.playLastTranslation());
        this.elements.stopAudioBtn?.addEventListener('click', () => this.stopAudio());

        // Settings controls
        this.elements.themeSelect?.addEventListener('change', () => this.applyTheme());
        this.elements.colorScheme?.addEventListener('change', () => this.applyTheme());
        
        // Other event listeners...
    }

    async toggleRecording() {
        if (!this.state.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    // Add all other necessary methods from the original script...
    // This is a foundation for the mobile-optimized version
}

// Initialize the mobile-optimized app
document.addEventListener('DOMContentLoaded', () => {
    window.translationApp = new MobileOptimizedTranslationTool();
});