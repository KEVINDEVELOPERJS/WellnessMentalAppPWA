// Hub Client - Utility for communicating with Google Apps Script Hub
// Web version: Uses local fallback + simulation of multidispositivo for development
// Note: Google Apps Script has CORS restrictions for web browsers (unlike Android)
// Solution: Use backend API or Firebase Cloud Functions for production

const HubClient = {
    // Google Apps Script Hub URL - configure your deployed script URL here
    defaultHubUrl: 'https://script.google.com/macros/s/AKfycbxqK43sPmZlPgZhLmgeBYpkl1J_Anx-egwhYWcrZtTmkThYU6f9dfSknuEYSPysY4zJ/exec',
    
    // Use local fallback by default for web (CORS restrictions)
    useLocalFallback: true,
    
    // Web simulation mode - simulates multidispositivo behavior
    webSimulationMode: true,
    
    // Backend API URL for production (configure your own backend)
    backendApiUrl: localStorage.getItem('backend_api_url') || null,
    
    currentProxyIndex: 0,
    retryCount: 0,
    maxRetries: 3,
    
    // Sample data for local fallback - Enhanced with multidispositivo simulation
    sampleAlerts: [
        {
            remoteId: 'sample-android-1',
            idReferencia: 'sample-android-1',
            nombreEstudiante: 'María García',
            gradoEstudiante: '10°',
            tipo: 'evaluacion',
            nivelRiesgo: 'alto',
            timestamp: new Date().toISOString(),
            extracto: 'Evaluación Alto. Puntaje 18. Niveles elevados de ansiedad y depresión detectados.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'  // Simula que viene de Android
        },
        {
            remoteId: 'sample-web-1',
            idReferencia: 'sample-web-1',
            nombreEstudiante: 'Juan Pérez',
            gradoEstudiante: '11°',
            tipo: 'chat',
            nivelRiesgo: 'alto',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            extracto: 'Chat con IA - Estudiante expresa pensamientos preocupantes sobre el futuro.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'  // Simula que viene de Web
        },
        {
            remoteId: 'sample-android-2',
            idReferencia: 'sample-android-2',
            nombreEstudiante: 'Ana López',
            gradoEstudiante: '9°',
            tipo: 'evaluacion',
            nivelRiesgo: 'medio',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            extracto: 'Evaluación Medio. Puntaje 14. Niveles moderados de ansiedad detectados. Estudiante muestra signos de estrés académico.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'
        },
        {
            remoteId: 'sample-web-2',
            idReferencia: 'sample-web-2',
            nombreEstudiante: 'Carlos Rodríguez',
            gradoEstudiante: '10°',
            tipo: 'chat',
            nivelRiesgo: 'medio',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            extracto: 'Chat con IA - Estudiante expresa preocupación por exámenes finales y presión familiar.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        },
        {
            remoteId: 'sample-android-3',
            idReferencia: 'sample-android-3',
            nombreEstudiante: 'Laura Martínez',
            gradoEstudiante: '11°',
            tipo: 'evaluacion',
            nivelRiesgo: 'bajo',
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            extracto: 'Evaluación Bajo. Puntaje 8. Niveles leves de ansiedad. Estudiante maneja bien el estrés.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'
        },
        {
            remoteId: 'sample-web-3',
            idReferencia: 'sample-web-3',
            nombreEstudiante: 'Pedro Sánchez',
            gradoEstudiante: '9°',
            tipo: 'evaluacion',
            nivelRiesgo: 'bajo',
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            extracto: 'Evaluación Bajo. Puntaje 6. Sin signos significativos de estrés. Buen funcionamiento general.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        }
    ],
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
            extracto: 'Evaluación Medio. Puntaje 14. Niveles moderados de ansiedad detectados. Estudiante muestra signos de estrés académico.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        },
        {
            remoteId: 'sample-4',
            idReferencia: 'sample-4',
            nombreEstudiante: 'Carlos Rodríguez',
            gradoEstudiante: '10°',
            tipo: 'chat',
            nivelRiesgo: 'medio',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            extracto: 'Chat con IA - Estudiante expresa preocupación por exámenes finales y presión familiar.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'android'
        },
        {
            remoteId: 'sample-5',
            idReferencia: 'sample-5',
            nombreEstudiante: 'Laura Martínez',
            gradoEstudiante: '11°',
            tipo: 'evaluacion',
            nivelRiesgo: 'bajo',
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            extracto: 'Evaluación Bajo. Puntaje 8. Niveles leves de ansiedad. Estudiante maneja bien el estrés.',
            estado: 'PENDIENTE',
            notas: '',
            deviceOrigen: 'web'
        },
        {
            remoteId: 'sample-6',
            idReferencia: 'sample-6',
            nombreEstudiante: 'Pedro Sánchez',
            gradoEstudiante: '9°',
            tipo: 'evaluacion',
            nivelRiesgo: 'bajo',
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            extracto: 'Evaluación Bajo. Puntaje 6. Sin signos significativos de estrés. Buen funcionamiento general.',
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
     * Make a request to the hub - Web version with CORS handling
     */
    async request(action, data = {}, method = 'GET') {
        // For web, use local fallback by default due to Google Apps Script CORS restrictions
        if (this.useLocalFallback || this.webSimulationMode) {
            console.log('[HUB CLIENT] Using local fallback mode for:', action);
            return this.getLocalFallbackResponse(action);
        }
        
        // Try backend API if configured (for production)
        if (this.backendApiUrl) {
            try {
                console.log('[HUB CLIENT] Using backend API:', this.backendApiUrl);
                return await this.requestFromBackend(action, data, method);
            } catch (error) {
                console.warn('[HUB CLIENT] Backend API failed, falling back to local:', error.message);
                this.useLocalFallback = true;
                return this.getLocalFallbackResponse(action);
            }
        }
        
        console.log('[HUB CLIENT] No backend configured, using local fallback');
        this.useLocalFallback = true;
        return this.getLocalFallbackResponse(action);
    },

    /**
     * Request from backend API (for production)
     */
    async requestFromBackend(action, data = {}, method = 'GET') {
        const backendUrl = this.backendApiUrl;
        const url = `${backendUrl}/${action}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (method === 'POST') {
            options.body = JSON.stringify(data);
        } else {
            // Add query parameters for GET
            const params = new URLSearchParams(data);
            url.search = params.toString();
        }
        
        const response = await fetch(url, options);
        return await response.json();
    },
    
    /**
     * Delay helper for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
     * Try a single request with a specific proxy
     */
    async tryRequest(hubUrl, action, data, method, proxy) {
        let url;
        let body = null;
        let headers = {
            'Content-Type': 'application/json'
        };
        
        if (method === 'GET') {
            // Build URL with query parameters
            const params = new URLSearchParams({ action, ...data });
            const targetUrl = `${hubUrl}?${params.toString()}`;
            url = proxy ? proxy + encodeURIComponent(targetUrl) : targetUrl;
        } else {
            // POST request
            url = proxy ? proxy + encodeURIComponent(hubUrl) : hubUrl;
            body = JSON.stringify({ action, ...data });
        }
        
        console.log('[HUB CLIENT] Request URL:', url);
        console.log('[HUB CLIENT] Request method:', method);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: body,
                mode: proxy ? 'cors' : 'cors',
                redirect: 'follow',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('[HUB CLIENT] Response status:', response.status);
            console.log('[HUB CLIENT] Response ok:', response.ok);
            
            if (!response.ok) {
                const text = await response.text();
                console.error('[HUB CLIENT] Error response:', text);
                throw new Error(`HTTP ${response.status}: ${text}`);
            }
            
            const result = await response.json();
            console.log('[HUB CLIENT] Response data:', result);
            
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout after 20 seconds');
            }
            
            throw error;
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
        try {
            const result = await this.request('listar');
            return {
                success: true,
                data: result,
                fallback: result._fallback || false
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Configure backend API for production
     */
    configureBackendApi(backendUrl) {
        this.backendApiUrl = backendUrl;
        localStorage.setItem('backend_api_url', backendUrl);
        console.log('[HUB CLIENT] Backend API configured:', backendUrl);
        this.useLocalFallback = false;
        this.webSimulationMode = false;
    },

    /**
     * Reset to local fallback mode
     */
    resetToLocalFallback() {
        this.useLocalFallback = true;
        this.webSimulationMode = true;
        this.backendApiUrl = null;
        localStorage.removeItem('backend_api_url');
        console.log('[HUB CLIENT] Reset to local fallback mode');
    },

    /**
     * Reset to try real hub again (disabled for web)
     */
    resetToRealHub() {
        console.log('[HUB CLIENT] Note: Google Apps Script has CORS restrictions for web browsers');
        console.log('[HUB CLIENT] Use configureBackendApi() to configure your own backend for production');
        this.resetToLocalFallback();
    }
};
    
    /**
     * Enable/disable local fallback mode
     */
    setLocalFallback(enabled) {
        this.useLocalFallback = enabled;
        console.log('[HUB CLIENT] Local fallback mode:', enabled);
    },
    
    /**
     * Reset to try real hub again
     */
    resetToRealHub() {
        this.useLocalFallback = false;
        this.retryCount = 0;
        console.log('[HUB CLIENT] Reset to try real hub connection');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HubClient;
}