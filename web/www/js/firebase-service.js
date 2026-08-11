// Firebase Database Service - Wellness Mental Web App
// Compatible con Android SQLite Room Database
// Usando Firebase Realtime Database para persistencia en servidor

const FirebaseService = {
    initialized: false,
    database: null,
    auth: null,
    config: {
        apiKey: localStorage.getItem('firebase_api_key') || '',
        authDomain: localStorage.getItem('firebase_auth_domain') || '',
        databaseURL: localStorage.getItem('firebase_database_url') || '',
        projectId: localStorage.getItem('firebase_project_id') || '',
        storageBucket: localStorage.getItem('firebase_storage_bucket') || '',
        messagingSenderId: localStorage.getItem('firebase_messaging_sender_id') || '',
        appId: localStorage.getItem('firebase_app_id') || ''
    },

    /**
     * Initialize Firebase with configuration
     */
    init(config = null) {
        console.log('[FIREBASE] init called with config:', config);
        
        if (config) {
            this.config = { ...this.config, ...config };
            // Save config to localStorage
            Object.keys(config).forEach(key => {
                localStorage.setItem(`firebase_${key}`, config[key]);
            });
            console.log('[FIREBASE] Config updated:', this.config);
        }

        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.error('[FIREBASE] Firebase SDK not loaded - checking window.firebase');
            console.log('[FIREBASE] window.firebase available:', typeof window.firebase);
            return false;
        }

        console.log('[FIREBASE] Firebase SDK is available, attempting initialization');

        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                console.log('[FIREBASE] No existing Firebase apps, initializing new one');
                firebase.initializeApp(this.config);
                console.log('[FIREBASE] Firebase app initialized');
            } else {
                console.log('[FIREBASE] Firebase app already exists, using existing');
            }

            this.database = firebase.database();
            this.auth = firebase.auth();
            this.initialized = true;

            console.log('[FIREBASE] Firebase initialized successfully');
            console.log('[FIREBASE] Database reference:', this.database);
            console.log('[FIREBASE] Auth reference:', this.auth);
            return true;
        } catch (error) {
            console.error('[FIREBASE] Firebase initialization error:', error);
            console.error('[FIREBASE] Error details:', error.message, error.stack);
            return false;
        }
    },

    /**
     * Check if Firebase is configured
     */
    isConfigured() {
        return this.config.apiKey && this.config.databaseURL && this.config.projectId;
    },

    /**
     * Get Firebase configuration status
     */
    getConfigStatus() {
        return {
            initialized: this.initialized,
            configured: this.isConfigured(),
            hasApiKey: !!this.config.apiKey,
            hasDatabaseURL: !!this.config.databaseURL,
            hasProjectId: !!this.config.projectId,
            mode: this.isConfigured() ? 'production' : 'demo'
        };
    },

    // ==================== USERS OPERATIONS ====================

    /**
     * Create user in Firebase (equivalente a UsuarioDAO.insert)
     */
    async createUser(userData) {
        console.log('[FIREBASE] createUser called with data:', userData);
        console.log('[FIREBASE] Firebase initialized:', this.initialized);
        console.log('[FIREBASE] Database available:', !!this.database);
        
        if (!this.initialized) {
            console.warn('[FIREBASE] Not initialized, using local fallback');
            return this.createUserLocal(userData);
        }

        try {
            console.log('[FIREBASE] Attempting to create user in Firebase');
            const usersRef = this.database.ref('usuarios');
            const newUserRef = usersRef.push();
            
            console.log('[FIREBASE] New user ref key:', newUserRef.key);
            
            const userWithId = {
                id: newUserRef.key,
                nombre: userData.nombre,
                email: userData.email,
                password_hash: userData.password_hash || '',
                edad: userData.edad,
                grado: userData.grado,
                rol: userData.rol || 'estudiante',
                fecha_registro: new Date().toISOString(),
                estado: 'activo',
                consentimiento_padres: userData.consentimiento_padres || 0,
                tutor_email: userData.tutor_email || null,
                consentimiento_token: userData.consentimiento_token || null,
                consentimiento_token_expira_at: userData.consentimiento_token_expira_at || null
            };

            console.log('[FIREBASE] User data to save:', userWithId);
            
            await newUserRef.set(userWithId);
            console.log('[FIREBASE] User created successfully:', userWithId.id);
            return { success: true, user: userWithId };
        } catch (error) {
            console.error('[FIREBASE] Error creating user:', error);
            console.error('[FIREBASE] Error details:', error.message, error.code);
            return { success: false, error: error.message };
        }
    },

    /**
     * Create user locally (fallback)
     */
    async createUserLocal(userData) {
        const users = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const newId = Date.now().toString();
        
        const userWithId = {
            id: newId,
            nombre: userData.nombre,
            email: userData.email,
            password_hash: userData.password_hash || '',
            edad: userData.edad,
            grado: userData.grado,
            rol: userData.rol || 'estudiante',
            fecha_registro: new Date().toISOString(),
            estado: 'activo',
            consentimiento_padres: userData.consentimiento_padres || 0,
            tutor_email: userData.tutor_email || null
        };

        users.push(userWithId);
        localStorage.setItem('firebase_users', JSON.stringify(users));
        
        return { success: true, user: userWithId, local: true };
    },

    /**
     * Get user by email (equivalente a UsuarioDAO.getByEmail)
     */
    async getUserByEmail(email) {
        if (!this.initialized) {
            return this.getUserByEmailLocal(email);
        }

        try {
            const usersRef = this.database.ref('usuarios');
            const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                const userId = Object.keys(users)[0];
                return { success: true, user: { id: userId, ...users[userId] } };
            }
            
            return { success: false, error: 'User not found' };
        } catch (error) {
            console.error('[FIREBASE] Error getting user by email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user by email locally (fallback)
     */
    async getUserByEmailLocal(email) {
        const users = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (user) {
            return { success: true, user, local: true };
        }
        
        return { success: false, error: 'User not found', local: true };
    },

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        if (!this.initialized) {
            return this.getUserByIdLocal(userId);
        }

        try {
            const userRef = this.database.ref(`usuarios/${userId}`);
            const snapshot = await userRef.once('value');
            
            if (snapshot.exists()) {
                return { success: true, user: { id: userId, ...snapshot.val() } };
            }
            
            return { success: false, error: 'User not found' };
        } catch (error) {
            console.error('[FIREBASE] Error getting user by ID:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user by ID locally (fallback)
     */
    async getUserByIdLocal(userId) {
        const users = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (user) {
            return { success: true, user, local: true };
        }
        
        return { success: false, error: 'User not found', local: true };
    },

    /**
     * Update user
     */
    async updateUser(userId, updates) {
        if (!this.initialized) {
            return this.updateUserLocal(userId, updates);
        }

        try {
            const userRef = this.database.ref(`usuarios/${userId}`);
            await userRef.update(updates);
            console.log('[FIREBASE] User updated:', userId);
            return { success: true };
        } catch (error) {
            console.error('[FIREBASE] Error updating user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update user locally (fallback)
     */
    async updateUserLocal(userId, updates) {
        const users = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('firebase_users', JSON.stringify(users));
            return { success: true, local: true };
        }
        
        return { success: false, error: 'User not found', local: true };
    },

    // ==================== PSYCHOLOGISTS OPERATIONS ====================

    /**
     * Get all psychologists
     */
    async getPsychologists() {
        if (!this.initialized) {
            return this.getPsychologistsLocal();
        }

        try {
            const usersRef = this.database.ref('usuarios');
            const snapshot = await usersRef.orderByChild('rol').equalTo('psicologo').once('value');
            
            if (snapshot.exists()) {
                const psychologists = snapshot.val();
                const psychologistsArray = Object.keys(psychologists).map(key => ({
                    id: key,
                    ...psychologists[key]
                }));
                return { success: true, psychologists: psychologistsArray };
            }
            
            return { success: true, psychologists: [] };
        } catch (error) {
            console.error('[FIREBASE] Error getting psychologists:', error);
            return { success: false, error: error.message, psychologists: [] };
        }
    },

    /**
     * Get psychologists locally (fallback)
     */
    async getPsychologistsLocal() {
        const users = JSON.parse(localStorage.getItem('firebase_users') || '[]');
        const psychologists = users.filter(u => u.rol === 'psicologo');
        return { success: true, psychologists, local: true };
    },

    // ==================== ALERTS OPERATIONS ====================

    /**
     * Create alert (equivalente a AlertaDAO.insert)
     */
    async createAlert(alertData) {
        if (!this.initialized) {
            return this.createAlertLocal(alertData);
        }

        try {
            const alertsRef = this.database.ref('alertas_riesgo');
            const newAlertRef = alertsRef.push();
            
            const alertWithId = {
                id: newAlertRef.key,
                remoteId: alertData.remoteId || newAlertRef.key,
                idReferencia: alertData.idReferencia,
                emailEstudiante: alertData.emailEstudiante,
                nombreEstudiante: alertData.nombreEstudiante,
                gradoEstudiante: alertData.gradoEstudiante,
                tipo: alertData.tipo,
                nivelRiesgo: alertData.nivelRiesgo,
                timestamp: alertData.timestamp || new Date().toISOString(),
                extracto: alertData.extracto,
                estado: alertData.estado || 'PENDIENTE',
                notas: alertData.notas || '',
                deviceOrigen: alertData.deviceOrigen || 'web',
                emailPsicologo: alertData.emailPsicologo || null
            };

            await newAlertRef.set(alertWithId);
            console.log('[FIREBASE] Alert created:', alertWithId.id);
            return { success: true, alert: alertWithId };
        } catch (error) {
            console.error('[FIREBASE] Error creating alert:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Create alert locally (fallback)
     */
    async createAlertLocal(alertData) {
        const alerts = JSON.parse(localStorage.getItem('firebase_alerts') || '[]');
        const newId = Date.now().toString();
        
        const alertWithId = {
            id: newId,
            remoteId: alertData.remoteId || newId,
            ...alertData
        };

        alerts.push(alertWithId);
        localStorage.setItem('firebase_alerts', JSON.stringify(alerts));
        
        return { success: true, alert: alertWithId, local: true };
    },

    /**
     * Get all alerts
     */
    async getAlerts() {
        if (!this.initialized) {
            return this.getAlertsLocal();
        }

        try {
            const alertsRef = this.database.ref('alertas_riesgo');
            const snapshot = await alertsRef.once('value');
            
            if (snapshot.exists()) {
                const alerts = snapshot.val();
                const alertsArray = Object.keys(alerts).map(key => ({
                    id: key,
                    ...alerts[key]
                }));
                return { success: true, alerts: alertsArray };
            }
            
            return { success: true, alerts: [] };
        } catch (error) {
            console.error('[FIREBASE] Error getting alerts:', error);
            return { success: false, error: error.message, alerts: [] };
        }
    },

    /**
     * Get alerts locally (fallback)
     */
    async getAlertsLocal() {
        const alerts = JSON.parse(localStorage.getItem('firebase_alerts') || '[]');
        return { success: true, alerts, local: true };
    },

    /**
     * Update alert status
     */
    async updateAlertStatus(alertId, estado, notas) {
        if (!this.initialized) {
            return this.updateAlertStatusLocal(alertId, estado, notas);
        }

        try {
            const alertRef = this.database.ref(`alertas_riesgo/${alertId}`);
            await alertRef.update({
                estado,
                notas,
                timestampActualizacion: new Date().toISOString()
            });
            console.log('[FIREBASE] Alert status updated:', alertId);
            return { success: true };
        } catch (error) {
            console.error('[FIREBASE] Error updating alert status:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update alert status locally (fallback)
     */
    async updateAlertStatusLocal(alertId, estado, notas) {
        const alerts = JSON.parse(localStorage.getItem('firebase_alerts') || '[]');
        const alertIndex = alerts.findIndex(a => a.id === alertId || a.remoteId === alertId);
        
        if (alertIndex !== -1) {
            alerts[alertIndex] = {
                ...alerts[alertIndex],
                estado,
                notas,
                timestampActualizacion: new Date().toISOString()
            };
            localStorage.setItem('firebase_alerts', JSON.stringify(alerts));
            return { success: true, local: true };
        }
        
        return { success: false, error: 'Alert not found', local: true };
    },

    // ==================== QUESTIONNAIRES OPERATIONS ====================

    /**
     * Get all questionnaires
     */
    async getQuestionnaires() {
        if (!this.initialized) {
            return this.getQuestionnairesLocal();
        }

        try {
            const questionnairesRef = this.database.ref('cuestionarios');
            const snapshot = await questionnairesRef.once('value');
            
            if (snapshot.exists()) {
                const questionnaires = snapshot.val();
                const questionnairesArray = Object.keys(questionnaires).map(key => ({
                    id: key,
                    ...questionnaires[key]
                }));
                return { success: true, questionnaires: questionnairesArray };
            }
            
            return { success: true, questionnaires: [] };
        } catch (error) {
            console.error('[FIREBASE] Error getting questionnaires:', error);
            return { success: false, error: error.message, questionnaires: [] };
        }
    },

    /**
     * Get questionnaires locally (fallback)
     */
    async getQuestionnairesLocal() {
        const questionnaires = JSON.parse(localStorage.getItem('firebase_questionnaires') || '[]');
        return { success: true, questionnaires, local: true };
    },

    // ==================== RESULTS OPERATIONS ====================

    /**
     * Save questionnaire result
     */
    async saveResult(resultData) {
        if (!this.initialized) {
            return this.saveResultLocal(resultData);
        }

        try {
            const resultsRef = this.database.ref('resultados');
            const newResultRef = resultsRef.push();
            
            const resultWithId = {
                id: newResultRef.key,
                ...resultData,
                fecha: resultData.fecha || new Date().toISOString()
            };

            await newResultRef.set(resultWithId);
            console.log('[FIREBASE] Result saved:', resultWithId.id);
            return { success: true, result: resultWithId };
        } catch (error) {
            console.error('[FIREBASE] Error saving result:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Save result locally (fallback)
     */
    async saveResultLocal(resultData) {
        const results = JSON.parse(localStorage.getItem('firebase_results') || '[]');
        const newId = Date.now().toString();
        
        const resultWithId = {
            id: newId,
            ...resultData,
            fecha: resultData.fecha || new Date().toISOString()
        };

        results.push(resultWithId);
        localStorage.setItem('firebase_results', JSON.stringify(results));
        
        return { success: true, result: resultWithId, local: true };
    },

    /**
     * Get user results
     */
    async getUserResults(userId) {
        if (!this.initialized) {
            return this.getUserResultsLocal(userId);
        }

        try {
            const resultsRef = this.database.ref('resultados');
            const snapshot = await resultsRef.orderByChild('id_usuario').equalTo(userId).once('value');
            
            if (snapshot.exists()) {
                const results = snapshot.val();
                const resultsArray = Object.keys(results).map(key => ({
                    id: key,
                    ...results[key]
                }));
                return { success: true, results: resultsArray };
            }
            
            return { success: true, results: [] };
        } catch (error) {
            console.error('[FIREBASE] Error getting user results:', error);
            return { success: false, error: error.message, results: [] };
        }
    },

    /**
     * Get user results locally (fallback)
     */
    async getUserResultsLocal(userId) {
        const results = JSON.parse(localStorage.getItem('firebase_results') || '[]');
        const userResults = results.filter(r => r.id_usuario === userId);
        return { success: true, results: userResults, local: true };
    },

    // ==================== SYNC OPERATIONS ====================

    /**
     * Listen for real-time updates (compatible con Android SyncManager)
     */
    listenToAlerts(callback) {
        if (!this.initialized) {
            console.warn('[FIREBASE] Not initialized, cannot listen to real-time updates');
            return null;
        }

        const alertsRef = this.database.ref('alertas_riesgo');
        const listener = alertsRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const alerts = snapshot.val();
                const alertsArray = Object.keys(alerts).map(key => ({
                    id: key,
                    ...alerts[key]
                }));
                callback(alertsArray);
            } else {
                callback([]);
            }
        });

        return listener;
    },

    /**
     * Stop listening to updates
     */
    stopListening(listener) {
        if (listener && this.initialized) {
            this.database.ref('alertas_riesgo').off('value', listener);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
}