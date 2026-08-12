// NLP Analysis Service - Wellness Mental Web App
// Análisis NLP básico para detección de riesgo en chat según criterios HU-02

const NLPAnalysis = {
    /**
     * Palabras clave de riesgo para detección automática
     */
    riskKeywords: {
        suicide: [
            'suicidio', 'matarme', 'morir', 'acabar con mi vida', 'no quiero vivir',
            'preferiría estar muerto', 'cortarme la vida', 'me quiero matar',
            'me quiero ir', 'terminar con todo', 'dejar de existir'
        ],
        selfHarm: [
            'cortarme', 'herirme', 'hacerme daño', 'autolesión', 'autolesionarme',
            'golpearme', 'lastimarme', 'dañarme', 'cortes', 'brazalete'
        ],
        despair: [
            'no puedo más', 'todo está perdido', 'no tiene sentido', 'soy inútil',
            'nadie me quiere', 'soy una carga', 'me siento vacío', 'estoy solo',
            'nadie me entiende', 'no hay esperanza', 'estoy atrapado'
        ],
        crisis: [
            'crisis', 'emergencia', 'ayuda urgente', 'no puedo controlarlo',
            'voy a explotar', 'no soporto más', 'necesito ayuda ahora'
        ]
    },
    
    /**
     * Analizar sentimiento de un mensaje (0.0 - 1.0)
     * @param {string} message - Mensaje a analizar
     * @returns {object} - { score: number, emotions: object, keywords: array }
     */
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        let sentimentScore = 0.5; // Neutral por defecto
        const emotions = {
            positive: 0,
            negative: 0,
            anxious: 0,
            sad: 0,
            angry: 0
        };
        const detectedKeywords = [];
        
        // Palabras positivas
        const positiveWords = ['feliz', 'bien', 'mejor', 'gracias', 'alegre', 'contento', 'feliz', 'excelente', 'genial'];
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                emotions.positive += 1;
                detectedKeywords.push(word);
            }
        });
        
        // Palabras negativas
        const negativeWords = ['triste', 'mal', 'peor', 'feo', 'horrible', 'terrible', 'malo', 'difícil', 'duro'];
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                emotions.negative += 1;
                detectedKeywords.push(word);
            }
        });
        
        // Palabras de ansiedad
        const anxiousWords = ['ansioso', 'nervioso', 'preocupado', 'miedo', 'pánico', 'tensión', 'angustia'];
        anxiousWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                emotions.anxious += 1;
                detectedKeywords.push(word);
            }
        });
        
        // Palabras de tristeza
        const sadWords = ['triste', 'deprimido', 'llorar', 'solo', 'vacío', 'desanimado', 'melancolía'];
        sadWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                emotions.sad += 1;
                detectedKeywords.push(word);
            }
        });
        
        // Palabras de enojo
        const angryWords = ['enojado', 'furioso', 'irritado', 'molesto', 'frustrado', 'odio'];
        angryWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                emotions.angry += 1;
                detectedKeywords.push(word);
            }
        });
        
        // Calcular score de sentimiento
        const totalEmotions = emotions.positive + emotions.negative + emotions.anxious + emotions.sad + emotions.angry;
        if (totalEmotions > 0) {
            sentimentScore = emotions.positive / totalEmotions;
        }
        
        return {
            score: sentimentScore,
            emotions: emotions,
            keywords: detectedKeywords,
            riskLevel: this.calculateRiskLevel(emotions)
        };
    },
    
    /**
     * Detectar riesgo suicida/autolesión
     * @param {string} message - Mensaje a analizar
     * @returns {object} - { riskDetected: boolean, riskType: string, severity: number }
     */
    detectRisk(message) {
        const lowerMessage = message.toLowerCase();
        let riskDetected = false;
        let riskType = null;
        let severity = 0;
        const detectedKeywords = [];
        
        // Verificar cada categoría de riesgo
        Object.keys(this.riskKeywords).forEach(category => {
            this.riskKeywords[category].forEach(keyword => {
                if (lowerMessage.includes(keyword)) {
                    riskDetected = true;
                    riskType = category;
                    severity += 1;
                    detectedKeywords.push(keyword);
                }
            });
        });
        
        // Normalizar severidad (0.0 - 1.0)
        const normalizedSeverity = Math.min(severity / 3, 1.0);
        
        console.log('[NLP] Análisis de riesgo:', {
            message: message.substring(0, 50) + '...',
            riskDetected,
            riskType,
            severity: normalizedSeverity,
            keywords: detectedKeywords
        });
        
        return {
            riskDetected,
            riskType,
            severity: normalizedSeverity,
            keywords: detectedKeywords,
            shouldAlert: normalizedSeverity > 0.75 // Alerta si severidad > 0.75
        };
    },
    
    /**
     * Calcular nivel de riesgo emocional
     */
    calculateRiskLevel(emotions) {
        const negativeScore = emotions.negative + emotions.anxious + emotions.sad + emotions.angry;
        const positiveScore = emotions.positive;
        
        if (negativeScore === 0 && positiveScore > 0) {
            return 'bajo';
        } else if (negativeScore <= 2) {
            return 'medio';
        } else {
            return 'alto';
        }
    },
    
    /**
     * Generar respuesta empática basada en el análisis
     * @param {string} userMessage - Mensaje del usuario
     * @param {object} analysis - Análisis NLP
     * @returns {string} - Respuesta empática
     */
    generateEmpatheticResponse(userMessage, analysis) {
        const { emotions, riskLevel } = analysis;
        
        // Respuestas base según emociones predominantes
        if (emotions.sad > emotions.anxious && emotions.sad > emotions.angry) {
            return this.getSadResponse();
        } else if (emotions.anxious > emotions.sad && emotions.anxious > emotions.angry) {
            return this.getAnxiousResponse();
        } else if (emotions.angry > emotions.sad && emotions.angry > emotions.anxious) {
            return this.getAngryResponse();
        } else if (emotions.positive > 0) {
            return this.getPositiveResponse();
        } else {
            return this.getNeutralResponse();
        }
    },
    
    getSadResponse() {
        const responses = [
            "Siento que estés pasando por momentos difíciles. Es valiente que compartas tus sentimientos. ¿Hay algo específico que te esté haciendo sentir así?",
            "Lamento que te sientas así. Tus sentimientos son válidos y importantes. Estoy aquí para escucharte.",
            "Es normal sentirse triste a veces. No estás solo en esto. ¿Quieres contarme más sobre lo que estás experimentando?",
            "Gracias por compartir cómo te sientes. Tomarse tiempo para procesar emociones difíciles es un paso importante. ¿Hay algo que te ayude a sentirte un poco mejor?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getAnxiousResponse() {
        const responses = [
            "Entiendo que te sientas ansioso. La ansiedad puede ser muy difícil de manejar. ¿Hay algo específico que te esté preocupando en este momento?",
            "Siento que estés experimentando ansiedad. Hay técnicas que pueden ayudar. ¿Te gustaría probar algunos ejercicios de respiración?",
            "La ansiedad puede sentirse abrumadora, pero hay formas de manejarla. Estoy aquí para apoyarte. ¿Qué triggered estos sentimientos?",
            "Es normal sentir ansiedad en situaciones estresantes. Tomemos un momento para respirar juntos. ¿Te gustaría intentar una técnica de relajación?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getAngryResponse() {
        const responses = [
            "Entiendo que te sientas enojado. El enojo es una emoción válida. ¿Qué fue lo que te provocó estos sentimientos?",
            "Siento que estés molesto. Es importante encontrar formas saludables de expresar el enojo. ¿Quieres hablar más sobre lo que sucedió?",
            "El enojo puede ser una señal de que algo importante para nosotros está siendo afectado. ¿Hay algo que podamos hacer para manejar esta situación?",
            "Gracias por compartir cómo te sientes. A veces el enojo puede ser difícil de manejar. Estoy aquí para escucharte sin juzgarte."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getPositiveResponse() {
        const responses = [
            "¡Me alegra que te sientas bien! Es importante celebrar los momentos positivos. ¿Hay algo específico que te hizo sentir así?",
            "Es maravilloso escuchar que tienes un buen día. ¡Sigue así! ¿Quieres compartir más sobre lo que te hizo sentir bien?",
            "¡Qué bueno saber que te sientes positivo! Las emociones agradables merecen ser reconocidas. ¿Hay algo especial que estés celebrando hoy?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    getNeutralResponse() {
        const responses = [
            "Gracias por compartir cómo te sientes. Estoy aquí para escucharte y apoyarte. ¿Hay algo específico en lo que te gustaría hablar?",
            "Valor que estés tomando tiempo para expresarte. ¿Cómo ha sido tu día hasta ahora?",
            "Estoy aquí para ayudarte. ¿Hay algo en particular que quieras conversar?",
            "Gracias por comunicarte conmigo. ¿En qué puedo ayudarte hoy?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NLPAnalysis;
}