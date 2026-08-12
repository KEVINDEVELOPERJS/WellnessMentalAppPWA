// Evaluation History Service - Wellness Mental Web App
// Historial de evaluaciones según criterios HU-10

const EvaluationHistoryService = {
    /**
     * Obtener historial de evaluaciones de un usuario
     * @param {string} userId - ID del usuario
     * @returns {array} - Historial de evaluaciones
     */
    async getEvaluationHistory(userId) {
        try {
            const dbManager = window.dbManager;
            if (!dbManager) return [];
            
            const allResults = await dbManager.getAll(DB_CONFIG.tables.results);
            const userResults = allResults
                .filter(result => result.userId === userId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Enriquecer con información del cuestionario
            const enrichedHistory = await Promise.all(
                userResults.map(async (result) => {
                    const questionnaire = await dbManager.get(DB_CONFIG.tables.questionnaires, result.questionnaireId);
                    return {
                        ...result,
                        questionnaireName: questionnaire ? questionnaire.nombre : 'Unknown',
                        questionnaireType: questionnaire ? questionnaire.tipo : 'Unknown',
                        formattedDate: this.formatDate(result.timestamp),
                        riskLevelColor: this.getRiskLevelColor(result.riskLevel)
                    };
                })
            );
            
            return enrichedHistory;
        } catch (error) {
            console.error('[EVAL HISTORY] Error obteniendo historial:', error);
            return [];
        }
    },
    
    /**
     * Obtener estadísticas de evaluaciones
     * @param {string} userId - ID del usuario
     * @returns {object} - Estadísticas
     */
    async getEvaluationStats(userId) {
        try {
            const history = await this.getEvaluationHistory(userId);
            
            const stats = {
                totalEvaluations: history.length,
                averageScore: 0,
                riskDistribution: {
                    Bajo: 0,
                    Medio: 0,
                    Alto: 0
                },
                trend: [],
                mostRecentEvaluation: history.length > 0 ? history[0] : null
            };
            
            if (history.length > 0) {
                // Calcular promedio
                const totalScore = history.reduce((sum, result) => sum + (result.totalScore || 0), 0);
                stats.averageScore = Math.round(totalScore / history.length);
                
                // Distribución de riesgo
                history.forEach(result => {
                    if (stats.riskDistribution[result.riskLevel] !== undefined) {
                        stats.riskDistribution[result.riskLevel]++;
                    }
                });
                
                // Tendencia (últimas 10 evaluaciones)
                stats.trend = history.slice(0, 10).reverse().map(result => ({
                    date: this.formatDate(result.timestamp),
                    score: result.totalScore,
                    riskLevel: result.riskLevel
                }));
            }
            
            return stats;
        } catch (error) {
            console.error('[EVAL HISTORY] Error obteniendo estadísticas:', error);
            return {
                totalEvaluations: 0,
                averageScore: 0,
                riskDistribution: { Bajo: 0, Medio: 0, Alto: 0 },
                trend: [],
                mostRecentEvaluation: null
            };
        }
    },
    
    /**
     * Guardar resultado de evaluación en historial
     */
    async saveEvaluationResult(result) {
        try {
            const dbManager = window.dbManager;
            if (!dbManager) return { success: false };
            
            const enrichedResult = {
                ...result,
                timestamp: new Date().toISOString(),
                id: this.generateResultId()
            };
            
            await dbManager.add(DB_CONFIG.tables.results, enrichedResult);
            
            // Intentar guardar en Firebase
            if (typeof FirebaseService !== 'undefined' && FirebaseService.getConfigStatus().initialized) {
                try {
                    await FirebaseService.saveEvaluationResult(enrichedResult);
                } catch (firebaseError) {
                    console.warn('[EVAL HISTORY] No se pudo guardar en Firebase:', firebaseError);
                }
            }
            
            console.log('[EVAL HISTORY] Resultado guardado:', enrichedResult.id);
            return { success: true, result: enrichedResult };
            
        } catch (error) {
            console.error('[EVAL HISTORY] Error guardando resultado:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Obtener detalles de una evaluación específica
     */
    async getEvaluationDetails(resultId) {
        try {
            const dbManager = window.dbManager;
            if (!dbManager) return null;
            
            const result = await dbManager.get(DB_CONFIG.tables.results, resultId);
            if (!result) return null;
            
            // Obtener respuestas asociadas
            const allResponses = await dbManager.getAll(DB_CONFIG.tables.responses);
            const resultResponses = allResponses.filter(response => response.resultId === resultId);
            
            return {
                ...result,
                responses: resultResponses,
                formattedDate: this.formatDate(result.timestamp)
            };
        } catch (error) {
            console.error('[EVAL HISTORY] Error obteniendo detalles:', error);
            return null;
        }
    },
    
    /**
     * Comparar evaluaciones para detectar tendencias
     */
    compareEvaluations(evaluation1, evaluation2) {
        const scoreDifference = (evaluation2.totalScore || 0) - (evaluation1.totalScore || 0);
        const riskChange = this.compareRiskLevels(evaluation1.riskLevel, evaluation2.riskLevel);
        
        return {
            scoreDifference,
            riskChange,
            improvement: scoreDifference < 0,
            stable: scoreDifference === 0 && riskChange === 'Sin cambio'
        };
    },
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    getRiskLevelColor(riskLevel) {
        const colors = {
            'Bajo': '#28a745',
            'Medio': '#ffc107',
            'Alto': '#dc3545'
        };
        return colors[riskLevel] || '#6c757d';
    },
    
    compareRiskLevels(level1, level2) {
        const riskOrder = { 'Bajo': 1, 'Medio': 2, 'Alto': 3 };
        const value1 = riskOrder[level1] || 0;
        const value2 = riskOrder[level2] || 0;
        
        if (value2 > value1) return 'Aumentó';
        if (value2 < value1) return 'Disminuyó';
        return 'Sin cambio';
    },
    
    generateResultId() {
        return 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EvaluationHistoryService;
}