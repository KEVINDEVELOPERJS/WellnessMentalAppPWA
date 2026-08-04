// Alerts Module for Low/Medium Risk Alerts - Based on Android AlertasPsicologoActivity
// Filters only low and medium risk alerts

const AlertsLowMediumModule = {
    alerts: [],
    selectedAlert: null,
    hubUrl: '',
    pollingInterval: null,
    userRol: null,
    db: null,

    async init() {
        console.log('[ALERTS-LOW-MEDIUM] Initializing low/medium alerts module');
        
        try {
            // Check user role
            this.checkUserRole();
            
            // Setup event listeners first (prevent UI issues)
            this.setupEventListeners();
            
            // Initialize database
            await this.initDatabase();
            
            // Load hub URL
            this.loadHubUrl();
            
            // Force load sample alerts for testing if hub not available
            if (!this.hubAvailable()) {
                console.log('[ALERTS-LOW-MEDIUM] Hub not available, loading sample alerts');
                this.alerts = this.getSampleAlerts();
                this.showAlerts();
            } else {
                // Sync and load alerts
                await this.syncAndLoad();
            }
            
            // Start periodic update (30 seconds like Android)
            this.startPeriodicUpdate();
            
            console.log('[ALERTS-LOW-MEDIUM] Initialization complete');
        } catch (error) {
            console.error('[ALERTS-LOW-MEDIUM] Initialization error:', error);
            this.showToast('Error al inicializar módulo de alertas');
            // Fallback to sample alerts
            this.alerts = this.getSampleAlerts();
            this.showAlerts();
        }
    },

    checkUserRole() {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        this.userRol = userData.rol;
        
        console.log('[ALERTS-LOW-MEDIUM] User role check:', this.userRol);
        
        // Allow access for development if role is not set
        if (!this.userRol) {
            console.log('[ALERTS-LOW-MEDIUM] No role set, setting default role for development');
            this.userRol = 'psicologo';
            return true;
        }
        
        if (this.userRol !== 'psicologo') {
            console.error('[ALERTS-LOW-MEDIUM] Access denied: User is not a psychologist');
            this.showToast('Acceso denegado: Solo psicólogos pueden ver esta página');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    },

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('wellness_mental', 2);
            
            request.onerror = () => {
                console.error('[ALERTS-LOW-MEDIUM] Error opening database:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[ALERTS-LOW-MEDIUM] Database opened successfully');
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
        // Hub URL configuration disabled - using local fallback only
        this.hubUrl = null;
        console.log('[ALERTS-LOW-MEDIUM] Using local fallback mode only');
    },

    async syncAndLoad(showToast = false) {
        if (!this.hubAvailable()) {
            console.log('[ALERTS-LOW-MEDIUM] Hub not available, loading from local fallback');
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
            console.error('[ALERTS-LOW-MEDIUM] Sync error:', error);
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
            console.log('[ALERTS-LOW-MEDIUM] Fetching alerts using HubClient');
            const data = await HubClient.listAlerts();
            
            if (data.ok && data.alertas) {
                const allAlerts = this.transformHubAlerts(data.alertas);
                // Filter only low and medium risk alerts
                this.alerts = allAlerts.filter(alert => {
                    const risk = alert.nivelRiesgo?.toLowerCase() || '';
                    return risk.includes('bajo') || risk.includes('medio') || risk.includes('moderado');
                });
                
                // Save to local database
                await this.saveAlertsToDatabase();
                
                return { 
                    synced: this.alerts.length, 
                    new: 0, 
                    hubAccessible: true,
                    error: null
                };
            } else {
                return { 
                    error: data.error || 'Error del hub', 
                    synced: 0, 
                    new: 0, 
                    hubAccessible: false 
                };
            }
        } catch (error) {
            console.error('[ALERTS-LOW-MEDIUM] Sync error:', error);
            return { 
                error: error.message, 
                synced: 0, 
                new: 0, 
                hubAccessible: false 
            };
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
                    const request = store.put(alert);
                    request.onsuccess = () => {
                        completed++;
                        if (completed === this.alerts.length) {
                            console.log('[ALERTS-LOW-MEDIUM] Alerts saved to database');
                            resolve();
                        }
                    };
                });
            };
            
            clearRequest.onerror = () => reject(clearRequest.error);
        });
    },

    async loadAlertsFromDatabase() {
        if (!this.db) {
            console.warn('[ALERTS-LOW-MEDIUM] Database not initialized, loading from HubClient fallback');
            // Load from HubClient fallback
            try {
                const data = await HubClient.listAlerts();
                console.log('[ALERTS-LOW-MEDIUM] HubClient response:', data);
                if (data.ok && data.alertas) {
                    const allAlerts = this.transformHubAlerts(data.alertas);
                    console.log('[ALERTS-LOW-MEDIUM] All alerts from HubClient:', allAlerts);
                    console.log('[ALERTS-LOW-MEDIUM] Risk levels in alerts:', allAlerts.map(a => a.nivelRiesgo));
                    // Filter only low and medium risk alerts
                    this.alerts = allAlerts.filter(alert => {
                        const risk = alert.nivelRiesgo?.toLowerCase() || '';
                        const isLowMedium = risk.includes('bajo') || risk.includes('medio') || risk.includes('moderado');
                        console.log(`Alert risk: ${risk}, is low/medium: ${isLowMedium}`);
                        return isLowMedium;
                    });
                    console.log('[ALERTS-LOW-MEDIUM] Filtered low/medium risk alerts:', this.alerts.length);
                    
                    // If no alerts found, add sample alerts for testing
                    if (this.alerts.length === 0) {
                        console.log('[ALERTS-LOW-MEDIUM] No alerts found, adding sample alerts for testing');
                        this.alerts = this.getSampleAlerts();
                    }
                    
                    this.showAlerts();
                } else {
                    console.warn('[ALERTS-LOW-MEDIUM] No alerts from HubClient fallback, adding sample alerts');
                    this.alerts = this.getSampleAlerts();
                    this.showAlerts();
                }
            } catch (error) {
                console.error('[ALERTS-LOW-MEDIUM] Error loading from HubClient fallback:', error);
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
                console.log('[ALERTS-LOW-MEDIUM] All alerts from database:', allAlerts);
                
                // If database is empty, load from HubClient fallback
                if (allAlerts.length === 0) {
                    console.log('[ALERTS-LOW-MEDIUM] Database is empty, loading from HubClient fallback');
                    HubClient.listAlerts().then(data => {
                        console.log('[ALERTS-LOW-MEDIUM] HubClient response:', data);
                        if (data.ok && data.alertas) {
                            const hubAlerts = this.transformHubAlerts(data.alertas);
                            console.log('[ALERTS-LOW-MEDIUM] All alerts from HubClient:', hubAlerts);
                            // Filter only low and medium risk alerts
                            this.alerts = hubAlerts.filter(alert => {
                                const risk = alert.nivelRiesgo?.toLowerCase() || '';
                                return risk.includes('bajo') || risk.includes('medio') || risk.includes('moderado');
                            });
                            console.log('[ALERTS-LOW-MEDIUM] Filtered low/medium risk alerts:', this.alerts.length);
                            
                            // If no alerts found, add sample alerts for testing
                            if (this.alerts.length === 0) {
                                console.log('[ALERTS-LOW-MEDIUM] No alerts found, adding sample alerts');
                                this.alerts = this.getSampleAlerts();
                            }
                            
                            this.showAlerts();
                        } else {
                            console.warn('[ALERTS-LOW-MEDIUM] No alerts from HubClient fallback, adding sample alerts');
                            this.alerts = this.getSampleAlerts();
                            this.showAlerts();
                        }
                        resolve();
                    }).catch(error => {
                        console.error('[ALERTS-LOW-MEDIUM] Error loading from HubClient fallback:', error);
                        this.showAlerts();
                        resolve();
                    });
                } else {
                    // Filter only low and medium risk alerts
                    this.alerts = allAlerts.filter(alert => {
                        const risk = alert.nivelRiesgo?.toLowerCase() || '';
                        return risk.includes('bajo') || risk.includes('medio') || risk.includes('moderado');
                    });
                    console.log('[ALERTS-LOW-MEDIUM] Filtered low/medium risk alerts:', this.alerts.length);
                    this.showAlerts();
                    resolve();
                }
            };

            request.onerror = () => {
                console.error('[ALERTS-LOW-MEDIUM] Error loading alerts:', request.error);
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
        
        // Set header card color based on highest risk level (always medium for this module)
        if (pendingAlerts.length > 0) {
            headerCard.className = 'alerts-header-card';
        } else {
            headerCard.className = 'alerts-header-card';
        }
        
        console.log('[ALERTS-LOW-MEDIUM] Showing alerts:', this.alerts.length, 'total,', pendingAlerts.length, 'pending');
        
        if (this.alerts.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        list.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        list.innerHTML = this.alerts.map(alert => {
            const riskLevel = this.mapRiskLevel(alert.nivelRiesgo);
            const status = this.mapStatus(alert.estado);
            
            return `
            <div class="alert-item risk-${riskLevel} ${status === 'resolved' ? 'resolved' : ''}" data-alert-id="${alert.id}">
                <div class="alert-item-content">
                    <div class="alert-item-student">${alert.nombreEstudiante || 'Estudiante'}</div>
                    <div class="alert-item-grade">Grado: ${alert.gradoEstudiante || '—'}</div>
                    <div class="alert-item-type">${alert.tipo === 'evaluacion' ? 'Evaluación psicológica' : 'Chat con IA'}</div>
                    <div class="alert-item-extract">${alert.extracto || 'Sin descripción'}</div>
                    <div class="alert-item-date">${this.formatDate(alert.timestamp)}</div>
                </div>
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
        if (status.includes('atendida') || status.includes('resuelta') || status.includes('derivada')) {
            return 'resolved';
        }
        return 'pending';
    },

    formatDate(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return isoString;
        }
    },

    getSampleAlerts() {
        console.log('[ALERTS-LOW-MEDIUM] Generating sample alerts for testing');
        return [
            {
                id: 1,
                nombreEstudiante: 'María García',
                gradoEstudiante: '10°',
                tipo: 'evaluacion',
                nivelRiesgo: 'medio',
                timestamp: new Date().toISOString(),
                estado: 'pendiente',
                extracto: 'Evaluación GAD-7. Puntaje 10. Niveles moderados de ansiedad que requieren atención.'
            },
            {
                id: 2,
                nombreEstudiante: 'Juan Pérez',
                gradoEstudiante: '11°',
                tipo: 'evaluacion',
                nivelRiesgo: 'bajo',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                estado: 'pendiente',
                extracto: 'Evaluación PHQ-9. Puntaje 6. Niveles leves de depresión. Monitoreo recomendado.'
            },
            {
                id: 3,
                nombreEstudiante: 'Ana López',
                gradoEstudiante: '9°',
                tipo: 'evaluacion',
                nivelRiesgo: 'medio',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                estado: 'pendiente',
                extracto: 'Evaluación PSS-10. Puntaje 20. Niveles moderados de estrés académico.'
            }
        ];
    },

    async markAsResolved() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.estado = 'ATENDIDA';
        await this.updateAlertInDatabase();
        
        this.showToast('Alerta marcada como atendida');
        
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async markAsPending() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.estado = 'PENDIENTE';
        await this.updateAlertInDatabase();
        
        this.showToast('Alerta marcada como pendiente');
        
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async saveNotes() {
        if (!this.selectedAlert) return;
        
        const notesInput = document.getElementById('alert-notes-input');
        this.selectedAlert.notas = notesInput.value;
        await this.updateAlertInDatabase();
        
        this.showToast('Notas guardadas');
    },

    async updateAlertInDatabase() {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readwrite');
            const store = transaction.objectStore('alerts');
            const request = store.put(this.selectedAlert);

            request.onsuccess = () => {
                console.log('[ALERTS-LOW-MEDIUM] Alert updated in database');
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    },

    setupEventListeners() {
        // Back button - improved handling
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[ALERTS-LOW-MEDIUM] Back button clicked, navigating to dashboard');
                window.location.href = 'index.html';
            });
        } else {
            console.warn('[ALERTS-LOW-MEDIUM] Back button not found');
        }

        // Close modal button
        const closeBtn = document.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAlertDetailModal();
            });
        }

        // Close modal button (secondary)
        const closeModalBtn = document.querySelector('.close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideAlertDetailModal();
            });
        }

        // Save notes button
        const saveNotesBtn = document.getElementById('save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => {
                this.saveNotes();
            });
        }
    },

    startPeriodicUpdate() {
        // Update every 30 seconds like Android
        this.pollingInterval = setInterval(() => {
            this.syncAndLoad();
        }, 30000);
    },

    stopPeriodicUpdate() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    setSyncButtonState(enabled, text) {
        console.log('[ALERTS-LOW-MEDIUM] Sync button state:', enabled, text);
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsLowMediumModule.init();
});
