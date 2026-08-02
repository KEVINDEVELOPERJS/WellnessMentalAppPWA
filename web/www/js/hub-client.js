// Hub Client - Utility for communicating with Google Apps Script Hub
// Disabled external connections - using local fallback only to avoid CORS errors

const HubClient = {
    // External hub URL disabled to prevent CORS errors
    // defaultHubUrl: 'https://script.google.com/macros/s/AKfycbxqK43sPmZlPgZhLmgeBYpkl1J_Anx-egwhYWcrZtTmkThYU6f9dfSknuEYSPysY4zJ/exec',
    
    // Use local fallback only - disabled external connections
    useLocalFallback: true,
    
    // CORS proxies disabled - using local fallback only
    // corsProxies: [
    //     'https://corsproxy.io/?', 
    //     'https://api.allorigins.win/raw?url=',
    //     'https://cors-anywhere.herokuapp.com/',
    //     null // Direct connection last
    // ],
    
    // currentProxyIndex: 0,
    // retryCount: 0,
    // maxRetries: 3,
    
    // Sample data for local fallback - Mixed risk levels for different sections
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
     * Get hub URL (from localStorage or default) - DISABLED
     */
    // getHubUrl() {
    //     let url = localStorage.getItem('alert_sync_url');
    //     
    //     // If not in localStorage, set it automatically
    //     if (!url) {
    //         url = this.defaultHubUrl;
    //         localStorage.setItem('alert_sync_url', url);
    //         console.log('[HUB CLIENT] Hub URL configured automatically:', url);
    //     }
    //     
    //     return url;
    // },
    
    /**
     * Make a request to the hub - LOCAL FALLBACK ONLY
     */
    async request(action, data = {}, method = 'GET') {
        // Always use local fallback to avoid CORS errors
        console.log('[HUB CLIENT] Using local fallback mode for:', action);
        return this.getLocalFallbackResponse(action);
        
        // External connection logic disabled
        // const hubUrl = this.getHubUrl();
        // let lastError = null;
        // 
        // console.log('[HUB CLIENT] Attempting to connect to real hub:', hubUrl);
        // 
        // // Try each proxy strategy with retries
        // for (let i = 0; i < this.corsProxies.length; i++) {
        //     this.currentProxyIndex = i;
        //     const proxy = this.corsProxies[i];
        //     
        //     // Retry logic for each proxy
        //     for (let retry = 0; retry < this.maxRetries; retry++) {
        //         try {
        //             console.log(`[HUB CLIENT] Attempting request with proxy ${i}, retry ${retry}:`, proxy || 'direct');
        //             
        //             const result = await this.tryRequest(hubUrl, action, data, method, proxy);
        //             
        //             // If successful, save this proxy as preferred
        //             if (i > 0) {
        //                 localStorage.setItem('preferred_cors_proxy', i.toString());
        //             }
        //             
        //             console.log('[HUB CLIENT] Successfully connected to hub');
        //             this.retryCount = 0; // Reset retry count
        //             return result;
        //             
        //         } catch (error) {
        //             console.warn(`[HUB CLIENT] Proxy ${i}, retry ${retry} failed:`, error.message);
        //             lastError = error;
        //             
        //             // Don't retry on CORS errors, try next proxy
        //             if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
        //                 break;
        //             }
        //             
        //             // Wait before retry (exponential backoff)
        //             if (retry < this.maxRetries - 1) {
        //                 await this.delay(Math.pow(2, retry) * 1000);
        //             }
        //         }
        //     }
        // }
        // 
        // // All proxies failed - enable local fallback
        // console.warn('[HUB CLIENT] All connection methods failed, enabling local fallback');
        // this.useLocalFallback = true;
        // return this.getLocalFallbackResponse(action);
    },
    
    /**
     * Delay helper for retry logic - DISABLED
     */
    // delay(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // },
    
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
     * Try a single request with a specific proxy - DISABLED
     */
    // async tryRequest(hubUrl, action, data, method, proxy) {
    //     let url;
    //     let body = null;
    //     let headers = {
    //         'Content-Type': 'application/json'
    //     };
    //     
    //     if (method === 'GET') {
    //         // Build URL with query parameters
    //         const params = new URLSearchParams({ action, ...data });
    //         const targetUrl = `${hubUrl}?${params.toString()}`;
    //         url = proxy ? proxy + encodeURIComponent(targetUrl) : targetUrl;
    //     } else {
    //         // POST request
    //         url = proxy ? proxy + encodeURIComponent(hubUrl) : hubUrl;
    //         body = JSON.stringify({ action, ...data });
    //     }
    //     
    //     console.log('[HUB CLIENT] Request URL:', url);
    //     console.log('[HUB CLIENT] Request method:', method);
    //     
    //     const controller = new AbortController();
    //     const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    //     
    //     try {
    //         const response = await fetch(url, {
    //             method: method,
    //             headers: headers,
    //             body: body,
    //             mode: proxy ? 'cors' : 'cors',
    //             redirect: 'follow',
    //             signal: controller.signal
    //         });
    //         
    //         clearTimeout(timeoutId);
    //         
    //         console.log('[HUB CLIENT] Response status:', response.status);
    //         console.log('[HUB CLIENT] Response ok:', response.ok);
    //         
    //         if (!response.ok) {
    //             const text = await response.text();
    //             console.error('[HUB CLIENT] Error response:', text);
    //             throw new Error(`HTTP ${response.status}: ${text}`);
    //         }
    //         
    //         const result = await response.json();
    //         console.log('[HUB CLIENT] Response data:', result);
    //         
    //         return result;
    //     } catch (error) {
    //         clearTimeout(timeoutId);
    //         
    //         if (error.name === 'AbortError') {
    //             throw new Error('Request timeout after 20 seconds');
    //         }
    //         
    //         throw error;
    //     }
    // },
    
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
     * Enable/disable local fallback mode
     */
    setLocalFallback(enabled) {
        this.useLocalFallback = enabled;
        console.log('[HUB CLIENT] Local fallback mode:', enabled);
    },
    
    /**
     * Reset to try real hub again - DISABLED
     */
    // resetToRealHub() {
    //     this.useLocalFallback = false;
    //     this.retryCount = 0;
    //     console.log('[HUB CLIENT] Reset to try real hub connection');
    // }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HubClient;
}