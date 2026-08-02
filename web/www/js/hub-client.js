// Hub Client - Utility for communicating with Google Apps Script Hub
// Currently using local fallback mode for testing

const HubClient = {
    // Nueva URL del hub proporcionada por el usuario
    defaultHubUrl: 'https://script.google.com/macros/s/AKfycbxqK43sPmZlPgZhLmgeBYpkl1J_Anx-egwhYWcrZtTmkThYU6f9dfSknuEYSPysY4zJ/exec',
    
    // Force local fallback mode (hub is not configured)
    useLocalFallback: true,
    
    // Sample data for local fallback
    sampleAlerts: [
        {
            remoteId: 'sample-1',
            idReferencia: 'sample-1',
            nombreEstudiante: 'María García',
            gradoEstudiante: '10°',
            tipo: 'evaluacion',
            nivelRiesgo: 'alto',
            timestamp: new Date().toISOString(),
            extracto: 'Evaluación Alto. Puntaje 18. Niveles elevados de ansiedad y depresión detectados.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        },
        {
            remoteId: 'sample-2',
            idReferencia: 'sample-2',
            nombreEstudiante: 'Juan Pérez',
            gradoEstudiante: '11°',
            tipo: 'chat',
            nivelRiesgo: 'alto',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            extracto: 'Chat con IA - Estudiante expresa pensamientos preocupantes sobre el futuro.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'
        },
        {
            remoteId: 'sample-3',
            idReferencia: 'sample-3',
            nombreEstudiante: 'Ana López',
            gradoEstudiante: '9°',
            tipo: 'evaluacion',
            nivelRiesgo: 'medio',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            extracto: 'Evaluación Medio. Puntaje 12. Niveles moderados de estrés.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        },
        {
            remoteId: 'sample-4',
            idReferencia: 'sample-4',
            nombreEstudiante: 'Carlos Rodríguez',
            gradoEstudiante: '10°',
            tipo: 'evaluacion',
            nivelRiesgo: 'bajo',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            extracto: 'Evaluación Bajo. Puntaje 8. Niveles leves de ansiedad.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'
        }
    ],
    
    /**
     * Get hub URL (from localStorage or default)
     */
    getHubUrl() {
        let url = localStorage.getItem('alert_sync_url');
        
        // If not in localStorage, set it automatically
        if (!url) {
            url = this.defaultHubUrl;
            localStorage.setItem('alert_sync_url', url);
            console.log('[HUB CLIENT] Hub URL configured automatically:', url);
        }
        
        return url;
    },
    
    /**
     * Make a request to the hub (using local fallback)
     */
    async request(action, data = {}, method = 'GET') {
        // Always use local fallback for now
        console.log('[HUB CLIENT] Using local fallback mode for:', action);
        return this.getLocalFallbackResponse(action);
    },
    
    /**
     * Get local fallback response for testing
     */
    getLocalFallbackResponse(action) {
        switch(action) {
            case 'listar':
                return {
                    ok: true,
                    alertas: this.sampleAlerts,
                    _fallback: true
                };
            case 'listar_psicologos':
                return {
                    ok: true,
                    psicologos: [
                        { email: 'psicologo@wellnessmental.com', nombre: 'Dr. Psicólogo' }
                    ],
                    _fallback: true
                };
            case 'publicar':
            case 'actualizar':
                // Simulate successful operations
                return {
                    ok: true,
                    message: 'Operación completada (modo local)',
                    _fallback: true
                };
            default:
                return {
                    ok: true,
                    _fallback: true
                };
        }
    },
    
    /**
     * List alerts from hub
     */
    async listAlerts() {
        return this.request('listar');
    },
    
    /**
     * Publish alert to hub
     */
    async publishAlert(alertData) {
        return this.request('publicar', { alerta: JSON.stringify(alertData) }, 'GET');
    },
    
    /**
     * Update alert status on hub
     */
    async updateAlertStatus(remoteId, estado, notas) {
        return this.request('actualizar', {
            remoteId,
            estado,
            notas,
            timestampActualizacion: new Date().toISOString()
        }, 'POST');
    },
    
    /**
     * List psychologists from hub
     */
    async listPsychologists() {
        return this.request('listar_psicologos');
    },
    
    /**
     * Test hub connection
     */
    async testConnection() {
        return {
            success: true,
            data: await this.request('listar'),
            fallback: true,
            message: 'Usando modo local de prueba'
        };
    },
    
    /**
     * Enable/disable local fallback mode
     */
    setLocalFallback(enabled) {
        this.useLocalFallback = enabled;
        console.log('[HUB CLIENT] Local fallback mode:', enabled);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HubClient;
}