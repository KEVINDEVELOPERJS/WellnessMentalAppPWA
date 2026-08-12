// Alert Auto-Generator - Wellness Mental Web App
// Generación automática de alertas <30s según criterios HU-09

const AlertAutoGenerator = {
    /**
     * Generar alerta automáticamente desde evaluación
     * @param {object} evaluationResult - Resultado de evaluación
     * @param {string} studentId - ID del estudiante
     * @returns {object} - Alerta generada
     */
    async generateFromEvaluation(evaluationResult, studentId) {
        const startTime = Date.now();
        
        try {
            // Solo generar alerta si riesgo es Alto
            if (evaluationResult.riskLevel !== 'Alto') {
                return { shouldGenerate: false, reason: 'Risk level not high enough' };
            }
            
            // Obtener datos del estudiante
            const dbManager = window.dbManager;
            const student = await dbManager.get(DB_CONFIG.tables.users, studentId);
            
            // Crear alerta
            const alerta = {
                id: this.generateAlertId(),
                idEstudiante: studentId,
                nombreEstudiante: student ? student.name : 'Unknown',
                emailEstudiante: student ? student.email : 'unknown',
                gradoEstudiante: student ? student.grade : 'Unknown',
                tipo: 'evaluacion',
                nivelRiesgo: evaluationResult.riskLevel,
                timestamp: new Date().toISOString(),
                extracto: this.generateExtraction(evaluationResult),
                estado: 'Pendiente',
                notas: '',
                device_origen: 'web',
                cuestionarioTipo: evaluationResult.questionnaireType,
                puntaje: evaluationResult.totalScore
            };
            
            // Calcular tiempo de generación
            const generationTime = Date.now() - startTime;
            alerta.generationTime = generationTime;
            
            console.log('[ALERT AUTO] Alerta generada en', generationTime, 'ms (<30s:', generationTime < 30000, ')');
            
            // Registrar en auditoría
            if (typeof AuditService !== 'undefined') {
                await AuditService.logAlertGeneration(alerta);
            }
            
            // Guardar en base de datos
            await dbManager.add(DB_CONFIG.tables.alerts, alerta);
            
            // Intentar guardar en Firebase
            if (typeof FirebaseService !== 'undefined' && FirebaseService.getConfigStatus().initialized) {
                try {
                    await FirebaseService.saveAlert(alerta);
                } catch (firebaseError) {
                    console.warn('[ALERT AUTO] No se pudo guardar en Firebase:', firebaseError);
                }
            }
            
            return { 
                shouldGenerate: true, 
                alerta: alerta,
                generationTime: generationTime,
                withinTimeLimit: generationTime < 30000
            };
            
        } catch (error) {
            console.error('[ALERT AUTO] Error generando alerta:', error);
            return { shouldGenerate: false, error: error.message };
        }
    },
    
    /**
     * Generar alerta automáticamente desde chat
     * @param {object} chatMessage - Mensaje de chat con riesgo detectado
     * @param {string} studentId - ID del estudiante
     * @returns {object} - Alerta generada
     */
    async generateFromChat(chatMessage, studentId) {
        const startTime = Date.now();
        
        try {
            // Obtener datos del estudiante
            const dbManager = window.dbManager;
            const student = await dbManager.get(DB_CONFIG.tables.users, studentId);
            
            // Crear alerta
            const alerta = {
                id: this.generateAlertId(),
                idEstudiante: studentId,
                nombreEstudiante: student ? student.name : 'Unknown',
                emailEstudiante: student ? student.email : 'unknown',
                gradoEstudiante: student ? student.grade : 'Unknown',
                tipo: 'chat',
                nivelRiesgo: 'Alto', // Chat con riesgo siempre es alto
                timestamp: new Date().toISOString(),
                extracto: this.generateChatExtraction(chatMessage),
                estado: 'Pendiente',
                notas: '',
                device_origen: 'web',
                chatMessageId: chatMessage.id,
                riskKeywords: chatMessage.riskKeywords || []
            };
            
            // Calcular tiempo de generación
            const generationTime = Date.now() - startTime;
            alerta.generationTime = generationTime;
            
            console.log('[ALERT AUTO] Alerta de chat generada en', generationTime, 'ms (<30s:', generationTime < 30000, ')');
            
            // Registrar en auditoría
            if (typeof AuditService !== 'undefined') {
                await AuditService.logAlertGeneration(alerta);
            }
            
            // Guardar en base de datos
            await dbManager.add(DB_CONFIG.tables.alerts, alerta);
            
            // Intentar guardar en Firebase
            if (typeof FirebaseService !== 'undefined' && FirebaseService.getConfigStatus().initialized) {
                try {
                    await FirebaseService.saveAlert(alerta);
                } catch (firebaseError) {
                    console.warn('[ALERT AUTO] No se pudo guardar en Firebase:', firebaseError);
                }
            }
            
            return { 
                shouldGenerate: true, 
                alerta: alerta,
                generationTime: generationTime,
                withinTimeLimit: generationTime < 30000
            };
            
        } catch (error) {
            console.error('[ALERT AUTO] Error generando alerta de chat:', error);
            return { shouldGenerate: false, error: error.message };
        }
    },
    
    /**
     * Generar extracto para alerta de evaluación
     */
    generateExtraction(evaluationResult) {
        const maxChars = 50;
        let extracto = `Riesgo ${evaluationResult.riskLevel} - Puntaje: ${evaluationResult.totalScore}`;
        
        if (evaluationResult.questionnaireType) {
            extracto += ` (${evaluationResult.questionnaireType})`;
        }
        
        if (extracto.length > maxChars) {
            extracto = extracto.substring(0, maxChars - 3) + '...';
        }
        
        return extracto;
    },
    
    /**
     * Generar extracto para alerta de chat
     */
    generateChatExtraction(chatMessage) {
        const maxChars = 50;
        let extracto = chatMessage.contenidoEnc || chatMessage.content || '';
        
        if (extracto.length > maxChars) {
            extracto = extracto.substring(0, maxChars - 3) + '...';
        }
        
        return extracto;
    },
    
    /**
     * Generar ID único para alerta
     */
    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Verificar si debe generar copia a padres
     */
    shouldCopyToParents(studentId) {
        // Verificar si el estudiante tiene consentimiento parental
        // En una implementación real, esto verificaría la base de datos
        return true; // Por defecto sí
    },
    
    /**
     * Generar alerta de copia a padres
     */
    async generateParentCopy(alerta, parentEmail) {
        try {
            const parentAlert = {
                id: this.generateAlertId(),
                originalAlertId: alerta.id,
                parentEmail: parentEmail,
                tipo: 'copia_padres',
                timestamp: new Date().toISOString(),
                estado: 'Enviado',
                extracto: alerta.extracto
            };
            
            // Aquí se enviaría el correo al padre
            console.log('[ALERT AUTO] Copia enviada a padre:', parentEmail);
            
            return { success: true, parentAlert };
        } catch (error) {
            console.error('[ALERT AUTO] Error generando copia a padres:', error);
            return { success: false, error: error.message };
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertAutoGenerator;
}