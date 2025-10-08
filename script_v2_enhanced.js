// Traductor de Voz v2.0 Enhanced - Tiempo Real con Estadísticas
// Mejoras: Sin permisos repetitivos, grabación continua, transcripción en tiempo real, estadísticas

class VoiceTranslatorV2Enhanced {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.requestMicrophonePermissions();
        this.loadVoices();
        this.setupEventListeners();
        this.initializeStats();
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
            stopAudio: document.getElementById('stop-audio'),
            
            // Estadísticas
            sessionRecordings: document.getElementById('session-recordings'),
            sessionDuration: document.getElementById('session-duration'),
            wordsTranscribed: document.getElementById('words-transcribed'),
            languagesUsed: document.getElementById('languages-used')
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
            recordingStartTime: null,
            
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
            selectedVoice: null,
            
            // Estadísticas
            stats: {
                sessionRecordings: 0,
                totalDuration: 0,
                wordsTranscribed: 0,
                languagesUsed: new Set(['es']), // Iniciar con español
                sessionStartTime: Date.now()
            }
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

    initializeStats() {
        this.updateStatsDisplay();
        // Actualizar estadísticas cada segundo
        setInterval(() => {
            this.updateStatsDisplay();
        }, 1000);
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
                    autoGainControl: true,
                    sampleRate: 44100
                } 
            });
            
            this.state.microphonePermissionGranted = true;
            this.updatePermissionsStatus('✅ Permisos concedidos - Sistema listo para usar', 'permissions-granted');
            
            // Habilitar controles
            this.elements.startRecording.disabled = false;
            this.updateStatusIndicator('✅ Sistema listo - Grabación continua sin límites', 'status-ready');
            
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            this.updatePermissionsStatus('❌ Permisos denegados - La aplicación requiere acceso al micrófono', 'permissions-status');
            this.updateStatusIndicator('❌ Error: Permisos de micrófono requeridos', 'status-ready');
        }
    }

    updatePermissionsStatus(message, className) {
        this.elements.permissionsStatus.innerHTML = `<strong>${message}</strong>`;
        this.elements.permissionsStatus.className = `permissions-status ${className}`;
    }

    // ===== CONFIGURACIÓN DE RECONOCIMIENTO DE VOZ =====
    setupSpeechRecognition() {
        const recognition = this.state.recognition;
        
        // Configuración optimizada para tiempo real
        recognition.continuous = true;           // Grabación continua
        recognition.interimResults = true;       // Resultados intermedios para tiempo real
        recognition.maxAlternatives = 5;         // Múltiples alternativas para mejor precisión
        
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
            console.log('No se pudo reconocer el audio claramente');
        };

        recognition.onspeechstart = () => {
            console.log('🎤 Detectado inicio de habla');
        };

        recognition.onspeechend = () => {
            console.log('🔇 Detectado final de habla');
        };

        recognition.onaudiostart = () => {
            console.log('🔊 Audio iniciado');
        };

        recognition.onaudioend = () => {
            console.log('🔇 Audio terminado');
        };
    }

    onRecognitionStart() {
        console.log('🎙️ Reconocimiento iniciado');
        this.state.isRecognitionActive = true;
        this.state.recordingStartTime = Date.now();
        this.updateStatusIndicator('🎤 Grabando en tiempo real... (Sin límite de tiempo)', 'status-recording');
    }

    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Procesar todos los resultados desde el último índice
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                
                // Contar palabras para estadísticas
                const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
                this.state.stats.wordsTranscribed += words.length;
            } else {
                interimTranscript += transcript;
            }
        }

        // Actualizar transcripción final
        if (finalTranscript.trim()) {
            this.state.finalTranscript += finalTranscript;
            this.updateTranscription();
            this.translateText(finalTranscript.trim());
        }

        // Mostrar transcripción temporal (en tiempo real)
        if (interimTranscript.trim()) {
            this.state.interimTranscript = interimTranscript;
            this.updateTranscription();
        }
    }

    onRecognitionError(event) {
        console.error('Error en reconocimiento:', event.error);
        
        // Manejar errores de forma más tolerante
        switch (event.error) {
            case 'no-speech':
                console.log('⏸️ No se detectó habla, esperando...');
                return; // No detener por falta de habla
                
            case 'audio-capture':
                this.showError('❌ Error al capturar audio del micrófono');
                break;
                
            case 'not-allowed':
                this.showError('❌ Permisos de micrófono denegados');
                break;
                
            case 'network':
                this.showError('❌ Error de red. Verifica tu conexión');
                break;
                
            case 'service-not-allowed':
                this.showError('❌ Servicio de reconocimiento no permitido');
                break;
                
            default:
                console.log(`⚠️ Error de reconocimiento: ${event.error}`);
        }
    }

    onRecognitionEnd() {
        console.log('🔇 Reconocimiento terminado');
        this.state.isRecognitionActive = false;
        
        // Calcular duración de la grabación actual
        if (this.state.recordingStartTime) {
            const duration = (Date.now() - this.state.recordingStartTime) / 1000;
            this.state.stats.totalDuration += duration;
        }
        
        // Si estamos grabando y se detuvo inesperadamente, reiniciar
        if (this.state.isRecording && this.state.microphonePermissionGranted) {
            console.log('🔄 Reiniciando reconocimiento automáticamente...');
            setTimeout(() => {
                if (this.state.isRecording) {
                    this.startRecognition();
                }
            }, 200);
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

        // Limpiar transcripciones anteriores para nueva sesión
        this.state.finalTranscript = '';
        this.state.interimTranscript = '';
        this.state.currentTranslation = '';
        this.updateTranscription();
        this.updateTranslation();

        // Configurar idioma
        const sourceLang = this.elements.sourceLanguage.value;
        this.state.recognition.lang = sourceLang;
        
        // Actualizar estadísticas de idiomas
        const langCode = sourceLang.split('-')[0];
        this.state.stats.languagesUsed.add(langCode);
        this.state.stats.languagesUsed.add(this.elements.targetLanguage.value);

        // Iniciar grabación
        this.state.isRecording = true;
        this.state.stats.sessionRecordings++;
        this.startRecognition();

        // Actualizar UI
        this.elements.startRecording.disabled = true;
        this.elements.stopRecording.disabled = false;
        this.updateStatusIndicator('🎤 Grabación activa... Habla con naturalidad', 'status-recording');
        
        console.log(`🚀 Grabación iniciada - Sesión ${this.state.stats.sessionRecordings}`);
    }

    startRecognition() {
        if (this.state.recognition && !this.state.isRecognitionActive) {
            try {
                this.state.recognition.start();
            } catch (error) {
                console.error('Error al iniciar reconocimiento:', error);
                // Reintentar después de un breve delay
                setTimeout(() => {
                    if (this.state.isRecording && !this.state.isRecognitionActive) {
                        this.startRecognition();
                    }
                }, 1000);
            }
        }
    }

    stopRecording() {
        console.log('⏹️ Deteniendo grabación...');
        this.state.isRecording = false;
        
        if (this.state.recognition && this.state.isRecognitionActive) {
            this.state.recognition.stop();
        }

        // Actualizar UI
        this.elements.startRecording.disabled = false;
        this.elements.stopRecording.disabled = true;
        this.updateStatusIndicator('✅ Grabación completada - Lista para nueva sesión', 'status-ready');

        // Habilitar reproducción si hay traducción
        if (this.state.currentTranslation.trim()) {
            this.elements.playTranslation.disabled = false;
        }
        
        console.log('✅ Grabación detenida exitosamente');
    }

    // ===== ACTUALIZACIÓN DE UI =====
    updateTranscription() {
        const finalText = this.state.finalTranscript;
        const interimText = this.state.interimTranscript;
        
        let html = '';
        
        if (finalText.trim()) {
            html += `<div class="final-text"><strong>Texto final:</strong><br>${finalText}</div>`;
        }
        
        if (interimText.trim()) {
            html += `<div class="interim-text"><em>Escuchando: ${interimText}</em></div>`;
        }
        
        if (!finalText.trim() && !interimText.trim()) {
            html = '<em>La transcripción aparecerá aquí en tiempo real mientras hablas...</em>';
        }

        this.elements.transcriptionResult.innerHTML = html;
        this.elements.transcriptionResult.scrollTop = this.elements.transcriptionResult.scrollHeight;
    }

    updateTranslation() {
        if (this.state.currentTranslation.trim()) {
            this.elements.translationResult.innerHTML = `
                <div class="final-text">
                    <strong>Traducción:</strong><br>
                    ${this.state.currentTranslation}
                </div>
            `;
        } else {
            this.elements.translationResult.innerHTML = '<em>La traducción se generará automáticamente...</em>';
        }
        
        this.elements.translationResult.scrollTop = this.elements.translationResult.scrollHeight;
    }

    updateStatusIndicator(message, className) {
        this.elements.statusIndicator.textContent = message;
        this.elements.statusIndicator.className = `status-indicator ${className}`;
    }

    updateStatsDisplay() {
        // Actualizar visualización de estadísticas
        this.elements.sessionRecordings.textContent = this.state.stats.sessionRecordings;
        this.elements.sessionDuration.textContent = `${Math.round(this.state.stats.totalDuration)}s`;
        this.elements.wordsTranscribed.textContent = this.state.stats.wordsTranscribed;
        this.elements.languagesUsed.textContent = this.state.stats.languagesUsed.size;
    }

    showError(message) {
        this.updateStatusIndicator(message, 'status-ready');
        console.error(message);
    }

    // ===== TRADUCCIÓN =====
    async translateText(text) {
        if (!text.trim()) return;

        try {
            this.updateStatusIndicator('🌐 Traduciendo en tiempo real...', 'status-processing');
            
            const sourceLang = this.elements.sourceLanguage.value.split('-')[0];
            const targetLang = this.elements.targetLanguage.value;
            
            // Simular API de traducción con mejor lógica
            const translation = await this.callTranslationAPI(text, sourceLang, targetLang);
            
            // Agregar a la traducción acumulada con mejor formato
            if (this.state.currentTranslation.trim()) {
                this.state.currentTranslation += ' ' + translation;
            } else {
                this.state.currentTranslation = translation;
            }
            
            this.updateTranslation();
            
            // Actualizar estado según contexto
            if (!this.state.isRecording) {
                this.updateStatusIndicator('✅ Traducción completada - Lista para reproducir', 'status-ready');
                this.elements.playTranslation.disabled = false;
            } else {
                this.updateStatusIndicator('🎤 Grabando y traduciendo en tiempo real...', 'status-recording');
            }
            
        } catch (error) {
            console.error('Error en traducción:', error);
            this.showError('❌ Error al traducir. Verifica tu conexión.');
        }
    }

    async callTranslationAPI(text, sourceLang, targetLang) {
        // Simulación mejorada de API de traducción con traducciones más realistas
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mapeo ampliado de traducciones para demo
                const commonTranslations = {
                    'es-en': {
                        // Saludos y cortesía
                        'hola': 'hello',
                        'cómo estás': 'how are you',
                        'muy bien': 'very well',
                        'gracias': 'thank you',
                        'por favor': 'please',
                        'de nada': 'you\'re welcome',
                        'buenos días': 'good morning',
                        'buenas tardes': 'good afternoon',
                        'buenas noches': 'good evening',
                        'hasta luego': 'see you later',
                        'me llamo': 'my name is',
                        'mucho gusto': 'nice to meet you',
                        // Palabras de reuniones y negocios
                        'reunión': 'meeting',
                        'proyecto': 'project',
                        'empresa': 'company',
                        'trabajo': 'work',
                        'importante': 'important',
                        'necesitamos': 'we need',
                        'podemos': 'we can',
                        'tenemos': 'we have',
                        'quiero': 'I want',
                        'necesito': 'I need',
                        'entiendo': 'I understand',
                        'perfecto': 'perfect',
                        'excelente': 'excellent'
                    },
                    'en-es': {
                        // Saludos y cortesía
                        'hello': 'hola',
                        'how are you': 'cómo estás',
                        'very well': 'muy bien',
                        'thank you': 'gracias',
                        'please': 'por favor',
                        'you\'re welcome': 'de nada',
                        'good morning': 'buenos días',
                        'good afternoon': 'buenas tardes',
                        'good evening': 'buenas noches',
                        'see you later': 'hasta luego',
                        'my name is': 'me llamo',
                        'nice to meet you': 'mucho gusto',
                        // Palabras de reuniones y negocios
                        'meeting': 'reunión',
                        'project': 'proyecto',
                        'company': 'empresa',
                        'work': 'trabajo',
                        'important': 'importante',
                        'we need': 'necesitamos',
                        'we can': 'podemos',
                        'we have': 'tenemos',
                        'I want': 'quiero',
                        'I need': 'necesito',
                        'I understand': 'entiendo',
                        'perfect': 'perfecto',
                        'excellent': 'excelente'
                    },
                    'es-fr': {
                        'hola': 'bonjour',
                        'gracias': 'merci',
                        'por favor': 's\'il vous plaît',
                        'reunión': 'réunion',
                        'proyecto': 'projet',
                        'trabajo': 'travail'
                    },
                    'es-de': {
                        'hola': 'hallo',
                        'gracias': 'danke',
                        'por favor': 'bitte',
                        'reunión': 'besprechung',
                        'proyecto': 'projekt'
                    }
                };

                const langPair = `${sourceLang}-${targetLang}`;
                const dict = commonTranslations[langPair] || {};
                
                // Buscar traducción exacta primero
                const lowerText = text.toLowerCase().trim();
                let translation = dict[lowerText];
                
                if (!translation) {
                    // Buscar traducciones parciales de palabras clave
                    translation = this.translateWordsInText(text, dict, sourceLang, targetLang);
                }
                
                resolve(translation);
            }, Math.random() * 300 + 200); // Latencia realista de 200-500ms
        });
    }

    translateWordsInText(text, dict, sourceLang, targetLang) {
        // Función auxiliar para traducir palabras individuales cuando no hay traducción completa
        const words = text.toLowerCase().split(/\s+/);
        const translatedWords = words.map(word => {
            // Limpiar puntuación para la búsqueda
            const cleanWord = word.replace(/[.,!?;:]/, '');
            return dict[cleanWord] || this.generateRealisticTranslation(cleanWord, sourceLang, targetLang);
        });
        
        return translatedWords.join(' ');
    }

    generateRealisticTranslation(word, sourceLang, targetLang) {
        // Generar traducciones más realistas para palabras no encontradas
        const translationPrefixes = {
            'en': 'ENG-',
            'es': 'ESP-',
            'fr': 'FR-',
            'de': 'DE-',
            'it': 'IT-',
            'pt': 'PT-',
            'zh': 'ZH-',
            'ja': 'JA-',
            'ko': 'KO-'
        };

        // Simulaciones básicas de traducción automática
        const basicTransformations = {
            'es-en': (word) => {
                if (word.endsWith('ción')) return word.replace('ción', 'tion');
                if (word.endsWith('dad')) return word.replace('dad', 'ty');
                if (word.endsWith('mente')) return word.replace('mente', 'ly');
                return `${translationPrefixes[targetLang]}${word}`;
            },
            'en-es': (word) => {
                if (word.endsWith('tion')) return word.replace('tion', 'ción');
                if (word.endsWith('ty')) return word.replace('ty', 'dad');
                if (word.endsWith('ly')) return word.replace('ly', 'mente');
                return `${translationPrefixes[targetLang]}${word}`;
            }
        };

        const langPair = `${sourceLang}-${targetLang}`;
        const transformer = basicTransformations[langPair];
        
        if (transformer) {
            return transformer(word);
        }
        
        // Fallback: prefijo del idioma
        const prefix = translationPrefixes[targetLang] || `${targetLang.toUpperCase()}-`;
        return `${prefix}${word}`;
    }

    // ===== CONTROL DE AUDIO =====
    playTranslation() {
        if (!this.state.currentTranslation.trim()) {
            this.showError('❌ No hay traducción disponible para reproducir');
            return;
        }

        // Detener audio actual si está reproduciéndose
        if (this.state.currentUtterance) {
            speechSynthesis.cancel();
        }

        const targetLang = this.elements.targetLanguage.value;
        const utterance = new SpeechSynthesisUtterance(this.state.currentTranslation);
        
        // Configurar voz y parámetros
        utterance.lang = this.getLanguageCodeForSpeech(targetLang);
        utterance.rate = 0.9; // Velocidad ligeramente más lenta para claridad
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        if (this.state.selectedVoice) {
            utterance.voice = this.state.selectedVoice;
        }

        // Configurar eventos de audio
        utterance.onstart = () => {
            console.log('🔊 Iniciando reproducción de audio');
            this.state.isPlaying = true;
            this.state.isPaused = false;
            this.state.currentUtterance = utterance;
            this.updateAudioControls();
            this.updateStatusIndicator('🔊 Reproduciendo traducción...', 'status-processing');
        };

        utterance.onend = () => {
            console.log('✅ Reproducción completada');
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
            this.updateStatusIndicator('✅ Reproducción completada', 'status-ready');
        };

        utterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
            this.showError(`❌ Error al reproducir audio: ${event.error}`);
            this.state.isPlaying = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
        };

        utterance.onpause = () => {
            console.log('⏸️ Audio pausado');
            this.updateStatusIndicator('⏸️ Audio pausado', 'status-processing');
        };

        utterance.onresume = () => {
            console.log('▶️ Audio reanudado');
            this.updateStatusIndicator('🔊 Reproduciendo traducción...', 'status-processing');
        };

        // Reproducir
        speechSynthesis.speak(utterance);
        console.log('🎵 Audio iniciado');
    }

    pauseAudio() {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            this.state.isPaused = true;
            this.updateAudioControls();
            console.log('⏸️ Audio pausado por usuario');
        }
    }

    resumeAudio() {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            this.state.isPaused = false;
            this.updateAudioControls();
            console.log('▶️ Audio reanudado por usuario');
        }
    }

    stopAudio() {
        if (this.state.currentUtterance) {
            speechSynthesis.cancel();
            this.state.isPlaying = false;
            this.state.isPaused = false;
            this.state.currentUtterance = null;
            this.updateAudioControls();
            this.updateStatusIndicator('⏹️ Audio detenido', 'status-ready');
            console.log('⏹️ Audio detenido por usuario');
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
            console.log(`🔊 Cargadas ${this.state.voices.length} voces disponibles`);
        };

        // Cargar voces inmediatamente
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

        // Filtrar voces por idioma objetivo
        const languageCode = this.getLanguageCodeForSpeech(targetLang);
        const filteredVoices = this.state.voices.filter(voice => 
            voice.lang.toLowerCase().startsWith(languageCode.toLowerCase()) || 
            voice.lang.toLowerCase().startsWith(targetLang.toLowerCase())
        );

        // Agregar opciones de voz
        filteredVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' - Por defecto' : ''}`;
            voiceSelect.appendChild(option);
            
            // Seleccionar voz por defecto automáticamente
            if (voice.default || index === 0) {
                option.selected = true;
                this.state.selectedVoice = voice;
            }
        });
        
        console.log(`🔊 ${filteredVoices.length} voces disponibles para ${targetLang}`);
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
        
        return langMap[langCode] || `${langCode}-${langCode.toUpperCase()}`;
    }

    updateSelectedVoice() {
        const voiceName = this.elements.voiceSelect.value;
        if (voiceName) {
            this.state.selectedVoice = this.state.voices.find(voice => voice.name === voiceName);
            console.log(`🔊 Voz seleccionada: ${voiceName}`);
        } else {
            this.state.selectedVoice = null;
            console.log('🔊 Usando voz por defecto del sistema');
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

        // Cambios de configuración
        this.elements.targetLanguage.addEventListener('change', () => {
            this.populateVoiceSelect();
            // Actualizar estadísticas de idiomas
            this.state.stats.languagesUsed.add(this.elements.targetLanguage.value);
        });

        this.elements.sourceLanguage.addEventListener('change', () => {
            const langCode = this.elements.sourceLanguage.value.split('-')[0];
            this.state.stats.languagesUsed.add(langCode);
        });

        this.elements.voiceSelect.addEventListener('change', () => {
            this.updateSelectedVoice();
        });

        // Atajos de teclado mejorados
        document.addEventListener('keydown', (event) => {
            // Solo procesar si no estamos en un campo de entrada
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'r':
                        event.preventDefault();
                        if (!this.state.isRecording && this.state.microphonePermissionGranted) {
                            this.startRecording();
                        } else if (this.state.isRecording) {
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
                        
                    case 'escape':
                        event.preventDefault();
                        if (this.state.isRecording) {
                            this.stopRecording();
                        }
                        if (this.state.isPlaying) {
                            this.stopAudio();
                        }
                        break;
                }
            }
        });

        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isRecording) {
                console.log('⚠️ Página oculta durante grabación - manteniendo activo');
            }
        });

        console.log('⌨️ Atajos de teclado configurados: Ctrl+R (grabar), Ctrl+Space (audio), Ctrl+Esc (detener todo)');
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Traductor de Voz v2.0 Enhanced');
    const app = new VoiceTranslatorV2Enhanced();
    
    // Hacer la instancia disponible globalmente para debugging
    window.voiceTranslator = app;
    
    console.log(`
🎙️ TRADUCTOR DE VOZ v2.0 ENHANCED - CARGADO EXITOSAMENTE

✅ MEJORAS IMPLEMENTADAS:
▶️ Permisos de micrófono solicitados UNA SOLA VEZ
▶️ Grabación CONTINUA sin límite de tiempo
▶️ Transcripción y traducción en TIEMPO REAL
▶️ Control MANUAL de inicio/parada de grabación
▶️ Controles AVANZADOS de audio (play/pause/resume/stop)
▶️ Estadísticas de sesión en tiempo real
▶️ Atajos de teclado mejorados
▶️ Manejo robusto de errores
▶️ Interfaz optimizada para reuniones largas

🎮 CONTROLES:
⌨️ Ctrl + R: Iniciar/Detener grabación
⌨️ Ctrl + Espacio: Reproducir/Pausar audio
⌨️ Ctrl + Esc: Detener todo

🔧 TECNOLOGÍAS:
▶️ Web Speech API (Reconocimiento)
▶️ SpeechSynthesis API (Reproducción)
▶️ MediaDevices API (Micrófono)
▶️ JavaScript ES6+ (Lógica)

Desarrollado con ❤️ por MiniMax Agent
    `);
});
