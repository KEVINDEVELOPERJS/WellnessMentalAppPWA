// Prediagnosis Generator - Wellness Mental Web App
// Generación automática de prediagnóstico textual según criterios HU-03

const PrediagnosisGenerator = {
    /**
     * Generar prediagnóstico textual basado en el puntaje y tipo de cuestionario
     * @param {number} score - Puntaje total
     * @param {string} questionnaireType - Tipo de cuestionario (GAD-7, PHQ-9, PSS-10)
     * @param {string} riskLevel - Nivel de riesgo (Bajo, Medio, Alto)
     * @param {object} answers - Respuestas individuales
     */
    generate(score, questionnaireType, riskLevel, answers = []) {
        const generators = {
            'GAD-7': this.generateGAD7,
            'PHQ-9': this.generatePHQ9,
            'PSS-10': this.generatePSS10,
            'general': this.generateGeneral
        };
        
        const generator = generators[questionnaireType] || generators.general;
        return generator.call(this, score, riskLevel, answers);
    },
    
    /**
     * Generar prediagnóstico para GAD-7 (Ansiedad)
     */
    generateGAD7(score, riskLevel, answers) {
        const templates = {
            'Bajo': [
                "Tu puntaje indica un nivel de ansiedad dentro del rango normal. Los síntomas reportados son leves y no interfieren significativamente con tus actividades diarias. Se recomienda continuar con prácticas de bienestar mental y mantener hábitos saludables.",
                "Los resultados sugieren que manejas bien los niveles de estrés cotidiano. No se detectan signos significativos de ansiedad que requieran intervención profesional inmediata. Las técnicas de relajación pueden ser útiles para mantener este equilibrio.",
                "Tu evaluación muestra un buen manejo emocional. Los niveles de ansiedad están dentro de los parámetros esperados para tu edad. Continúa con las actividades que te brindan bienestar."
            ],
            'Medio': [
                "Tu puntaje indica niveles moderados de ansiedad que podrían estar afectando tu bienestar emocional. Los síntomas reportados sugieren que podrías beneficiarte de técnicas de manejo del estrés y ansiedad. Se recomienda practicar ejercicios de respiración, mindfulness y considerar hablar con un adulto de confianza.",
                "Los resultados muestran signos de ansiedad moderada que podrían interferir con algunas actividades. Es importante implementar estrategias de afrontamiento saludables y considerar buscar apoyo si los síntomas persisten o aumentan.",
                "Tu evaluación indica que experimentas ansiedad en un nivel que requiere atención. Las técnicas de relajación, el ejercicio regular y el mantenimiento de una rutina saludable pueden ser beneficiosos. No dudes en buscar apoyo si lo necesitas."
            ],
            'Alto': [
                "Tu puntaje indica niveles significativos de ansiedad que podrían estar afectando considerablemente tu calidad de vida. Los síntomas reportados sugieren que sería beneficioso buscar apoyo profesional. Un psicólogo puede ayudarte a desarrollar estrategias efectivas para manejar la ansiedad.",
                "Los resultados muestran signos de ansiedad elevada que requieren atención profesional. Los síntomas descritos podrían interferir con tus actividades diarias y bienestar general. Se recomienda buscar apoyo psicológico para un manejo adecuado.",
                "Tu evaluación indica altos niveles de ansiedad que ameritan intervención profesional. Es importante que busques apoyo de un psicólogo o profesional de salud mental. No estás solo en esto, hay recursos disponibles para ayudarte."
            ]
        };
        
        return this.selectTemplate(templates[riskLevel], score);
    },
    
    /**
     * Generar prediagnóstico para PHQ-9 (Depresión)
     */
    generatePHQ9(score, riskLevel, answers) {
        const templates = {
            'Bajo': [
                "Tu puntaje indica un estado de ánimo dentro del rango normal. No se detectan signos significativos de depresión. Los sentimientos experimentados son parte normal de las fluctuaciones emocionales. Se recomienda mantener actividades que te proporcionen bienestar.",
                "Los resultados sugieren que tienes un buen estado de ánimo general. No hay indicadores de depresión que requieran intervención inmediata. Continúa con tus actividades y relaciones sociales que te brindan satisfacción.",
                "Tu evaluación muestra un equilibrio emocional saludable. Los niveles de ánimo están dentro de los parámetros normales. Mantén tus hábitos saludables y actividades placenteras."
            ],
            'Medio': [
                "Tu puntaje indica síntomas depresivos leves a moderados que podrían estar afectando tu bienestar. Los síntomas reportados sugieren que podrías beneficiarte de aumentar actividades que te gusten, mantener rutinas y considerar hablar con alguien de confianza.",
                "Los resultados muestran signos de depresión moderada que requieren atención. Es importante mantener conexiones sociales, actividad física y buscar apoyo si los síntomas persisten por más de dos semanas.",
                "Tu evaluación indica que podrías estar experimentando síntomas depresivos. El ejercicio regular, el sueño adecuado y mantener relaciones sociales pueden ser beneficiosos. Considera buscar apoyo profesional si los síntomas continúan."
            ],
            'Alto': [
                "Tu puntaje indica síntomas depresivos significativos que requieren atención profesional. Los síntomas reportados sugieren que sería muy beneficioso buscar apoyo de un psicólogo. La depresión es tratable y hay recursos disponibles para ayudarte.",
                "Los resultados muestran signos de depresión que ameritan intervención profesional. Es importante que busques apoyo de un profesional de salud mental. No ignores estos síntomas; hay tratamientos efectivos disponibles.",
                "Tu evaluación indica síntomas depresivos que requieren atención inmediata. Por favor, busca apoyo de un psicólogo o profesional de salud mental. No tienes que enfrentar esto solo; hay ayuda disponible."
            ]
        };
        
        return this.selectTemplate(templates[riskLevel], score);
    },
    
    /**
     * Generar prediagnóstico para PSS-10 (Estrés)
     */
    generatePSS10(score, riskLevel, answers) {
        const templates = {
            'Bajo': [
                "Tu puntaje indica que manejas bien los niveles de estrés. Tienes buenas estrategias de afrontamiento y los factores estresantes no parecen estar afectando significativamente tu bienestar. Continúa con tus prácticas de manejo del estrés.",
                "Los resultados sugieren que tienes un buen equilibrio en el manejo del estrés. Los factores estresantes están dentro de niveles manejables. Mantén tus rutinas y técnicas de relajación actuales.",
                "Tu evaluación muestra que manejas adecuadamente el estrés cotidiano. Tienes recursos efectivos para enfrentar situaciones difíciles. Continúa con tus hábitos saludables."
            ],
            'Medio': [
                "Tu puntaje indica niveles de estrés moderados que podrían estar afectando tu bienestar. Es importante implementar técnicas de manejo del estrés como respiración, ejercicio y priorización de actividades. Considera hablar con un adulto de confianza.",
                "Los resultados muestran niveles de estrés que requieren atención. Los factores estresantes actuales podrían estar afectando tu calidad de vida. Implementa técnicas de relajación y busca apoyo si los síntomas persisten.",
                "Tu evaluación indica que experimentas estrés en un nivel que requiere estrategias de afrontamiento más efectivas. El descanso adecuado, el ejercicio y la organización del tiempo pueden ser beneficiosos."
            ],
            'Alto': [
                "Tu puntaje indica niveles altos de estrés que requieren atención profesional. Los factores estresantes actuales parecen estar afectando significativamente tu bienestar. Un psicólogo puede ayudarte a desarrollar estrategias efectivas de manejo del estrés.",
                "Los resultados muestran niveles de estrés elevados que ameritan intervención. Es importante que busques apoyo para manejar los factores estresantes. Hay recursos disponibles para ayudarte a recuperar el equilibrio.",
                "Tu evaluación indica estrés significativo que requiere atención profesional. Por favor, busca apoyo de un psicólogo o profesional de salud mental. Aprender a manejar el estrés es importante para tu bienestar a largo plazo."
            ]
        };
        
        return this.selectTemplate(templates[riskLevel], score);
    },
    
    /**
     * Generar prediagnóstico general
     */
    generateGeneral(score, riskLevel, answers) {
        const templates = {
            'Bajo': "Tu evaluación indica un buen estado de bienestar emocional. Los resultados están dentro de los parámetros normales. Continúa con tus prácticas de bienestar.",
            'Medio': "Tu evaluación indica que podrías beneficiarte de implementar estrategias de manejo del estrés y ansiedad. Considera buscar apoyo si los síntomas persisten.",
            'Alto': "Tu evaluación indica que sería beneficioso buscar apoyo profesional. Un psicólogo puede ayudarte a desarrollar estrategias efectivas para manejar tu bienestar emocional."
        };
        
        return templates[riskLevel] || templates['Bajo'];
    },
    
    /**
     * Seleccionar una plantilla aleatoria y personalizar
     */
    selectTemplate(templates, score) {
        if (!templates || templates.length === 0) {
            return "Prediagnóstico no disponible en este momento.";
        }
        
        const randomIndex = Math.floor(Math.random() * templates.length);
        let template = templates[randomIndex];
        
        // Personalizar con el puntaje
        template = template.replace('{score}', score);
        
        return template;
    },
    
    /**
     * Generar recomendaciones basadas en el nivel de riesgo
     */
    generateRecommendations(riskLevel, questionnaireType) {
        const baseRecommendations = {
            'Bajo': [
                "Practicar ejercicios de respiración diariamente",
                "Mantener una rutina de sueño regular (7-9 horas)",
                "Realizar actividad física moderada regularmente",
                "Mantener conexiones sociales saludables",
                "Practicar mindfulness o meditación"
            ],
            'Medio': [
                "Implementar técnicas de manejo del estrés",
                "Establecer límites saludables en actividades",
                "Buscar apoyo de amigos y familiares",
                "Considerar hablar con un consejero escolar",
                "Reducir el tiempo en redes sociales",
                "Practicar técnicas de relajación"
            ],
            'Alto': [
                "Buscar apoyo profesional (psicólogo/terapeuta)",
                "Hablar con un adulto de confianza inmediatamente",
                "Contactar líneas de ayuda si hay pensamientos negativos",
                "Mantener contacto regular con apoyo profesional",
                "Priorizar autocuidado y descanso",
                "Evitar situaciones que aumenten el estrés"
            ]
        };
        
        const specificRecommendations = {
            'GAD-7': [
                "Practicar técnicas de respiración 4-7-8",
                "Identificar y desafiar pensamientos ansiosos",
                "Limitar consumo de cafeína",
                "Establecer horarios de preocupación (worry time)"
            ],
            'PHQ-9': [
                "Mantener rutinas diarias estructuradas",
                "Realizar actividades placenteras incluso si no ganas motivación",
                "Estar al aire libre diariamente",
                "Mantener conexiones sociales activas"
            ],
            'PSS-10': [
                "Organizar tareas por prioridad",
                "Aprender a decir no a demandas excesivas",
                "Practicar técnicas de gestión del tiempo",
                "Tomar descansos regulares durante el día"
            ]
        };
        
        const recommendations = [...baseRecommendations[riskLevel]];
        if (specificRecommendations[questionnaireType]) {
            recommendations.push(...specificRecommendations[questionnaireType].slice(0, 2));
        }
        
        return recommendations;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrediagnosisGenerator;
}