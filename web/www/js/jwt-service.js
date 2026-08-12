// JWT Service - Wellness Mental Web App
// Sistema de tokens JWT con expiración 24h según criterios de aceptación HU-01

const JWTService = {
    /**
     * Generar un token JWT simple (simulado para entorno navegador)
     * En producción, esto debería usar una librería JWT real
     */
    generateToken(payload, expiresIn = '24h') {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };
        
        const now = Math.floor(Date.now() / 1000);
        const expTime = this.getExpirationTime(expiresIn);
        
        const tokenPayload = {
            ...payload,
            iat: now,
            exp: expTime,
            jti: this.generateJTI()
        };
        
        // Simulación de JWT - en producción usar librería real
        const tokenString = this.b64encode(JSON.stringify(header)) + '.' + 
                           this.b64encode(JSON.stringify(tokenPayload)) + '.' + 
                           this.generateSignature();
        
        // Guardar información del token
        const tokenInfo = {
            token: tokenString,
            expiresAt: expTime * 1000,
            issuedAt: now * 1000,
            payload: payload
        };
        
        localStorage.setItem('jwt_token', tokenString);
        localStorage.setItem('jwt_token_info', JSON.stringify(tokenInfo));
        
        console.log('[JWT] Token generado para:', payload.email, 'expira en:', new Date(expTime * 1000).toLocaleString());
        
        return tokenString;
    },
    
    /**
     * Verificar si el token es válido y no ha expirado
     */
    verifyToken(token) {
        try {
            const tokenInfo = JSON.parse(localStorage.getItem('jwt_token_info') || '{}');
            
            if (!tokenInfo.expiresAt) {
                return { valid: false, error: 'Token sin información de expiración' };
            }
            
            const now = Date.now();
            if (now >= tokenInfo.expiresAt) {
                console.log('[JWT] Token expirado');
                return { valid: false, error: 'Token expirado' };
            }
            
            console.log('[JWT] Token válido, expira en:', new Date(tokenInfo.expiresAt).toLocaleString());
            return { valid: true, payload: tokenInfo.payload };
            
        } catch (error) {
            console.error('[JWT] Error verificando token:', error);
            return { valid: false, error: error.message };
        }
    },
    
    /**
     * Obtener el payload del token actual
     */
    getCurrentPayload() {
        try {
            const tokenInfo = JSON.parse(localStorage.getItem('jwt_token_info') || '{}');
            return tokenInfo.payload || null;
        } catch (error) {
            console.error('[JWT] Error obteniendo payload:', error);
            return null;
        }
    },
    
    /**
     * Refrescar el token (generar uno nuevo)
     */
    refreshToken(payload) {
        console.log('[JWT] Refrescando token');
        return this.generateToken(payload);
    },
    
    /**
     * Limpiar el token (logout)
     */
    clearToken() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_token_info');
        console.log('[JWT] Token eliminado');
    },
    
    /**
     * Verificar si el token está próximo a expirar (para refresh automático)
     */
    shouldRefreshToken() {
        try {
            const tokenInfo = JSON.parse(localStorage.getItem('jwt_token_info') || '{}');
            if (!tokenInfo.expiresAt) return false;
            
            const now = Date.now();
            const timeUntilExpiry = tokenInfo.expiresAt - now;
            const oneHour = 60 * 60 * 1000;
            
            // Refrescar si falta menos de 1 hora
            return timeUntilExpiry < oneHour;
            
        } catch (error) {
            return false;
        }
    },
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    getExpirationTime(expiresIn) {
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresIn.endsWith('h')) {
            const hours = parseInt(expiresIn);
            return now + (hours * 60 * 60);
        } else if (expiresIn.endsWith('d')) {
            const days = parseInt(expiresIn);
            return now + (days * 24 * 60 * 60);
        } else if (expiresIn.endsWith('m')) {
            const minutes = parseInt(expiresIn);
            return now + (minutes * 60);
        }
        
        // Default: 24 horas
        return now + (24 * 60 * 60);
    },
    
    generateJTI() {
        return 'jwt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    b64encode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    },
    
    generateSignature() {
        // Simulación de firma - en producción usar firma real
        return this.b64encode('signature_' + Date.now() + '_' + Math.random().toString(36));
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JWTService;
}