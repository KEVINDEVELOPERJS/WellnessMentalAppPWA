// Hub Client - Utility for communicating with Google Apps Script Hub
// Handles CORS issues with multiple fallback strategies

const HubClient = {
    // CORS proxies to try
    corsProxies: [
        null, // Direct connection first
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/'
    ],
    
    currentProxyIndex: 0,
    
    /**
     * Make a request to the hub with automatic CORS handling
     * @param {string} action - The action to perform (listar, publicar, actualizar, etc.)
     * @param {object} data - Data to send
     * @param {string} method - HTTP method (GET, POST)
     * @returns {Promise<object>} Response data
     */
    async request(action, data = {}, method = 'GET') {
        const hubUrl = localStorage.getItem('alert_sync_url') || '';
        
        if (!hubUrl) {
            throw new Error('Hub URL not configured');
        }
        
        let lastError = null;
        
        // Try each proxy strategy
        for (let i = 0; i < this.corsProxies.length; i++) {
            this.currentProxyIndex = i;
            const proxy = this.corsProxies[i];
            
            try {
                console.log(`[HUB CLIENT] Attempting request with proxy ${i}:`, proxy || 'direct');
                
                const result = await this.tryRequest(hubUrl, action, data, method, proxy);
                
                // If successful, save this proxy as preferred
                if (i > 0) {
                    localStorage.setItem('preferred_cors_proxy', i.toString());
                }
                
                return result;
                
            } catch (error) {
                console.warn(`[HUB CLIENT] Proxy ${i} failed:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        // All proxies failed
        throw new Error(`All connection methods failed. Last error: ${lastError.message}`);
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
        console.log('[HUB CLIENT] Request body:', body);
        
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body,
            mode: proxy ? 'cors' : 'cors',
            redirect: 'follow'
        });
        
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
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * Get preferred proxy index
     */
    getPreferredProxy() {
        const saved = localStorage.getItem('preferred_cors_proxy');
        return saved ? parseInt(saved) : 0;
    },
    
    /**
     * Reset proxy preference
     */
    resetProxyPreference() {
        localStorage.removeItem('preferred_cors_proxy');
        this.currentProxyIndex = 0;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HubClient;
}