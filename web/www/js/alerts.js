// Alerts Module for Psychologists - Simplified Version (No Hub Dependencies)
// Based on Android AlertasPsicologoActivity - Local database only

const AlertsModule = {
    alerts: [],
    selectedAlert: null,
    pollingInterval: null,
    userRol: null,
    db: null,

    async init() {
        console.log('[ALERTS] Initializing alerts module');
        
        // Check user role
        this.checkUserRole();
        
        // Initialize database
        await this.initDatabase();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load alerts from local database
        await this.loadAlerts();
        
        // Render alerts
        this.showAlerts();
        
        // Start periodic update (30 seconds like Android)
        this.startPeriodicUpdate();
    },

    checkUserRole() {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        this.userRol = userData.rol;
        
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

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('wellness_mental', 1);
            
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

    async loadAlerts() {
        if (!this.db) {
            console.warn('[ALERTS] Database not initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readonly');
            const store = transaction.objectStore('alerts');
            const request = store.getAll();

            request.onsuccess = () => {
                this.alerts = request.result || [];
                console.log('[ALERTS] Loaded alerts from database:', this.alerts.length);
                resolve();
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
        
        const pendingAlerts = this.alerts.filter(a => a.estado === 'PENDIENTE' || a.estado === 'pendiente');
        pendingCount.textContent = pendingAlerts.length;
        
        console.log('[ALERTS] Showing alerts:', this.alerts.length, 'total,', pendingAlerts.length, 'pending');
        
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
        if (level.includes('medio')) return 'medium';
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
        await this.updateAlertInDatabase(this.selectedAlert);
        
        this.showToast('Alerta marcada como atendida');
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async markAsPending() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.estado = 'PENDIENTE';
        await this.updateAlertInDatabase(this.selectedAlert);
        
        this.showToast('Alerta marcada como pendiente');
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async saveNotes() {
        if (!this.selectedAlert) return;
        
        const notesInput = document.getElementById('alert-notes-input');
        this.selectedAlert.notas = notesInput.value;
        await this.updateAlertInDatabase(this.selectedAlert);
        
        this.showToast('Notas guardadas');
    },

    async updateAlertInDatabase(alert) {
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['alerts'], 'readwrite');
            const store = transaction.objectStore('alerts');
            const request = store.put(alert);

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
                this.loadAlerts().then(() => {
                    this.showAlerts();
                });
            }
        }, 30000); // 30 seconds like Android
        
        console.log('[ALERTS] Started periodic update (30s interval)');
    },

    setupEventListeners() {
        // Back button
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Modal close buttons
        document.querySelectorAll('.btn-close, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAlertDetailModal();
            });
        });
        
        // Save notes button
        document.getElementById('save-notes-btn').addEventListener('click', () => {
            this.saveNotes();
        });
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
    AlertsModule.init();
});