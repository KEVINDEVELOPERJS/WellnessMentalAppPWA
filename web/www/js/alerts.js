// Alerts Module for Psychologists - Based on Android AlertasPsicologoActivity
// With Hub Synchronization, Push Notifications, and Email Service (like Android)

const AlertsModule = {
    alerts: [],
    selectedAlert: null,
    hubUrl: '',
    pollingInterval: null,
    userRol: null,
    db: null,
    pushEnabled: false,
    emailEnabled: false,

    async init() {
        console.log('[ALERTS] Initializing alerts module');
        
        try {
            // Check user role
            this.checkUserRole();
            
            // Setup event listeners first (prevent UI issues)
            this.setupEventListeners();
            
            // Initialize database
            await this.initDatabase();
            
            // Initialize push notifications
            await this.initPushNotifications();
            
            // Initialize email service
            this.initEmailService();
            
            // Load hub URL
            this.loadHubUrl();
            
            // Sync and load alerts
            await this.syncAndLoad();
            
            // Start periodic update (30 seconds like Android)
            this.startPeriodicUpdate();
            
            console.log('[ALERTS] Initialization complete');
        } catch (error) {
            console.error('[ALERTS] Initialization error:', error);
            this.showToast('Error al inicializar módulo de alertas');
        }
    },

    checkUserRole() {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        this.userRol = userData.rol;
        
        console.log('[ALERTS] User role check:', this.userRol);
        
        // Allow access for development if role is not set
        if (!this.userRol) {
            console.log('[ALERTS] No role set, setting default role for development');
            this.userRol = 'psicologo';
            return true;
        }
        
        if (this.userRol !== 'psicologo') {
            console.error('[ALERTS] Access denied: User is not a psychologist');
            this.showToast('Acceso denegado: Solo psicólogos pueden ver esta página');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    },

    async initPushNotifications() {
        try {
            console.log('[ALERTS] Initializing push notifications');
            
            if (typeof PushNotifications !== 'undefined') {
                const initialized = await PushNotifications.init();
                this.pushEnabled = initialized;
                
                if (initialized) {
                    console.log('[ALERTS] Push notifications enabled');
                    
                    // Request permission if not granted
                    if (PushNotifications.permission !== 'granted') {
                        console.log('[ALERTS] Requesting push notification permission');
                        const granted = await PushNotifications.requestPermission();
                        this.pushEnabled = granted;
                    }
                    
                    // Listen for new alerts from push
                    window.addEventListener('newAlert', (event) => {
                        console.log('[ALERTS] New alert received via push:', event.detail);
                        this.handleNewPushAlert(event.detail);
                    });
                } else {
                    console.warn('[ALERTS] Push notifications not available');
                }
            } else {
                console.warn('[ALERTS] PushNotifications module not available');
            }
        } catch (error) {
            console.error('[ALERTS] Error initializing push notifications:', error);
            this.pushEnabled = false;
        }
    },

    initEmailService() {
        try {
            console.log('[ALERTS] Initializing email service');
            
            if (typeof EmailService !== 'undefined') {
                this.emailEnabled = true;
                console.log('[ALERTS] Email service enabled');
                
                // Check configuration status
                const configStatus = EmailService.getConfigStatus();
                console.log('[ALERTS] Email service config status:', configStatus);
                
                if (!configStatus.isConfigured) {
                    console.warn('[ALERTS] Email service not fully configured (using demo mode)');
                }
            } else {
                console.warn('[ALERTS] EmailService module not available');
                this.emailEnabled = false;
            }
        } catch (error) {
            console.error('[ALERTS] Error initializing email service:', error);
            this.emailEnabled = false;
        }
    },

    handleNewPushAlert(alert) {
        // Process new alert received via push notification
        console.log('[ALERTS] Processing new push alert:', alert);
        
        // Add to alerts array if not already present
        const existingIndex = this.alerts.findIndex(a => 
            a.remoteId === alert.remoteId || a.id === alert.id
        );
        
        if (existingIndex === -1) {
            // Transform and add new alert
            const transformedAlert = this.transformHubAlerts([alert])[0];
            this.alerts.unshift(transformedAlert);
            
            // Save to database
            this.saveAlertsToDatabase();
            
            // Update UI
            this.showAlerts();
            
            // Show toast notification
            this.showToast(`Nueva alerta: ${alert.nombreEstudiante || 'Estudiante'}`);
            
            // If high risk, also send email notification
            if (alert.nivelRiesgo?.toLowerCase() === 'alto' && this.emailEnabled) {
                this.sendEmailForAlert(alert);
            }
        }
    },

    async sendEmailForAlert(alert) {
        if (!this.emailEnabled) {
            console.log('[ALERTS] Email service not enabled, skipping email');
            return;
        }
        
        try {
            console.log('[ALERTS] Sending email for alert:', alert.remoteId);
            
            // Get psychologist email from localStorage or user data
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            const psicologoEmail = userData.email || 'psicologo@wellnessmental.com';
            
            const result = await EmailService.enviarAlertaPrioritaria(psicologoEmail, alert);
            
            if (result.success) {
                console.log('[ALERTS] Email sent successfully for alert:', alert.remoteId);
            } else {
                console.error('[ALERTS] Failed to send email:', result.error);
            }
        } catch (error) {
            console.error('[ALERTS] Error sending email for alert:', error);
        }
    },

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('wellness_mental', 2);
            
            request.onerror = () => {
                console.error('[ALERTS] Error opening database:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[ALERTS] Database opened successfully');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('alerts')) {
                    db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    },

    loadHubUrl() {
        // Load hub URL from HubClient (now enabled for real connection)
        this.hubUrl = HubClient.getHubUrl();
        console.log('[ALERTS] Hub URL loaded:', this.hubUrl ? 'Configured' : 'Not configured');
        
        // Force configure if not set
        if (!this.hubUrl) {
            const defaultUrl = 'https://script.google.com/macros/s/AKfycbxqK43sPmZlPgZhLmgeBYpkl1J_Anx-egwhYWcrZtTmkThYU6f9dfSknuEYSPysY4zJ/exec';
            localStorage.setItem('alert_sync_url', defaultUrl);
            this.hubUrl = defaultUrl;
            console.log('[ALERTS] Hub URL configured automatically:', defaultUrl);
        }
    },

    async syncAndLoad(showToast = false) {
        if (!this.hubAvailable()) {
            console.log('[ALERTS] Hub not available, loading from local fallback');
            // Load from local database as fallback
            await this.loadAlertsFromDatabase();
            return;
        }

        this.setSyncButtonState(false, 'Sincronizando...');
        
        try {
            const result = await this.syncRemoteAlerts();
            
            this.setSyncButtonState(true, 'Sincronizar ahora');
            this.showAlerts();
            
            if (result.error) {
                if (showToast) {
                    this.showToast(`Error de sincronización: ${result.error}`);
                }
            } else {
                if (showToast) {
                    this.showToast(`Sincronización exitosa: ${result.synced} alertas, ${result.new} nuevas`);
                }
            }
        } catch (error) {
            console.error('[ALERTS] Sync error:', error);
            this.setSyncButtonState(true, 'Sincronizar ahora');
            if (showToast) {
                this.showToast('Error al sincronizar alertas');
            }
            // Fallback to local database
            await this.loadAlertsFromDatabase();
        }
    },

    hubAvailable() {
        return this.hubUrl && this.hubUrl.trim() !== '';
    },

    async syncRemoteAlerts() {
        try {
            console.log('[ALERTS] Fetching alerts from Firebase');
            
            // Check if Firebase is available and configured
            const firebaseStatus = FirebaseService.getConfigStatus();
            const useFirebase = firebaseStatus.configured && firebaseStatus.initialized;

            let alertsData;
            
            if (useFirebase) {
                // Use Firebase for real-time data
                const result = await FirebaseService.getAlerts();
                
                if (result.success) {
                    alertsData = result.alerts;
                    console.log('[ALERTS] Alerts fetched from Firebase:', alertsData.length);
                } else {
                    console.warn('[ALERTS] Firebase fetch failed, using HubClient fallback');
                    const hubData = await HubClient.listAlerts();
                    if (hubData.ok && hubData.alertas) {
                        alertsData = hubData.alertas;
                    } else {
                        alertsData = [];
                    }
                }
            } else {
                // Use HubClient fallback (simulated data)
                console.log('[ALERTS] Using HubClient for alerts (Firebase not configured)');
                const hubData = await HubClient.listAlerts();
                if (hubData.ok && hubData.alertas) {
                    alertsData = hubData.alertas;
                } else {
                    alertsData = [];
                }
            }
            
            if (alertsData && alertsData.length > 0) {
                const allAlerts = this.transformHubAlerts(alertsData);
                
                // Track previous alerts to detect new ones
                const previousRemoteIds = new Set(this.alerts.map(a => a.remoteId));
                
                // Filter only high risk alerts for main alerts page
                this.alerts = allAlerts.filter(alert => {
                    const risk = alert.nivelRiesgo?.toLowerCase() || '';
                    return risk.includes('alto');
                });
                
                const previousCount = this.alerts.length;
                
                // Save to local database
                await this.saveAlertsToDatabase();
                
                // Detect new alerts and trigger notifications
                const newAlerts = this.alerts.filter(alert => 
                    !previousRemoteIds.has(alert.remoteId)
                );
                
                console.log('[ALERTS] New alerts detected:', newAlerts.length);
                
                // Process new alerts with push notifications and emails
                for (const newAlert of newAlerts) {
                    await this.processNewAlert(newAlert);
                }
                
                const newAlertsCount = newAlerts.length;
                
                // Notify new alerts via UI
                if (newAlertsCount > 0 && previousCount > 0) {
                    this.notifyNewAlerts(newAlertsCount);
                }
                
                return { 
                    synced: this.alerts.length, 
                    new: newAlertsCount, 
                    hubAccessible: true,
                    error: null
                };
            } else {
                return { 
                    synced: 0, 
                    new: 0, 
                    hubAccessible: true,
                    error: null
                };
            }
        } catch (error) {
            console.error('[ALERTS] Sync error:', error);
            return { 
                error: error.message, 
                synced: 0, 
                new: 0, 
                hubAccessible: false 
            };
        }
    },

    async processNewAlert(alert) {
        console.log('[ALERTS] Processing new alert:', alert.remoteId);
        
        try {
            // Check device origin to determine if it's from another device
            const isFromOtherDevice = alert.deviceOrigen && 
                                    alert.deviceOrigen !== 'web' && 
                                    alert.deviceOrigen !== navigator.userAgent;
            
            if (isFromOtherDevice) {
                console.log('[ALERTS] Alert from other device:', alert.deviceOrigen);
                
                // Show push notification for cross-device alerts
                if (this.pushEnabled) {
                    await this.showPushNotification(alert);
                }
                
                // Send email for high-risk alerts from other devices
                if (alert.nivelRiesgo?.toLowerCase() === 'alto' && this.emailEnabled) {
                    await this.sendEmailForAlert(alert);
                }
            }
            
            // Log the alert processing
            this.logAlertProcessing(alert, isFromOtherDevice);
            
        } catch (error) {
            console.error('[ALERTS] Error processing new alert:', error);
        }
    },

    async showPushNotification(alert) {
        try {
            if (typeof PushNotifications !== 'undefined' && this.pushEnabled) {
                console.log('[ALERTS] Showing push notification for alert:', alert.remoteId);
                
                // Use the push notification service
                PushNotifications.handleNewAlert(alert);
                
                // Also show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    const notification = new Notification(`🚨 Alerta ${alert.nivelRiesgo?.toUpperCase()}`, {
                        body: `${alert.nombreEstudiante || 'Estudiante'} - ${alert.extracto || 'Nueva alerta'}`,
                        icon: '/images/app-icon.jpeg',
                        tag: `alerta-${alert.remoteId}`,
                        requireInteraction: alert.nivelRiesgo?.toLowerCase() === 'alto',
                        data: {
                            url: '/alerts.html',
                            alertId: alert.remoteId
                        }
                    });
                    
                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                        // Show alert detail
                        this.showAlertDetail(alert.id);
                    };
                }
            }
        } catch (error) {
            console.error('[ALERTS] Error showing push notification:', error);
        }
    },

    logAlertProcessing(alert, isFromOtherDevice) {
        try {
            const processingLogs = JSON.parse(localStorage.getItem('alert_processing_logs') || '[]');
            processingLogs.push({
                alertId: alert.remoteId,
                timestamp: new Date().toISOString(),
                deviceOrigen: alert.deviceOrigen,
                isFromOtherDevice,
                nivelRiesgo: alert.nivelRiesgo,
                processed: true
            });
            localStorage.setItem('alert_processing_logs', JSON.stringify(processingLogs));
        } catch (error) {
            console.error('[ALERTS] Error logging alert processing:', error);
        }
    },

    transformHubAlerts(hubAlerts) {
        return hubAlerts.map(alerta => {
            const riskLevel = this.mapRiskLevel(alerta.nivelRiesgo);
            return {
                id: alerta.remoteId || alerta.idReferencia || Date.now(),
                nombreEstudiante: alerta.nombreEstudiante || 'Estudiante',
                gradoEstudiante: alerta.gradoEstudiante || '—',
                tipo: alerta.tipo,
                nivelRiesgo: alerta.nivelRiesgo,
                timestamp: alerta.timestamp,
                extracto: alerta.extracto || 'Sin descripción',
                estado: alerta.estado,
                notas: alerta.notas || '',
                deviceOrigen: alerta.deviceOrigen,
                remoteId: alerta.remoteId
            };
        });
    },

    async saveAlertsToDatabase() {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readwrite');
            const store = transaction.objectStore('alerts');
            
            // Clear existing alerts
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                // Add new alerts
                let completed = 0;
                this.alerts.forEach(alert => {
                    const request = store.add(alert);
                    request.onsuccess = () => {
                        completed++;
                        if (completed === this.alerts.length) {
                            console.log('[ALERTS] Alerts saved to database');
                            resolve();
                        }
                    };
                });
                
                if (this.alerts.length === 0) {
                    resolve();
                }
            };
            
            clearRequest.onerror = () => {
                reject(clearRequest.error);
            };
        });
    },

    async loadAlertsFromDatabase() {
        if (!this.db) {
            console.warn('[ALERTS] Database not initialized, loading from HubClient fallback');
            // Load from HubClient fallback
            try {
                const data = await HubClient.listAlerts();
                console.log('[ALERTS] HubClient response:', data);
                if (data.ok && data.alertas) {
                    const allAlerts = this.transformHubAlerts(data.alertas);
                    console.log('[ALERTS] All alerts from HubClient:', allAlerts);
                    // Filter only high risk alerts for main alerts page
                    this.alerts = allAlerts.filter(alert => {
                        const risk = alert.nivelRiesgo?.toLowerCase() || '';
                        return risk.includes('alto');
                    });
                    console.log('[ALERTS] Filtered high risk alerts:', this.alerts.length);
                    this.showAlerts();
                } else {
                    console.warn('[ALERTS] No alerts from HubClient fallback');
                    this.showAlerts();
                }
            } catch (error) {
                console.error('[ALERTS] Error loading from HubClient fallback:', error);
                this.showAlerts();
            }
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readonly');
            const store = transaction.objectStore('alerts');
            const request = store.getAll();

            request.onsuccess = () => {
                const allAlerts = request.result || [];
                console.log('[ALERTS] All alerts from database:', allAlerts);
                
                // If database is empty, load from HubClient fallback
                if (allAlerts.length === 0) {
                    console.log('[ALERTS] Database is empty, loading from HubClient fallback');
                    HubClient.listAlerts().then(data => {
                        console.log('[ALERTS] HubClient response:', data);
                        if (data.ok && data.alertas) {
                            const hubAlerts = this.transformHubAlerts(data.alertas);
                            console.log('[ALERTS] All alerts from HubClient:', hubAlerts);
                            // Filter only high risk alerts for main alerts page
                            this.alerts = hubAlerts.filter(alert => {
                                const risk = alert.nivelRiesgo?.toLowerCase() || '';
                                return risk.includes('alto');
                            });
                            console.log('[ALERTS] Filtered high risk alerts:', this.alerts.length);
                            this.showAlerts();
                        } else {
                            console.warn('[ALERTS] No alerts from HubClient fallback');
                            this.showAlerts();
                        }
                        resolve();
                    }).catch(error => {
                        console.error('[ALERTS] Error loading from HubClient fallback:', error);
                        this.showAlerts();
                        resolve();
                    });
                } else {
                    // Filter only high risk alerts for main alerts page
                    this.alerts = allAlerts.filter(alert => {
                        const risk = alert.nivelRiesgo?.toLowerCase() || '';
                        return risk.includes('alto');
                    });
                    console.log('[ALERTS] Filtered high risk alerts:', this.alerts.length);
                    this.showAlerts();
                    resolve();
                }
            };

            request.onerror = () => {
                console.error('[ALERTS] Error loading alerts:', request.error);
                reject(request.error);
            };
        });
    },

    showAlerts() {
        const list = document.getElementById('alerts-list');
        const emptyState = document.getElementById('empty-state');
        const pendingCount = document.getElementById('pending-count');
        const headerCard = document.querySelector('.alerts-header-card');
        
        const pendingAlerts = this.alerts.filter(a => {
            const status = a.estado?.toLowerCase() || 'pendiente';
            return !status.includes('atendida') && !status.includes('resuelta') && !status.includes('derivada');
        });
        
        pendingCount.textContent = pendingAlerts.length;
        
        // Set header card color based on highest risk level
        if (pendingAlerts.length > 0) {
            const highestRisk = this.getHighestRiskLevel(pendingAlerts);
            headerCard.className = 'alerts-header-card risk-' + highestRisk;
        } else {
            headerCard.className = 'alerts-header-card risk-high';
        }
        
        console.log('[ALERTS] Showing alerts:', this.alerts.length, 'total,', pendingAlerts.length, 'pending');
        
        if (this.alerts.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        list.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Get current filter
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        // Filter alerts based on device
        const filteredAlerts = this.filterAlertsByDevice(this.alerts, activeFilter);
        
        list.innerHTML = filteredAlerts.map(alert => {
            const riskLevel = this.mapRiskLevel(alert.nivelRiesgo);
            const status = this.mapStatus(alert.estado);
            const deviceInfo = this.getDeviceInfo(alert.deviceOrigen);
            
            return `
            <div class="alert-item risk-${riskLevel} ${status === 'resolved' ? 'resolved' : ''}" data-alert-id="${alert.id}">
                <div class="alert-item-content">
                    <div class="alert-item-student">${alert.nombreEstudiante || 'Estudiante'}</div>
                    <div class="alert-item-grade">Grado: ${alert.gradoEstudiante || '—'}</div>
                    <div class="alert-item-type">${alert.tipo === 'evaluacion' ? 'Evaluación psicológica' : 'Chat con IA'}</div>
                    <div class="alert-item-extract">${alert.extracto || 'Sin descripción'}</div>
                    <div class="alert-item-date">${this.formatDate(alert.timestamp)}</div>
                    <div class="sync-indicator ${deviceInfo.syncStatus}">
                        <span class="icon">${deviceInfo.icon}</span>
                        <span>${deviceInfo.label}</span>
                    </div>
                </div>
                <div class="alert-item-device ${deviceInfo.deviceClass}">${deviceInfo.deviceLabel}</div>
                <div class="alert-item-status">${status === 'pending' ? 'PENDIENTE' : 'ATENDIDA'}</div>
            </div>
        `;
        }).join('');
        
        // Add click listeners
        list.querySelectorAll('.alert-item').forEach(item => {
            item.addEventListener('click', () => {
                const alertId = parseInt(item.dataset.alertId);
                this.showAlertDetail(alertId);
            });
        });
        
        // Setup device filter listeners
        this.setupDeviceFilter();
    },

    filterAlertsByDevice(alerts, filter) {
        if (filter === 'all') return alerts;
        
        return alerts.filter(alert => {
            const device = alert.deviceOrigen?.toLowerCase() || '';
            if (filter === 'android') {
                return device.includes('android') || !device.includes('web');
            }
            if (filter === 'web') {
                return device.includes('web');
            }
            return true;
        });
    },

    getDeviceInfo(deviceOrigen) {
        const device = deviceOrigen?.toLowerCase() || '';
        
        if (device.includes('android')) {
            return {
                icon: '📱',
                label: 'Android',
                deviceLabel: 'Android',
                deviceClass: 'android',
                syncStatus: 'synced'
            };
        } else if (device.includes('web')) {
            return {
                icon: '💻',
                label: 'Web',
                deviceLabel: 'Web',
                deviceClass: 'web',
                syncStatus: 'synced'
            };
        } else {
            return {
                icon: '🔗',
                label: 'Multidispositivo',
                deviceLabel: 'Otro',
                deviceClass: 'unknown',
                syncStatus: 'synced'
            };
        }
    },

    setupDeviceFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Re-render alerts with new filter
                this.showAlerts();
            });
        });
    },

    showAlertDetail(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        this.selectedAlert = alert;
        
        const riskLevel = this.mapRiskLevel(alert.nivelRiesgo);
        const status = this.mapStatus(alert.estado);
        
        const riskBadge = document.getElementById('alert-risk-badge');
        riskBadge.textContent = this.getRiskLabel(riskLevel);
        riskBadge.className = `alert-risk-badge ${riskLevel}`;
        
        document.getElementById('alert-student').textContent = alert.nombreEstudiante || 'Estudiante';
        document.getElementById('alert-grade').textContent = alert.gradoEstudiante || '—';
        document.getElementById('alert-date').textContent = this.formatDate(alert.timestamp);
        document.getElementById('alert-type').textContent = alert.tipo === 'evaluacion' ? 'Evaluación psicológica' : 'Chat con IA';
        document.getElementById('alert-extract-text').textContent = alert.extracto || 'Sin descripción';
        
        const notesInput = document.getElementById('alert-notes-input');
        notesInput.value = alert.notas || '';
        
        const markResolvedBtn = document.querySelector('#alert-detail-modal .mark-resolved-btn');
        if (status === 'resolved') {
            markResolvedBtn.textContent = 'Marcar como Pendiente';
            markResolvedBtn.onclick = () => this.markAsPending();
        } else {
            markResolvedBtn.textContent = 'Marcar como Atendida';
            markResolvedBtn.onclick = () => this.markAsResolved();
        }
        
        document.getElementById('alert-detail-modal').classList.remove('hidden');
    },

    hideAlertDetailModal() {
        document.getElementById('alert-detail-modal').classList.add('hidden');
        this.selectedAlert = null;
    },

    getRiskLabel(riskLevel) {
        const labels = {
            high: '🔴 Riesgo Alto',
            medium: '🟡 Riesgo Medio',
            low: '🟢 Riesgo Bajo'
        };
        return labels[riskLevel] || riskLevel;
    },

    mapRiskLevel(nivel) {
        const level = nivel?.toLowerCase() || 'bajo';
        if (level.includes('alto')) return 'high';
        if (level.includes('medio') || level.includes('moderado')) return 'medium';
        return 'low';
    },

    mapStatus(estado) {
        const status = estado?.toLowerCase() || 'pendiente';
        if (status.includes('atendida') || status.includes('resuelta') || status.includes('derivada')) return 'resolved';
        return 'pending';
    },

    formatDate(isoString) {
        if (!isoString) return new Date().toLocaleDateString('es-ES');
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return isoString;
        }
    },

    async markAsResolved() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.estado = 'ATENDIDA';
        await this.updateAlertInDatabase();
        
        // Sync with hub if available
        if (this.selectedAlert.remoteId && this.hubAvailable()) {
            try {
                const success = await HubClient.updateAlertStatus(this.selectedAlert.remoteId, 'ATENDIDA', this.selectedAlert.notas);
                if (success) {
                    this.showToast('Alerta marcada como atendida y sincronizada');
                } else {
                    this.showToast('Alerta marcada como atendida (error de sincronización)');
                }
            } catch (error) {
                console.error('[ALERTS] Error syncing to hub:', error);
                this.showToast('Alerta marcada como atendida');
            }
        } else {
            this.showToast('Alerta marcada como atendida');
        }
        
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async markAsPending() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.estado = 'PENDIENTE';
        await this.updateAlertInDatabase();
        
        // Sync with hub if available
        if (this.selectedAlert.remoteId && this.hubAvailable()) {
            try {
                const success = await HubClient.updateAlertStatus(this.selectedAlert.remoteId, 'PENDIENTE', this.selectedAlert.notas);
                if (success) {
                    this.showToast('Alerta marcada como pendiente y sincronizada');
                } else {
                    this.showToast('Alerta marcada como pendiente (error de sincronización)');
                }
            } catch (error) {
                console.error('[ALERTS] Error syncing to hub:', error);
                this.showToast('Alerta marcada como pendiente');
            }
        } else {
            this.showToast('Alerta marcada como pendiente');
        }
        
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async saveNotes() {
        if (!this.selectedAlert) return;
        
        const notesInput = document.getElementById('alert-notes-input');
        this.selectedAlert.notas = notesInput.value;
        await this.updateAlertInDatabase();
        
        // Sync with hub if available
        if (this.selectedAlert.remoteId && this.hubAvailable()) {
            try {
                const success = await HubClient.updateAlertStatus(
                    this.selectedAlert.remoteId, 
                    this.selectedAlert.estado,
                    this.selectedAlert.notas
                );
                if (success) {
                    this.showToast('Notas guardadas y sincronizadas');
                } else {
                    this.showToast('Notas guardadas (error de sincronización)');
                }
            } catch (error) {
                console.error('[ALERTS] Error syncing to hub:', error);
                this.showToast('Notas guardadas');
            }
        } else {
            this.showToast('Notas guardadas');
        }
    },

    async updateAlertInDatabase() {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readwrite');
            const store = transaction.objectStore('alerts');
            const request = store.put(this.selectedAlert);

            request.onsuccess = () => {
                console.log('[ALERTS] Alert updated in database');
                resolve();
            };

            request.onerror = () => {
                console.error('[ALERTS] Error updating alert:', request.error);
                reject(request.error);
            };
        });
    },

    startPeriodicUpdate() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(() => {
            if (!document.hidden) {
                this.syncAndLoad();
            }
        }, 30000); // 30 seconds like Android
        
        console.log('[ALERTS] Started periodic update (30s interval)');
    },

    setupEventListeners() {
        // Back button - improved handling
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[ALERTS] Back button clicked, navigating to dashboard');
                window.location.href = 'index.html';
            });
        } else {
            console.warn('[ALERTS] Back button not found');
        }
        
        // Modal close buttons
        document.querySelectorAll('.btn-close, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAlertDetailModal();
                this.hideHubConfigModal();
            });
        });
        
        // Save notes button
        const saveNotesBtn = document.getElementById('save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                this.saveNotes();
            });
        }
        
        // Mark resolved button
        const markResolvedBtn = document.querySelector('.mark-resolved-btn');
        if (markResolvedBtn) {
            markResolvedBtn.addEventListener('click', () => {
                const alert = this.selectedAlert;
                const status = this.mapStatus(alert.estado);
                if (status === 'resolved') {
                    this.markAsPending();
                } else {
                    this.markAsResolved();
                }
            });
        }
    },

    showHubConfigModal() {
        // Not implemented in this version
        console.log('[ALERTS] Hub config modal not implemented');
    },

    hideHubConfigModal() {
        // Not implemented in this version
    },

    saveHubConfig() {
        // Not implemented in this version
    },

    showHubWarning(message) {
        // Not implemented in this version
        console.log('[ALERTS] Hub warning:', message);
    },

    hideHubWarning() {
        // Not implemented in this version
    },

    showHubWarningIfMissing() {
        // Not implemented in this version
    },

    setSyncButtonState(enabled, text) {
        // Not implemented in this version
        console.log('[ALERTS] Sync button state:', enabled, text);
        // const btn = document.getElementById('sync-now-btn');
        // btn.disabled = !enabled;
        // btn.textContent = text;
    },

    notifyNewAlerts(count) {
        this.showToast(`${count} nueva(s) alerta(s) recibida(s)`);
        
        // Request notification permission and show notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nuevas Alertas de Riesgo', {
                body: `${count} nueva(s) alerta(s) de riesgo recibida(s)`,
                icon: '/images/app-icon.jpeg'
            });
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },

    getHighestRiskLevel(alerts) {
        const riskOrder = { 'alto': 3, 'medio': 2, 'moderado': 2, 'bajo': 1 };
        let highestRisk = 'bajo';
        
        alerts.forEach(alert => {
            const risk = (alert.nivelRiesgo || 'bajo').toLowerCase();
            if (riskOrder[risk] > riskOrder[highestRisk]) {
                highestRisk = risk;
            }
        });
        
        return highestRisk;
    },

    // Helper function to convert risk level to display format
    mapRiskLevelToDisplay(nivel) {
        const level = nivel?.toLowerCase() || 'bajo';
        if (level.includes('alto')) return 'high';
        if (level.includes('medio') || level.includes('moderado')) return 'medium';
        return 'low';
    }
};
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init();
});