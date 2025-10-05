// Advanced Audio Translation Tool - Enterprise Version
class AdvancedAudioTranslationTool {
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
            // Recording state
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
            recognitionRetries: 0,
            maxRetries: 2, // MOBILE OPTIMIZED: Reduced
            currentUtterance: null,
            isPlayingAudio: false,
            
            // MOBILE OPTIMIZED: New state variables
            recognitionActive: false,
            lastSpeechTime: null,
            recognitionTimeout: null,
            
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
                apiKeys: {
                    google: '',
                    azure: '',
                    deepl: ''
                },
                audio: {
                    rate: 1.0,
                    pitch: 1.0,
                    autoPlay: false
                },
                appearance: {
                    theme: 'auto',
                    colorScheme: 'default'
                }
            },
            
            // Chart instances
            charts: {}
        };
        
        this.supportedLanguages = {
            'en-es': { source: 'en-US', target: 'es-ES', label: 'Inglés → Español' },
            'es-en': { source: 'es-ES', target: 'en-US', label: 'Español → Inglés' },
            'en-fr': { source: 'en-US', target: 'fr-FR', label: 'Inglés → Francés' },
            'fr-en': { source: 'fr-FR', target: 'en-US', label: 'Francés → Inglés' },
            'en-de': { source: 'en-US', target: 'de-DE', label: 'Inglés → Alemán' },
            'de-en': { source: 'de-DE', target: 'en-US', label: 'Alemán → Inglés' },
            'en-it': { source: 'en-US', target: 'it-IT', label: 'Inglés → Italiano' },
            'it-en': { source: 'it-IT', target: 'en-US', label: 'Italiano → Inglés' },
            'en-pt': { source: 'en-US', target: 'pt-PT', label: 'Inglés → Portugués' },
            'pt-en': { source: 'pt-PT', target: 'en-US', label: 'Portugués → Inglés' },
            'es-fr': { source: 'es-ES', target: 'fr-FR', label: 'Español → Francés' },
            'fr-es': { source: 'fr-FR', target: 'es-ES', label: 'Francés → Español' },
            'en-ru': { source: 'en-US', target: 'ru-RU', label: 'Inglés → Ruso' },
            'ru-en': { source: 'ru-RU', target: 'en-US', label: 'Ruso → Inglés' },
            'en-zh': { source: 'en-US', target: 'zh-CN', label: 'Inglés → Chino' },
            'zh-en': { source: 'zh-CN', target: 'en-US', label: 'Chino → Inglés' },
            'en-ja': { source: 'en-US', target: 'ja-JP', label: 'Inglés → Japonés' },
            'ja-en': { source: 'ja-JP', target: 'en-US', label: 'Japonés → Inglés' }
        };
    }

    initializeEventListeners() {
        // Navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Translator
        this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.elements.playTranslationBtn.addEventListener('click', () => this.playLastTranslation());
        this.elements.stopAudioBtn.addEventListener('click', () => this.stopAudioPlayback());
        this.elements.saveBtn.addEventListener('click', () => this.saveTranslations());
        this.elements.languageSelect.addEventListener('change', () => this.updateLanguageDisplay());
        this.elements.serviceSelect.addEventListener('change', () => this.updateServiceDisplay());
        this.elements.timeSelect.addEventListener('change', () => this.updateTimeDisplay());
        
        // Settings
        this.elements.speechRate.addEventListener('input', () => this.updateSpeechRate());
        this.elements.speechPitch.addEventListener('input', () => this.updateSpeechPitch());
        this.elements.autoPlay.addEventListener('change', () => this.updateAutoPlay());
        this.elements.themeSelect.addEventListener('change', () => this.updateTheme());
        this.elements.colorScheme.addEventListener('change', () => this.updateColorScheme());
        
        // Data management
        this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
        this.elements.importDataBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importData(e));
        this.elements.clearDataBtn.addEventListener('click', () => this.clearAllData());
        
        // API Keys
        this.elements.googleApiKey.addEventListener('change', () => this.saveApiKey('google'));
        this.elements.azureApiKey.addEventListener('change', () => this.saveApiKey('azure'));
        this.elements.deeplApiKey.addEventListener('change', () => this.saveApiKey('deepl'));
        
        // Initialize states
        this.updateButtonStates();
        this.updateTimeDisplay();
    }

    initializeStorage() {
        // Load data from localStorage
        const savedHistory = localStorage.getItem('ggs-translation-history');
        const savedAnalytics = localStorage.getItem('ggs-analytics');
        const savedSettings = localStorage.getItem('ggs-settings');
        
        if (savedHistory) {
            try {
                this.state.history = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
        
        if (savedAnalytics) {
            try {
                this.state.analytics = { ...this.state.analytics, ...JSON.parse(savedAnalytics) };
            } catch (e) {
                console.error('Error loading analytics:', e);
            }
        }
        
        if (savedSettings) {
            try {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        
        this.renderHistory();
        this.updateTranslationCount();
    }

    saveToStorage() {
        try {
            localStorage.setItem('ggs-translation-history', JSON.stringify(this.state.history));
            localStorage.setItem('ggs-analytics', JSON.stringify(this.state.analytics));
            localStorage.setItem('ggs-settings', JSON.stringify(this.state.settings));
        } catch (e) {
            console.error('Error saving to storage:', e);
            this.showToast('Error al guardar datos localmente', 'error');
        }
    }

    // Tab Management
    switchTab(tabName) {
        // Update nav tabs
        this.elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab contents
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Special actions for each tab
        if (tabName === 'analytics') {
            this.updateAnalyticsDisplay();
            this.updateCharts();
        } else if (tabName === 'settings') {
            this.loadSettingsDisplay();
        }
    }

    // Speech Recognition Setup (Enhanced)
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.showToast('Tu navegador no soporta el reconocimiento de voz', 'error');
            return;
        }

        this.state.recognition = new SpeechRecognition();
        // MOBILE OPTIMIZED: Use continuous = false for better stability
        this.state.recognition.continuous = false;
        this.state.recognition.interimResults = true;
        this.state.recognition.maxAlternatives = 1;
        
        // MOBILE OPTIMIZED: Simplified retry logic
        this.state.recognitionRetries = 0;
        this.state.maxRetries = 2; // Drastically reduced
        this.state.recognitionActive = false;
        this.state.lastSpeechTime = null;
        this.state.recognitionTimeout = null;

        this.state.recognition.onresult = (event) => {
            this.state.lastSpeechTime = Date.now();
            this.state.interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.state.finalTranscript += transcript + ' ';
                    console.log('✅ Final transcript:', transcript);
                    this.state.recognitionRetries = 0; // Reset on success
                } else {
                    this.state.interimTranscript += transcript;
                }
            }
            this.updateStatusText('Procesando audio...');
            this.clearRecognitionTimeout();
        };

        this.state.recognition.onerror = (event) => {
            console.log('❌ Recognition error:', event.error);
            
            switch (event.error) {
                case 'network':
                    this.showToast('Error de conexión. Verifica tu internet.', 'error');
                    this.forceStopRecording();
                    break;
                case 'aborted':
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
                    console.log('Unhandled error:', event.error);
                    this.handleGenericError();
            }
        };

        this.state.recognition.onend = () => {
            console.log('🔚 Recognition ended. IsRecording:', this.state.isRecording);
            this.state.recognitionActive = false;
            
            if (this.state.isRecording) {
                this.checkIfShouldContinueRecording();
            }
        };

        this.state.recognition.onstart = () => {
            console.log('🎤 Recognition started');
            this.state.recognitionActive = true;
            this.state.lastSpeechTime = Date.now();
            this.updateStatusText('Escuchando...');
            this.setRecognitionTimeout();
        };
    }

    // MOBILE OPTIMIZED HELPER METHODS
    handleNoSpeechError() {
        if (!this.state.isRecording) return;
        
        this.state.recognitionRetries++;
        
        if (this.state.recognitionRetries <= this.state.maxRetries) {
            console.log(`🔄 No speech detected, attempt ${this.state.recognitionRetries}/${this.state.maxRetries}`);
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.restartRecognitionSafely();
                }
            }, 1500); // Longer delay for stability
        } else {
            this.updateStatusText('No se detectó audio. Finalizando...');
            setTimeout(() => this.finishRecording(), 1000);
        }
    }

    handleGenericError() {
        if (!this.state.isRecording) return;
        
        this.state.recognitionRetries++;
        
        if (this.state.recognitionRetries <= this.state.maxRetries) {
            console.log(`🔄 Generic error, restarting attempt ${this.state.recognitionRetries}`);
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
            console.log('⏰ Time limit reached, finishing recording');
            this.finishRecording();
            return;
        }

        if (hasTranscript) {
            console.log('✅ Speech detected, finishing recording');
            this.finishRecording();
            return;
        }

        // Check if we should restart for more speech
        if (this.state.recognitionRetries < this.state.maxRetries) {
            console.log('🔄 No speech yet, restarting recognition');
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.restartRecognitionSafely();
                }
            }, 1000);
        } else {
            console.log('🛑 Max restart attempts reached');
            this.finishRecording();
        }
    }

    setRecognitionTimeout() {
        this.clearRecognitionTimeout();
        
        this.state.recognitionTimeout = setTimeout(() => {
            if (this.state.isRecording && this.state.recognitionActive) {
                console.log('⏰ Recognition timeout reached');
                if (this.state.finalTranscript.trim() || this.state.interimTranscript.trim()) {
                    this.finishRecording();
                } else {
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
        
        console.log('🔄 Safely restarting recognition...');
        
        try {
            if (this.state.recognitionActive) {
                this.state.recognition.stop();
            }
        } catch (e) {
            console.log('Error stopping recognition:', e);
        }
        
        setTimeout(() => {
            if (this.state.isRecording) {
                this.startSpeechRecognition();
            }
        }, 1000); // Wait longer before restarting
    }

    forceStopRecording() {
        console.log('🛑 Force stopping recording');
        this.state.isRecording = false;
        this.state.recognitionActive = false;
        this.clearRecognitionTimeout();
        this.finishRecording();
    }

    // Voice Synthesis Setup (Enhanced)
    loadVoices() {
        this.state.voices = speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => {
            this.state.voices = speechSynthesis.getVoices();
        };
    }

    // Recording Control (Enhanced)
    async toggleRecording() {
        if (!this.state.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            console.log('🎬 Starting recording...');
            this.state.isRecording = true;
            this.state.recognitionRetries = 0; // Reset retry counter
            this.state.recognitionActive = false;
            this.state.finalTranscript = '';
            this.state.interimTranscript = '';
            this.clearRecognitionTimeout();
            
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

    stopRecording() {
        console.log('🛑 Stopping recording...');
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
    }

    finishRecording() {
        console.log('🏁 Finishing recording...');
        this.state.isRecording = false;
        this.state.recognitionActive = false;
        this.clearRecognitionTimeout();
        
        this.updateRecordingUI(false);
        this.stopTimer();
        this.cleanupAudio();
        
        const finalText = this.state.finalTranscript.trim();
        const interimText = this.state.interimTranscript.trim();
        const combinedText = (finalText + ' ' + interimText).trim();
        
        console.log('📝 Final transcript:', finalText);
        console.log('📝 Interim transcript:', interimText);
        console.log('📝 Combined text:', combinedText);
        
        if (combinedText) {
            this.translateAndAdd(combinedText);
        } else {
            this.showToast('No se detectó audio para traducir. Intenta hablar más cerca del micrófono.', 'warning');
        }
        
        // Reset state
        this.state.finalTranscript = '';
        this.state.interimTranscript = '';
        this.state.recognitionRetries = 0;
    }

    // Multi-Service Translation System
    async translateAndAdd(text) {
        this.showLoading(true);
        this.updateStatusText('Traduciendo...');
        
        const service = this.elements.serviceSelect.value;
        const langPair = this.elements.languageSelect.value;
        
        try {
            const maxLength = this.getMaxLengthForService(service);
            
            if (text.length > maxLength) {
                await this.translateLongText(text, langPair, service);
            } else {
                await this.translateSingleChunk(text, langPair, service);
            }
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showToast('Error al traducir. Verifica tu conexión.', 'error');
            this.updateStatusText('Error en traducción');
        } finally {
            this.showLoading(false);
        }
    }

    getMaxLengthForService(service) {
        const limits = {
            'mymemory': 500,
            'google': 5000,
            'azure': 5000,
            'deepl': 5000
        };
        return limits[service] || 500;
    }

    async translateSingleChunk(text, langPair, service) {
        let translatedText;
        
        switch (service) {
            case 'google':
                translatedText = await this.translateWithGoogle(text, langPair);
                break;
            case 'azure':
                translatedText = await this.translateWithAzure(text, langPair);
                break;
            case 'deepl':
                translatedText = await this.translateWithDeepL(text, langPair);
                break;
            default:
                translatedText = await this.translateWithMyMemory(text, langPair);
        }
        
        this.addToHistory(text, translatedText, service);
    }

    async translateWithMyMemory(text, langPair) {
        const [sourceLang, targetLang] = langPair.split('-');
        const response = await fetch(`https://mymemory.translated.net/api/get?langpair=${sourceLang}|${targetLang}&q=${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.responseStatus !== 200) {
            throw new Error('Translation service error');
        }
        
        return data.responseData.translatedText;
    }

    async translateWithGoogle(text, langPair) {
        const apiKey = this.state.settings.apiKeys.google;
        if (!apiKey) {
            throw new Error('Google API Key no configurada');
        }
        
        const [sourceLang, targetLang] = langPair.split('-');
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Google Translate error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data.translations[0].translatedText;
    }

    async translateWithAzure(text, langPair) {
        const apiKey = this.state.settings.apiKeys.azure;
        if (!apiKey) {
            throw new Error('Azure API Key no configurada');
        }
        
        const [sourceLang, targetLang] = langPair.split('-');
        const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ text: text }])
        });
        
        if (!response.ok) {
            throw new Error(`Azure Translator error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data[0].translations[0].text;
    }

    async translateWithDeepL(text, langPair) {
        const apiKey = this.state.settings.apiKeys.deepl;
        if (!apiKey) {
            throw new Error('DeepL API Key no configurada');
        }
        
        const [sourceLang, targetLang] = langPair.split('-');
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                source_lang: sourceLang.toUpperCase(),
                target_lang: targetLang.toUpperCase()
            })
        });
        
        if (!response.ok) {
            throw new Error(`DeepL error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.translations[0].text;
    }

    async translateLongText(text, langPair, service) {
        const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
        const maxLength = this.getMaxLengthForService(service) - 50; // margin
        const chunks = [];
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = sentence;
                } else {
                    chunks.push(sentence.slice(0, maxLength));
                    currentChunk = sentence.slice(maxLength);
                }
            } else {
                currentChunk += sentence;
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        const translatedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            this.updateStatusText(`Traduciendo parte ${i + 1} de ${chunks.length}...`);
            
            try {
                let translated;
                switch (service) {
                    case 'google':
                        translated = await this.translateWithGoogle(chunks[i], langPair);
                        break;
                    case 'azure':
                        translated = await this.translateWithAzure(chunks[i], langPair);
                        break;
                    case 'deepl':
                        translated = await this.translateWithDeepL(chunks[i], langPair);
                        break;
                    default:
                        translated = await this.translateWithMyMemory(chunks[i], langPair);
                }
                
                translatedChunks.push(translated);
                
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.error(`Error translating chunk ${i + 1}:`, error);
                translatedChunks.push(`[Error: ${chunks[i]}]`);
            }
        }
        
        const fullTranslation = translatedChunks.join(' ');
        this.addToHistory(text, fullTranslation, service);
        
        this.showToast(`Traducción completada en ${chunks.length} partes`, 'success');
    }

    addToHistory(original, translated, service) {
        const timestamp = new Date().toLocaleString('es-ES');
        const selectedTime = parseInt(this.elements.timeSelect.value);
        const langPair = this.elements.languageSelect.value;
        
        const historyItem = {
            id: Date.now(),
            original: original,
            translated: translated,
            timestamp: timestamp,
            language: langPair,
            duration: selectedTime === 0 ? 'Manual' : `${selectedTime}s`,
            service: service,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.state.history.unshift(historyItem);
        this.updateAnalytics(historyItem);
        this.renderHistory();
        this.updateTranslationCount();
        this.updateButtonStates();
        this.saveToStorage();
        
        // Auto-play if enabled
        if (this.state.settings.audio.autoPlay) {
            const langConfig = this.supportedLanguages[langPair];
            this.speakText(translated, langConfig.target);
        }
        
        this.showToast('Traducción completada', 'success');
        this.updateStatusText('Traducción lista');
    }

    updateAnalytics(item) {
        // Daily stats
        if (!this.state.analytics.daily[item.date]) {
            this.state.analytics.daily[item.date] = 0;
        }
        this.state.analytics.daily[item.date]++;
        
        // Language stats
        if (!this.state.analytics.languages[item.language]) {
            this.state.analytics.languages[item.language] = 0;
        }
        this.state.analytics.languages[item.language]++;
        
        // Duration stats
        if (!this.state.analytics.durations[item.duration]) {
            this.state.analytics.durations[item.duration] = 0;
        }
        this.state.analytics.durations[item.duration]++;
        
        // Service stats
        if (!this.state.analytics.services[item.service]) {
            this.state.analytics.services[item.service] = 0;
        }
        this.state.analytics.services[item.service]++;
    }

    // Continue with remaining methods...
    // [The file is getting quite long, so I'll split it into multiple parts]

    // Timer Management (Enhanced)
    startTimer() {
        const selectedTime = parseInt(this.elements.timeSelect.value);
        
        if (selectedTime === 0) {
            this.state.timeLeft = null;
            this.updateTimerDisplay();
            return;
        }
        
        this.state.timeLeft = selectedTime;
        this.updateTimerDisplay();
        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerDisplay();
            if (this.state.timeLeft <= 0) {
                this.stopRecording();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerSpan = this.elements.timerDiv.querySelector('span');
        if (timerSpan) {
            if (this.state.timeLeft === null) {
                timerSpan.textContent = 'Grabación manual - Presiona para detener';
                this.elements.timerDiv.style.color = '#667eea';
            } else {
                const minutes = Math.floor(this.state.timeLeft / 60);
                const seconds = this.state.timeLeft % 60;
                const timeString = minutes > 0 
                    ? `${minutes}:${seconds.toString().padStart(2, '0')}` 
                    : `${seconds}s`;
                
                timerSpan.textContent = `Tiempo restante: ${timeString}`;
                
                if (this.state.timeLeft <= 5) {
                    this.elements.timerDiv.style.color = '#f5576c';
                } else if (this.state.timeLeft <= 10) {
                    this.elements.timerDiv.style.color = '#f59e0b';
                } else {
                    this.elements.timerDiv.style.color = '#667eea';
                }
            }
        }
    }

    // Audio Visualization (Enhanced)
    async setupAudioVisualization() {
        try {
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.state.microphone = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            const source = this.state.audioContext.createMediaStreamSource(this.state.microphone);
            this.state.analyser = this.state.audioContext.createAnalyser();
            source.connect(this.state.analyser);
            
            this.state.analyser.fftSize = 512;
            this.state.bufferLength = this.state.analyser.frequencyBinCount;
            this.state.dataArray = new Uint8Array(this.state.bufferLength);
            
            this.drawWaveform();
        } catch (error) {
            console.error('Error setting up audio visualization:', error);
            throw error;
        }
    }

    drawWaveform() {
        if (!this.state.isRecording || !this.state.analyser) return;
        
        this.state.currentAnimation = requestAnimationFrame(() => this.drawWaveform());
        
        this.state.analyser.getByteFrequencyData(this.state.dataArray);
        
        const canvas = this.elements.waveCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#f7fafc');
        gradient.addColorStop(1, '#edf2f7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw frequency bars
        const barWidth = width / this.state.bufferLength * 2;
        let x = 0;
        
        for (let i = 0; i < this.state.bufferLength; i++) {
            const barHeight = (this.state.dataArray[i] / 255) * height * 0.8;
            
            const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            barGradient.addColorStop(0, '#667eea');
            barGradient.addColorStop(0.5, '#764ba2');
            barGradient.addColorStop(1, '#f093fb');
            
            ctx.fillStyle = barGradient;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth;
        }
        
        // Add center line
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    cleanupAudio() {
        if (this.state.currentAnimation) {
            cancelAnimationFrame(this.state.currentAnimation);
            this.state.currentAnimation = null;
        }
        
        if (this.state.microphone) {
            this.state.microphone.getTracks().forEach(track => track.stop());
            this.state.microphone = null;
        }
        
        if (this.state.audioContext && this.state.audioContext.state !== 'closed') {
            this.state.audioContext.close();
            this.state.audioContext = null;
        }
    }

    // Speech Recognition
    startSpeechRecognition() {
        if (!this.state.recognition) return;
        
        const langPair = this.elements.languageSelect.value;
        const langConfig = this.supportedLanguages[langPair];
        this.state.recognition.lang = langConfig.source;
        this.state.recognition.start();
    }

    // Continue with the rest of the methods in the next part...

    // UI Updates (Enhanced)
    updateRecordingUI(isRecording) {
        const btn = this.elements.recordBtn;
        const statusText = this.elements.statusText;
        
        if (isRecording) {
            btn.classList.add('recording');
            btn.innerHTML = `
                <i class="fas fa-stop"></i>
                <span class="btn-text">Detener Grabación</span>
                <div class="pulse-animation"></div>
            `;
            statusText.textContent = 'Grabando...';
            statusText.classList.add('recording');
            this.elements.audioVisualizer.classList.add('active');
        } else {
            btn.classList.remove('recording');
            btn.innerHTML = `
                <i class="fas fa-microphone"></i>
                <span class="btn-text">Iniciar Grabación</span>
                <div class="pulse-animation"></div>
            `;
            statusText.textContent = 'Listo para grabar';
            statusText.classList.remove('recording');
            this.elements.audioVisualizer.classList.remove('active');
        }
        
        this.updateButtonStates();
    }

    updateStatusText(text) {
        this.elements.statusText.textContent = text;
    }

    updateButtonStates() {
        const hasHistory = this.state.history.length > 0;
        this.elements.playTranslationBtn.disabled = !hasHistory || this.state.isPlayingAudio;
        this.elements.saveBtn.disabled = !hasHistory;
        
        if (hasHistory && !this.state.isPlayingAudio) {
            this.elements.playTranslationBtn.style.opacity = '1';
        } else {
            this.elements.playTranslationBtn.style.opacity = '0.5';
        }
        
        if (hasHistory) {
            this.elements.saveBtn.style.opacity = '1';
        } else {
            this.elements.saveBtn.style.opacity = '0.5';
        }
        
        // Update audio control buttons
        this.updateAudioControlButtons();
    }

    updateLanguageCount() {
        const count = Object.keys(this.supportedLanguages).length;
        this.elements.languageCount.textContent = `${count} Idiomas`;
    }

    updateLanguageDisplay() {
        const value = this.elements.languageSelect.value;
        const langConfig = this.supportedLanguages[value];
        this.updateStatusText(`Configuración: ${langConfig.label}`);
    }

    updateServiceDisplay() {
        const service = this.elements.serviceSelect.value;
        const serviceNames = {
            'mymemory': 'MyMemory (Gratuito)',
            'google': 'Google Translate',
            'azure': 'Azure Translator',
            'deepl': 'DeepL'
        };
        this.updateStatusText(`Servicio: ${serviceNames[service]}`);
    }

    updateTimeDisplay() {
        const selectedTime = parseInt(this.elements.timeSelect.value);
        let message = '';
        
        if (selectedTime === 0) {
            message = 'Modo manual activado - Sin límite de tiempo';
        } else if (selectedTime >= 60) {
            const minutes = Math.floor(selectedTime / 60);
            message = `Duración configurada: ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else {
            message = `Duración configurada: ${selectedTime} segundos`;
        }
        
        this.updateStatusText(message);
        
        if (selectedTime >= 60) {
            this.showToast('Grabaciones de 1 minuto pueden reiniciarse automáticamente por limitaciones del navegador', 'info');
        }
    }

    // History Management (Enhanced)
    renderHistory() {
        const container = this.elements.historyDiv;
        
        if (this.state.history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>No hay traducciones aún</p>
                    <small>Inicia una grabación para comenzar</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.state.history.forEach((item, index) => {
            const historyItem = this.createHistoryItem(item, index);
            container.appendChild(historyItem);
        });
    }

    createHistoryItem(item, index) {
        const div = document.createElement('div');
        div.classList.add('history-item');
        div.style.animationDelay = `${index * 0.1}s`;
        
        const langConfig = this.supportedLanguages[item.language];
        const sourceFlag = this.getLanguageFlag(langConfig.source);
        const targetFlag = this.getLanguageFlag(langConfig.target);
        
        const serviceIcons = {
            'mymemory': 'fas fa-globe',
            'google': 'fab fa-google',
            'azure': 'fab fa-microsoft',
            'deepl': 'fas fa-brain'
        };
        
        div.innerHTML = `
            <div class="timestamp">
                <i class="far fa-clock"></i>
                ${item.timestamp}
                <span class="duration-badge">
                    <i class="fas fa-microphone"></i>
                    ${item.duration}
                </span>
                <span class="service-badge">
                    <i class="${serviceIcons[item.service] || 'fas fa-cog'}"></i>
                    ${item.service}
                </span>
            </div>
            <div class="original">
                <div class="original-label">
                    <span>${sourceFlag}</span>
                    Original
                </div>
                <div class="original-text">${item.original}</div>
            </div>
            <div class="translated" data-text="${item.translated}" data-lang="${item.language}">
                <div class="translated-label">
                    <span>${targetFlag}</span>
                    Traducción
                    <i class="fas fa-volume-up"></i>
                </div>
                <div class="translated-text">${item.translated}</div>
            </div>
            <div class="play-indicator">
                <i class="fas fa-play"></i>
            </div>
        `;
        
        // Add click listener for audio playback
        const translatedDiv = div.querySelector('.translated');
        translatedDiv.addEventListener('click', () => {
            const text = translatedDiv.getAttribute('data-text');
            const lang = translatedDiv.getAttribute('data-lang');
            const langConfig = this.supportedLanguages[lang];
            this.speakText(text, langConfig.target);
        });
        
        return div;
    }

    getLanguageFlag(langCode) {
        const flags = {
            'en-US': '🇺🇸', 'es-ES': '🇪🇸', 'fr-FR': '🇫🇷', 'de-DE': '🇩🇪',
            'it-IT': '🇮🇹', 'pt-PT': '🇵🇹', 'ru-RU': '🇷🇺', 'zh-CN': '🇨🇳',
            'ja-JP': '🇯🇵'
        };
        return flags[langCode] || '🌐';
    }

    updateTranslationCount() {
        this.elements.translationCount.textContent = this.state.history.length;
    }

    // Text-to-Speech (Enhanced with Playback Control)
    speakText(text, lang) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = this.state.settings.audio.rate;
        utterance.pitch = this.state.settings.audio.pitch;
        utterance.volume = 0.8;
        
        const preferredVoice = this.state.voices.find(voice => 
            voice.lang === lang && (voice.name.includes('Google') || voice.name.includes('Premium'))
        );
        const defaultVoice = this.state.voices.find(voice => voice.lang === lang);
        
        utterance.voice = preferredVoice || defaultVoice;
        
        // Store current utterance for control
        this.state.currentUtterance = utterance;
        this.state.isPlayingAudio = true;
        this.updateAudioControlButtons();
        
        utterance.onstart = () => {
            this.showToast('Reproduciendo traducción...', 'success');
            this.updateStatusText('Reproduciendo...');
        };
        
        utterance.onend = () => {
            this.updateStatusText('Reproducción completada');
            this.state.currentUtterance = null;
            this.state.isPlayingAudio = false;
            this.updateAudioControlButtons();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.showToast('Error al reproducir audio', 'error');
            this.state.currentUtterance = null;
            this.state.isPlayingAudio = false;
            this.updateAudioControlButtons();
        };
        
        speechSynthesis.speak(utterance);
    }

    playLastTranslation() {
        if (this.state.history.length === 0) {
            this.showToast('No hay traducciones disponibles', 'warning');
            return;
        }
        
        if (this.state.isPlayingAudio) {
            this.showToast('Ya hay una reproducción en curso', 'warning');
            return;
        }
        
        const lastItem = this.state.history[0];
        const langConfig = this.supportedLanguages[lastItem.language];
        this.speakText(lastItem.translated, langConfig.target);
    }

    stopAudioPlayback() {
        if (speechSynthesis.speaking || this.state.isPlayingAudio) {
            speechSynthesis.cancel();
            this.state.currentUtterance = null;
            this.state.isPlayingAudio = false;
            this.updateAudioControlButtons();
            this.updateStatusText('Reproducción detenida');
            this.showToast('Reproducción detenida', 'info');
        } else {
            this.showToast('No hay reproducción activa', 'warning');
        }
    }

    updateAudioControlButtons() {
        const playBtn = this.elements.playTranslationBtn;
        const stopBtn = this.elements.stopAudioBtn;
        
        if (this.state.isPlayingAudio) {
            playBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
        } else {
            playBtn.style.display = 'flex';
            stopBtn.style.display = 'none';
        }
    }

    // Analytics System
    updateAnalyticsDisplay() {
        const totalRecordings = this.state.history.length;
        const totalMinutes = this.calculateTotalTime();
        const uniqueLanguages = new Set(this.state.history.map(item => item.language)).size;
        const uniqueDays = new Set(this.state.history.map(item => item.date)).size;
        
        this.elements.totalRecordings.textContent = totalRecordings;
        this.elements.totalTime.textContent = `${totalMinutes}m`;
        this.elements.languagesUsed.textContent = uniqueLanguages;
        this.elements.daysActive.textContent = uniqueDays;
    }

    calculateTotalTime() {
        return this.state.history.reduce((total, item) => {
            if (item.duration === 'Manual') return total + 60; // Estimate 1 minute for manual
            const seconds = parseInt(item.duration);
            return total + (seconds / 60);
        }, 0).toFixed(0);
    }

    initializeCharts() {
        // Initialize Chart.js charts
        this.createDailyChart();
        this.createLanguageChart();
        this.createDurationChart();
        this.createServiceChart();
    }

    createDailyChart() {
        const ctx = this.elements.dailyChart.getContext('2d');
        
        this.state.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Traducciones por día',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createLanguageChart() {
        const ctx = this.elements.languageChart.getContext('2d');
        
        this.state.charts.language = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#f59e0b', '#10b981'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    createDurationChart() {
        const ctx = this.elements.durationChart.getContext('2d');
        
        this.state.charts.duration = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Frecuencia',
                    data: [],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createServiceChart() {
        const ctx = this.elements.serviceChart.getContext('2d');
        
        this.state.charts.service = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateCharts() {
        this.updateDailyChart();
        this.updateLanguageChart();
        this.updateDurationChart();
        this.updateServiceChart();
    }

    updateDailyChart() {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
                count: this.state.analytics.daily[dateStr] || 0
            });
        }
        
        this.state.charts.daily.data.labels = last7Days.map(d => d.label);
        this.state.charts.daily.data.datasets[0].data = last7Days.map(d => d.count);
        this.state.charts.daily.update();
    }

    updateLanguageChart() {
        const languages = Object.entries(this.state.analytics.languages);
        const labels = languages.map(([lang, count]) => {
            const config = this.supportedLanguages[lang];
            return config ? config.label : lang;
        });
        const data = languages.map(([lang, count]) => count);
        
        this.state.charts.language.data.labels = labels;
        this.state.charts.language.data.datasets[0].data = data;
        this.state.charts.language.update();
    }

    updateDurationChart() {
        const durations = Object.entries(this.state.analytics.durations);
        const labels = durations.map(([duration, count]) => duration);
        const data = durations.map(([duration, count]) => count);
        
        this.state.charts.duration.data.labels = labels;
        this.state.charts.duration.data.datasets[0].data = data;
        this.state.charts.duration.update();
    }

    updateServiceChart() {
        const services = Object.entries(this.state.analytics.services);
        const labels = services.map(([service, count]) => {
            const serviceNames = {
                'mymemory': 'MyMemory',
                'google': 'Google',
                'azure': 'Azure',
                'deepl': 'DeepL'
            };
            return serviceNames[service] || service;
        });
        const data = services.map(([service, count]) => count);
        
        this.state.charts.service.data.labels = labels;
        this.state.charts.service.data.datasets[0].data = data;
        this.state.charts.service.update();
    }

    // Settings Management
    loadSettings() {
        // Load API keys
        this.elements.googleApiKey.value = this.state.settings.apiKeys.google;
        this.elements.azureApiKey.value = this.state.settings.apiKeys.azure;
        this.elements.deeplApiKey.value = this.state.settings.apiKeys.deepl;
        
        // Load audio settings
        this.elements.speechRate.value = this.state.settings.audio.rate;
        this.elements.speechPitch.value = this.state.settings.audio.pitch;
        this.elements.autoPlay.checked = this.state.settings.audio.autoPlay;
        
        // Load appearance settings
        this.elements.themeSelect.value = this.state.settings.appearance.theme;
        this.elements.colorScheme.value = this.state.settings.appearance.colorScheme;
        
        // Apply appearance settings
        this.applyTheme();
        this.applyColorScheme();
        
        this.updateSpeechRateDisplay();
        this.updateSpeechPitchDisplay();
    }

    loadSettingsDisplay() {
        this.loadSettings();
    }

    saveApiKey(service) {
        const input = this.elements[`${service}ApiKey`];
        this.state.settings.apiKeys[service] = input.value;
        this.saveToStorage();
        this.showToast(`${service.toUpperCase()} API Key guardada`, 'success');
    }

    updateSpeechRate() {
        this.state.settings.audio.rate = parseFloat(this.elements.speechRate.value);
        this.updateSpeechRateDisplay();
        this.saveToStorage();
    }

    updateSpeechRateDisplay() {
        this.elements.speechRateValue.textContent = `${this.state.settings.audio.rate}x`;
    }

    updateSpeechPitch() {
        this.state.settings.audio.pitch = parseFloat(this.elements.speechPitch.value);
        this.updateSpeechPitchDisplay();
        this.saveToStorage();
    }

    updateSpeechPitchDisplay() {
        this.elements.speechPitchValue.textContent = this.state.settings.audio.pitch.toFixed(1);
    }

    updateAutoPlay() {
        this.state.settings.audio.autoPlay = this.elements.autoPlay.checked;
        this.saveToStorage();
        this.showToast(`Reproducción automática ${this.state.settings.audio.autoPlay ? 'activada' : 'desactivada'}`, 'success');
    }

    updateTheme() {
        this.state.settings.appearance.theme = this.elements.themeSelect.value;
        this.applyTheme();
        this.saveToStorage();
    }

    updateColorScheme() {
        this.state.settings.appearance.colorScheme = this.elements.colorScheme.value;
        this.applyColorScheme();
        this.saveToStorage();
    }

    applyTheme() {
        const theme = this.state.settings.appearance.theme;
        const body = document.body;
        
        // Remove existing theme attributes
        body.removeAttribute('data-theme');
        
        // Apply new theme
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
        } else if (theme === 'auto') {
            body.setAttribute('data-theme', 'auto');
        }
        
        // Update chart themes if charts exist
        if (this.charts) {
            this.updateChartThemes();
        }
        
        this.showToast(`Tema ${this.getThemeDisplayName(theme)} aplicado`, 'success');
    }
    
    getThemeDisplayName(theme) {
        switch(theme) {
            case 'dark': return 'oscuro';
            case 'light': return 'claro';
            case 'auto': return 'automático';
            default: return 'por defecto';
        }
    }
    
    updateChartThemes() {
        const isDark = this.isDarkTheme();
        const textColor = isDark ? '#e2e8f0' : '#2d3748';
        const gridColor = isDark ? '#4a5568' : '#e2e8f0';
        
        // Update all charts with new theme colors
        Object.values(this.charts || {}).forEach(chart => {
            if (chart && chart.options) {
                chart.options.plugins.legend.labels.color = textColor;
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.grid.color = gridColor;
                chart.update();
            }
        });
        
        // Also update color scheme after theme change
        this.updateChartColors();
    }
    
    isDarkTheme() {
        const theme = this.state.settings.appearance.theme;
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }

    applyColorScheme() {
        const colorScheme = this.state.settings.appearance.colorScheme;
        const body = document.body;
        
        // Remove existing color scheme attributes
        body.removeAttribute('data-color-scheme');
        
        // Apply new color scheme (only if not default)
        if (colorScheme !== 'default') {
            body.setAttribute('data-color-scheme', colorScheme);
        }
        
        // Update chart colors if charts exist
        if (this.charts) {
            this.updateChartColors();
        }
        
        this.showToast(`Esquema de colores ${this.getColorSchemeDisplayName(colorScheme)} aplicado`, 'success');
    }
    
    getColorSchemeDisplayName(scheme) {
        switch(scheme) {
            case 'green': return 'verde';
            case 'purple': return 'morado';
            case 'orange': return 'naranja';
            case 'default': return 'azul por defecto';
            default: return 'por defecto';
        }
    }
    
    updateChartColors() {
        const colorScheme = this.state.settings.appearance.colorScheme;
        const isDark = this.isDarkTheme();
        
        // Get primary color based on current scheme
        let primaryColor = '#667eea'; // default blue
        switch(colorScheme) {
            case 'green':
                primaryColor = isDark ? '#68d391' : '#48bb78';
                break;
            case 'purple':
                primaryColor = isDark ? '#9f7aea' : '#805ad5';
                break;
            case 'orange':
                primaryColor = isDark ? '#f6ad55' : '#ed8936';
                break;
        }
        
        // Update all charts with new color scheme
        Object.values(this.charts || {}).forEach(chart => {
            if (chart && chart.data && chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
                        // For charts with multiple colors, update the first color
                        dataset.backgroundColor[0] = primaryColor + '80'; // Add transparency
                        dataset.borderColor[0] = primaryColor;
                    } else {
                        // For single color datasets
                        dataset.backgroundColor = primaryColor + '80';
                        dataset.borderColor = primaryColor;
                    }
                });
                chart.update();
            }
        });
    }

    // Data Management
    exportData() {
        const exportData = {
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            history: this.state.history,
            analytics: this.state.analytics,
            settings: this.state.settings
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `glory-translator-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showToast('Datos exportados correctamente', 'success');
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.version && data.history && data.analytics && data.settings) {
                this.state.history = data.history;
                this.state.analytics = data.analytics;
                this.state.settings = { ...this.state.settings, ...data.settings };
                
                this.saveToStorage();
                this.renderHistory();
                this.updateTranslationCount();
                this.updateAnalyticsDisplay();
                this.loadSettings();
                
                this.showToast(`Importados ${data.history.length} registros`, 'success');
            } else {
                throw new Error('Formato de archivo inválido');
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showToast('Error al importar datos', 'error');
        }
        
        event.target.value = '';
    }

    clearAllData() {
        if (confirm('⚠️ ¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('ggs-translation-history');
            localStorage.removeItem('ggs-analytics');
            localStorage.removeItem('ggs-settings');
            
            this.state.history = [];
            this.state.analytics = { daily: {}, languages: {}, durations: {}, services: {} };
            
            this.renderHistory();
            this.updateTranslationCount();
            this.updateAnalyticsDisplay();
            this.updateCharts();
            
            this.showToast('Todos los datos han sido eliminados', 'warning');
        }
    }

    // File Operations (Enhanced)
    saveTranslations() {
        if (this.state.history.length === 0) {
            this.showToast('No hay traducciones para guardar', 'warning');
            return;
        }
        
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const content = this.formatTranslationsForSave();
            
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `traducciones_${timestamp}.txt`;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showToast(`Guardadas ${this.state.history.length} traducciones`, 'success');
            
        } catch (error) {
            console.error('Error saving translations:', error);
            this.showToast('Error al guardar las traducciones', 'error');
        }
    }

    formatTranslationsForSave() {
        const header = `TRADUCCIONES DE AUDIO - GLORY GLOBAL SOLUTIONS\n`;
        const separator = `${'='.repeat(60)}\n`;
        const timestamp = `Generado el: ${new Date().toLocaleString('es-ES')}\n`;
        const count = `Total de traducciones: ${this.state.history.length}\n`;
        const totalTime = `Tiempo total estimado: ${this.calculateTotalTime()} minutos\n\n`;
        
        let content = header + separator + timestamp + count + totalTime;
        
        this.state.history.forEach((item, index) => {
            const itemNumber = `${index + 1}. `;
            const itemTimestamp = `Fecha: ${item.timestamp}\n`;
            const langConfig = this.supportedLanguages[item.language];
            const direction = `Dirección: ${langConfig.label}\n`;
            const service = `Servicio: ${item.service}\n`;
            const duration = `Duración: ${item.duration}\n`;
            const original = `Original: ${item.original}\n`;
            const translated = `Traducción: ${item.translated}\n`;
            const itemSeparator = `-`.repeat(40) + '\n';
            
            content += itemNumber + itemTimestamp + direction + service + duration + original + translated + itemSeparator + '\n';
        });
        
        return content;
    }

    // UI Helpers (Enhanced)
    showLoading(show) {
        if (show) {
            this.elements.loadingOverlay.classList.add('active');
        } else {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        
        let icon;
        switch (type) {
            case 'success':
                icon = 'fas fa-check-circle';
                break;
            case 'error':
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                break;
            default:
                icon = 'fas fa-info-circle';
        }
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdvancedAudioTranslationTool();
    window.translationApp = app; // Make globally accessible for debugging
});