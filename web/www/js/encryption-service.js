// Encryption Service - Wellness Mental Web App
// Encriptación AES-256 para datos sensibles según criterios de seguridad

const EncryptionService = {
    /**
     * Encriptar datos usando AES-256-GCM
     * @param {string} data - Datos a encriptar
     * @param {string} key - Clave de encriptación (opcional, generará una si no se proporciona)
     * @returns {object} - { encryptedData, iv, key }
     */
    async encrypt(data, key = null) {
        try {
            // Generar clave si no se proporciona
            if (!key) {
                key = await this.generateKey();
            }
            
            // Generar IV (Initialization Vector)
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Codificar datos
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(data);
            
            // Importar clave
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                this.stringToBytes(key),
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );
            
            // Encriptar
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                cryptoKey,
                dataBytes
            );
            
            // Convertir a base64
            const encryptedBase64 = this.bytesToBase64(new Uint8Array(encryptedData));
            const ivBase64 = this.bytesToBase64(iv);
            
            console.log('[ENCRYPTION] Datos encriptados exitosamente');
            
            return {
                encryptedData: encryptedBase64,
                iv: ivBase64,
                key: key
            };
            
        } catch (error) {
            console.error('[ENCRYPTION] Error encriptando:', error);
            throw new Error('Error al encriptar datos');
        }
    },
    
    /**
     * Desencriptar datos usando AES-256-GCM
     * @param {string} encryptedData - Datos encriptados (base64)
     * @param {string} iv - IV (base64)
     * @param {string} key - Clave de encriptación
     * @returns {string} - Datos desencriptados
     */
    async decrypt(encryptedData, iv, key) {
        try {
            // Decodificar de base64
            const encryptedBytes = this.base64ToBytes(encryptedData);
            const ivBytes = this.base64ToBytes(iv);
            
            // Importar clave
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                this.stringToBytes(key),
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            // Desencriptar
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivBytes },
                cryptoKey,
                encryptedBytes
            );
            
            // Decodificar a string
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decryptedData);
            
            console.log('[ENCRYPTION] Datos desencriptados exitosamente');
            
            return decryptedText;
            
        } catch (error) {
            console.error('[ENCRYPTION] Error desencriptando:', error);
            throw new Error('Error al desencriptar datos');
        }
    },
    
    /**
     * Encriptar resultado de evaluación
     */
    async encryptEvaluationResult(result) {
        try {
            const resultString = JSON.stringify(result);
            const encryption = await this.encrypt(resultString);
            
            const encryptedResult = {
                id: result.id,
                encryptedData: encryption.encryptedData,
                iv: encryption.iv,
                timestamp: result.timestamp,
                userId: result.userId,
                questionnaireId: result.questionnaireId,
                riskLevel: result.riskLevel, // Mantener nivel de riesgo visible
                encrypted: true
            };
            
            console.log('[ENCRYPTION] Resultado de evaluación encriptado');
            return encryptedResult;
            
        } catch (error) {
            console.error('[ENCRYPTION] Error encriptando resultado:', error);
            return result; // Fallback a datos sin encriptar
        }
    },
    
    /**
     * Desencriptar resultado de evaluación
     */
    async decryptEvaluationResult(encryptedResult, key) {
        try {
            if (!encryptedResult.encrypted) {
                return encryptedResult; // No está encriptado
            }
            
            const decryptedString = await this.decrypt(
                encryptedResult.encryptedData,
                encryptedResult.iv,
                key
            );
            
            const decryptedResult = JSON.parse(decryptedString);
            console.log('[ENCRYPTION] Resultado de evaluación desencriptado');
            
            return decryptedResult;
            
        } catch (error) {
            console.error('[ENCRYPTION] Error desencriptando resultado:', error);
            return encryptedResult; // Fallback a datos encriptados
        }
    },
    
    /**
     * Generar clave de encriptación
     */
    async generateKey() {
        const keyBytes = crypto.getRandomValues(new Uint8Array(32)); // 256 bits
        return this.bytesToBase64(keyBytes);
    },
    
    /**
     * Hash de contraseña usando SHA-256
     */
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const passwordBytes = encoder.encode(password);
            
            const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex;
        } catch (error) {
            console.error('[ENCRYPTION] Error hasheando contraseña:', error);
            throw new Error('Error al hashear contraseña');
        }
    },
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    stringToBytes(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    },
    
    bytesToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },
    
    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EncryptionService;
}