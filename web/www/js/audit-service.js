// Audit Service - Wellness Mental Web App
// Sistema de auditoría para alertas y acciones según criterios HU-09

const AuditService = {
    /**
     * Registrar acción de auditoría
     * @param {string} actionType - Tipo de acción (alerta_generada, alerta_vista, alerta_actualizada, etc.)
     * @param {object} details - Detalles de la acción
     * @param {string} userId - ID del usuario que realizó la acción
     */
    async logAction(actionType, details, userId = null) {
        try {
            const auditLog = {
                id: this.generateAuditId(),
                actionType: actionType,
                userId: userId || localStorage.getItem('userId'),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ipAddress: await this.getIPAddress(),
                details: details,
                sessionId: this.getSessionId()
            };
            
            console.log('[AUDIT] Acción registrada:', auditLog);
            
            // Guardar en IndexedDB local
            const dbManager = window.dbManager;
            if (dbManager) {
                await dbManager.add(DB_CONFIG.tables.auditLogs, auditLog);
            }
            
            // Intentar guardar en Firebase si está disponible
            if (typeof FirebaseService !== 'undefined' && FirebaseService.getConfigStatus().initialized) {
                try {
                    await FirebaseService.saveAuditLog(auditLog);
                } catch (firebaseError) {
                    console.warn('[AUDIT] No se pudo guardar en Firebase:', firebaseError);
                }
            }
            
            return { success: true, auditLog };
            
        } catch (error) {
            console.error('[AUDIT] Error registrando acción:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Registrar generación de alerta
     */
    async logAlertGeneration(alertData) {
        return this.logAction('alerta_generada', {
            alertType: alertData.tipo,
            riskLevel: alertData.nivelRiesgo,
            studentId: alertData.idEstudiante,
            studentName: alertData.nombreEstudiante,
            extraction: alertData.extracto,
            source: alertData.fuente // 'evaluacion' o 'chat'
        });
    },
    
    /**
     * Registrar visualización de alerta por psicólogo
     */
    async logAlertView(alertId, psychologistId) {
        return this.logAction('alerta_vista', {
            alertId: alertId,
            psychologistId: psychologistId,
            responseTime: this.calculateResponseTime(alertId)
        }, psychologistId);
    },
    
    /**
     * Registrar actualización de estado de alerta
     */
    async logAlertUpdate(alertId, oldStatus, newStatus, notes, psychologistId) {
        return this.logAction('alerta_actualizada', {
            alertId: alertId,
            oldStatus: oldStatus,
            newStatus: newStatus,
            notes: notes,
            psychologistId: psychologistId
        }, psychologistId);
    },
    
    /**
     * Registro de auditoría para acceso de padres
     */
    async logParentAccess(reportId, parentId, ipAddress) {
        return this.logAction('informe_padres_acceso', {
            reportId: reportId,
            parentId: parentId,
            ipAddress: ipAddress,
            timestamp: new Date().toISOString()
        }, parentId);
    },
    
    /**
     * Calcular tiempo de respuesta para una alerta
     */
    calculateResponseTime(alertId) {
        // En una implementación real, esto calcularía el tiempo entre generación y visualización
        // Por ahora, retornamos un valor simulado
        return Math.floor(Math.random() * 60) + 1; // 1-60 minutos
    },
    
    /**
     * Obtener logs de auditoría para un usuario
     */
    async getAuditLogs(userId, limit = 50) {
        try {
            const dbManager = window.dbManager;
            if (!dbManager) return [];
            
            const allLogs = await dbManager.getAll(DB_CONFIG.tables.auditLogs);
            const userLogs = allLogs
                .filter(log => log.userId === userId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
            
            return userLogs;
        } catch (error) {
            console.error('[AUDIT] Error obteniendo logs:', error);
            return [];
        }
    },
    
    /**
     * Obtener logs de auditoría para alertas específicas
     */
    async getAlertAuditLogs(alertId) {
        try {
            const dbManager = window.dbManager;
            if (!dbManager) return [];
            
            const allLogs = await dbManager.getAll(DB_CONFIG.tables.auditLogs);
            const alertLogs = allLogs
                .filter(log => log.details && log.details.alertId === alertId)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            return alertLogs;
        } catch (error) {
            console.error('[AUDIT] Error obteniendo logs de alerta:', error);
            return [];
        }
    },
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    generateAuditId() {
        return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('audit_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('audit_session_id', sessionId);
        }
        return sessionId;
    },
    
    async getIPAddress() {
        try {
            // En producción, esto usaría una API real para obtener la IP
            // Por ahora, retornamos un valor simulado
            return '192.168.1.' + Math.floor(Math.random() * 255);
        } catch (error) {
            return 'unknown';
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditService;
}