// Alerts Module for Psychologists - Based on Android AlertasPsicologoActivity
const AlertsModule = {
    alerts: [],
    selectedAlert: null,
    hubUrl: '',
    pollingInterval: null,
    userRol: null,

    init() {
        this.checkUserRole();
        this.loadHubUrl();
        this.setupEventListeners();
        this.syncAndLoad();
        this.startPeriodicUpdate();
        this.showHubWarningIfMissing();
    },

    checkUserRole() {
        // Check if user is psychologist
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        this.userRol = userData.rol;
        
        if (this.userRol !== 'psicologo') {
            console.error('Access denied: User is not a psychologist');
            this.showToast('Acceso denegado: Solo psicólogos pueden ver esta página');
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    },

    loadHubUrl() {
        this.hubUrl = localStorage.getItem('alert_sync_url') || '';
        console.log('[ALERTS] Hub URL loaded:', this.hubUrl ? 'Configured' : 'Not configured');
    },

    async syncAndLoad(showToast = false) {
        if (!this.hubAvailable()) {
            this.showHubWarning('No hay hub de sincronización configurado');
            if (showToast) {
                this.showToast('Toca el banner para configurar el hub');
                this.showHubConfigModal();
            }
            return;
        }

        this.setSyncButtonState(false, 'Sincronizando...');
        
        try {
            const result = await this.syncRemoteAlerts();
            
            this.setSyncButtonState(true, 'Sincronizar ahora');
            this.showAlerts();
            
            if (result.error) {
                this.showHubWarning(result.error || 'Hub inaccesible');
                if (showToast) {
                    this.showToast(`Error de sincronización: ${result.error}`);
                }
            } else {
                this.hideHubWarning();
                if (showToast) {
                    this.showToast(`Sincronización exitosa: ${result.synced} alertas, ${result.new} nuevas`);
                }
            }
        } catch (error) {
            console.error('[ALERTS] Sync error:', error);
            this.setSyncButtonState(true, 'Sincronizar ahora');
            this.showHubWarning('Error de sincronización');
            if (showToast) {
                this.showToast('Error al sincronizar alertas');
            }
        }
    },

    hubAvailable() {
        return this.hubUrl && this.hubUrl.trim() !== '';
    },

    async syncRemoteAlerts() {
        if (!this.hubAvailable()) {
            return { error: 'Hub no configurado', synced: 0, new: 0, hubAccessible: false };
        }

        try {
            const url = `${this.hubUrl}?action=listar`;
            const response = await fetch(url, {
                mode: 'cors',
                redirect: 'follow'
            });
            
            const data = await response.json();
            
            if (data.ok && data.alertas) {
                const previousCount = this.alerts.length;
                this.alerts = this.transformHubAlerts(data.alertas);
                this.saveAlerts();
                
                const newAlerts = this.alerts.length - previousCount;
                
                // Notify new alerts
                if (newAlerts > 0 && previousCount > 0) {
                    this.notifyNewAlerts(newAlerts);
                }
                
                return { 
                    synced: this.alerts.length, 
                    new: newAlerts, 
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
                studentName: alerta.nombreEstudiante || 'Estudiante',
                grade: alerta.gradoEstudiante || '—',
                date: this.formatDate(alerta.timestamp),
                type: alerta.tipo === 'evaluacion' ? 'Evaluación psicológica' : 'Chat con IA',
                extract: alerta.extracto || 'Sin descripción',
                riskLevel: riskLevel,
                status: this.mapStatus(alerta.estado),
                remoteId: alerta.remoteId,
                notes: alerta.notas || '',
                deviceOrigen: alerta.deviceOrigen,
                emailEstudiante: alerta.emailEstudiante
            };
        });
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

    showAlerts() {
        const list = document.getElementById('alerts-list');
        const emptyState = document.getElementById('empty-state');
        const pendingCount = document.getElementById('pending-count');
        
        const pendingAlerts = this.alerts.filter(a => a.status === 'pending');
        pendingCount.textContent = pendingAlerts.length;
        
        console.log('[ALERTS] Showing alerts:', this.alerts.length, 'total,', pendingAlerts.length, 'pending');
        
        if (this.alerts.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        list.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        list.innerHTML = this.alerts.map(alert => `
            <div class="alert-item risk-${alert.riskLevel} ${alert.status === 'resolved' ? 'resolved' : ''}" data-alert-id="${alert.id}">
                <div class="alert-item-content">
                    <div class="alert-item-student">${alert.studentName}</div>
                    <div class="alert-item-grade">Grado: ${alert.grade}</div>
                    <div class="alert-item-type">${alert.type}</div>
                    <div class="alert-item-extract">${alert.extract}</div>
                    <div class="alert-item-date">${alert.date}</div>
                </div>
                <div class="alert-item-status">${alert.status === 'pending' ? 'PENDIENTE' : 'ATENDIDA'}</div>
            </div>
        `).join('');
        
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
        
        const riskBadge = document.getElementById('alert-risk-badge');
        riskBadge.textContent = this.getRiskLabel(alert.riskLevel);
        riskBadge.className = `alert-risk-badge ${alert.riskLevel}`;
        
        document.getElementById('alert-student').textContent = alert.studentName;
        document.getElementById('alert-grade').textContent = alert.grade;
        document.getElementById('alert-date').textContent = alert.date;
        document.getElementById('alert-type').textContent = alert.type;
        document.getElementById('alert-extract-text').textContent = alert.extract;
        
        const notesInput = document.getElementById('alert-notes-input');
        notesInput.value = alert.notes || '';
        
        const markResolvedBtn = document.querySelector('#alert-detail-modal .mark-resolved-btn');
        if (alert.status === 'resolved') {
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

    async markAsResolved() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.status = 'resolved';
        this.saveAlerts();
        
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(this.selectedAlert.remoteId, 'ATENDIDA', this.selectedAlert.notes);
            if (success) {
                this.showToast('Alerta marcada como atendida y sincronizada');
            } else {
                this.showToast('Alerta marcada como atendida (error de sincronización)');
            }
        } else {
            this.showToast('Alerta marcada como atendida');
        }
        
        this.showAlerts();
        this.hideAlertDetailModal();
    },

    async markAsPending() {
        if (!this.selectedAlert) return;
        
        this.selectedAlert.status = 'pending';
        this.saveAlerts();
        
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(this.selectedAlert.remoteId, 'PENDIENTE', this.selectedAlert.notes);
            if (success) {
                this.showToast('Alerta marcada como pendiente y sincronizada');
            } else {
                this.showToast('Alerta marcada como pendiente (error de sincronización)');
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
        this.selectedAlert.notes = notesInput.value;
        this.saveAlerts();
        
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(
                this.selectedAlert.remoteId, 
                this.selectedAlert.status === 'resolved' ? 'ATENDIDA' : 'PENDIENTE',
                this.selectedAlert.notes
            );
            if (success) {
                this.showToast('Notas guardadas y sincronizadas');
            } else {
                this.showToast('Notas guardadas (error de sincronización)');
            }
        } else {
            this.showToast('Notas guardadas');
        }
    },

    async updateAlertStatusOnHub(remoteId, estado, notas) {
        if (!this.hubUrl || !remoteId) return false;
        
        try {
            const payload = {
                action: 'actualizar',
                remoteId: remoteId,
                estado: estado,
                notas: notas || '',
                timestampActualizacion: new Date().toISOString()
            };
            
            const response = await fetch(this.hubUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.ok === true;
        } catch (error) {
            console.error('[ALERTS] Error updating alert status on hub:', error);
            return false;
        }
    },

    saveAlerts() {
        localStorage.setItem('psychologist_alerts', JSON.stringify(this.alerts));
    },

    startPeriodicUpdate() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(() => {
            if (!document.hidden) {
                this.showAlerts();
            }
        }, 30000); // 30 seconds like Android
        
        console.log('[ALERTS] Started periodic update (30s interval)');
    },

    setupEventListeners() {
        // Back button
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Config hub button
        document.getElementById('config-hub-btn').addEventListener('click', () => {
            this.showHubConfigModal();
        });
        
        // Sync now button
        document.getElementById('sync-now-btn').addEventListener('click', () => {
            this.syncAndLoad(true);
        });
        
        // Sync warning click
        document.getElementById('sync-warning').addEventListener('click', () => {
            this.showHubConfigModal();
        });
        
        // Modal close buttons
        document.querySelectorAll('.btn-close, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAlertDetailModal();
                this.hideHubConfigModal();
            });
        });
        
        // Save notes button
        document.getElementById('save-notes-btn').addEventListener('click', () => {
            this.saveNotes();
        });
        
        // Save hub config button
        document.querySelector('.save-hub-config-btn').addEventListener('click', () => {
            this.saveHubConfig();
        });
    },

    showHubConfigModal() {
        const hubUrlInput = document.getElementById('hub-url-input');
        hubUrlInput.value = this.hubUrl;
        document.getElementById('hub-config-modal').classList.remove('hidden');
    },

    hideHubConfigModal() {
        document.getElementById('hub-config-modal').classList.add('hidden');
    },

    saveHubConfig() {
        const hubUrlInput = document.getElementById('hub-url-input');
        const url = hubUrlInput.value.trim();
        
        this.hubUrl = url;
        localStorage.setItem('alert_sync_url', url);
        
        this.hideHubConfigModal();
        this.showToast('URL del hub configurada');
        this.syncAndLoad(true);
    },

    showHubWarning(message) {
        const warning = document.getElementById('sync-warning');
        const warningText = document.getElementById('sync-warning-text');
        warningText.textContent = message;
        warning.classList.remove('hidden');
    },

    hideHubWarning() {
        document.getElementById('sync-warning').classList.add('hidden');
    },

    showHubWarningIfMissing() {
        if (!this.hubAvailable()) {
            this.showHubWarning('No hay hub de sincronización configurado');
        }
    },

    setSyncButtonState(enabled, text) {
        const btn = document.getElementById('sync-now-btn');
        btn.disabled = !enabled;
        btn.textContent = text;
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init();
});
                score: 12,
                maxScore: 27,
                riskLevel: 'medium',
                description: 'El estudiante presenta síntomas moderados de depresión que requieren seguimiento.',
                recommendations: [
                    'Programar sesión de evaluación',
                    'Monitorear progreso semanalmente',
                    'Considerar actividades de bienestar adicionales'
                ],
                status: 'pending'
            },
            {
                id: 3,
                studentName: 'Ana Martínez',
                date: '22/07/2026',
                evaluation: 'GAD-7',
                score: 8,
                maxScore: 21,
                riskLevel: 'low',
                description: 'Niveles leves de ansiedad dentro del rango normal. Se recomienda continuar monitoreo.',
                recommendations: [
                    'Continuar con prácticas de bienestar actuales',
                    'Reevaluar en próximo check-in mensual'
                ],
                status: 'resolved'
            }
        ];

        this.saveAlerts();
    },

    saveAlerts() {
        localStorage.setItem('psychologist_alerts', JSON.stringify(this.alerts));
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadAlerts();
                this.renderAlerts();
                this.showToast('Alertas actualizadas');
            });
        }

        // Add config button for hub URL
        this.addConfigButton();

        // Risk tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentRiskFilter = btn.dataset.risk;
                this.renderAlerts();
            });
        });

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentStatusFilter = statusFilter.value;
                this.renderAlerts();
            });
        }

        // Modal controls
        const modalClose = document.querySelector('#alert-detail-modal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideDetailModal());
        }

        const closeModalBtn = document.querySelector('#alert-detail-modal .close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideDetailModal());
        }

        const markResolvedBtn = document.querySelector('#alert-detail-modal .mark-resolved-btn');
        if (markResolvedBtn) {
            markResolvedBtn.addEventListener('click', () => this.markAsResolved());
        }

        // Save notes button
        const saveNotesBtn = document.getElementById('save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', () => this.saveNotes());
        }
    },

    renderAlerts() {
        const list = document.getElementById('alerts-list');
        const emptyState = document.getElementById('empty-state');

        console.log('[ALERTS PANEL] Rendering alerts. Total alerts:', this.alerts.length);
        console.log('[ALERTS PANEL] Current filters - Risk:', this.currentRiskFilter, 'Status:', this.currentStatusFilter);
        
        // Log all alerts before filtering
        this.alerts.forEach(alert => {
            console.log('[ALERTS PANEL] Alert before filter:', {
                id: alert.id,
                student: alert.studentName,
                risk: alert.riskLevel,
                status: alert.status,
                device: alert.deviceOrigen
            });
        });

        const filteredAlerts = this.alerts.filter(alert => {
            // Risk filter
            if (this.currentRiskFilter !== 'all' && alert.riskLevel !== this.currentRiskFilter) {
                console.log('[ALERTS PANEL] Filtered out by risk:', alert.studentName, alert.riskLevel, '!=', this.currentRiskFilter);
                return false;
            }
            // Status filter
            if (this.currentStatusFilter !== 'all' && alert.status !== this.currentStatusFilter) {
                console.log('[ALERTS PANEL] Filtered out by status:', alert.studentName, alert.status, '!=', this.currentStatusFilter);
                return false;
            }
            return true;
        });

        console.log('[ALERTS PANEL] Alerts after filtering:', filteredAlerts.length);

        if (filteredAlerts.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        list.classList.remove('hidden');
        emptyState.classList.add('hidden');

        list.innerHTML = filteredAlerts.map(alert => `
            <div class="alert-item risk-${alert.riskLevel} ${alert.status === 'resolved' ? 'resolved' : ''}" data-alert-id="${alert.id}">
                <div class="alert-item-header">
                    <span class="alert-item-student">${alert.studentName}</span>
                    <span class="alert-item-date">${alert.date}</span>
                </div>
                <div class="alert-item-details">
                    <span class="alert-item-evaluation">${alert.evaluation}</span>
                    <span class="alert-item-score">${alert.score}/${alert.maxScore}</span>
                </div>
                <span class="alert-item-status ${alert.status}">
                    ${alert.status === 'pending' ? '⏳ Pendiente' : '✅ Resuelta'}
                </span>
            </div>
        `).join('');

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

        const riskBadge = document.getElementById('alert-risk-badge');
        riskBadge.textContent = this.getRiskLabel(alert.riskLevel);
        riskBadge.className = `alert-risk-badge ${alert.riskLevel}`;

        document.getElementById('alert-student').textContent = alert.studentName;
        document.getElementById('alert-date').textContent = alert.date;
        document.getElementById('alert-evaluation').textContent = alert.evaluation;
        document.getElementById('alert-score').textContent = `${alert.score}/${alert.maxScore}`;
        document.getElementById('alert-description').textContent = alert.description;

        const recommendationsList = document.getElementById('alert-recommendations-list');
        recommendationsList.innerHTML = alert.recommendations.map(rec => `<li>${rec}</li>`).join('');

        // Populate notes field
        const notesInput = document.getElementById('alert-notes-input');
        if (notesInput) {
            notesInput.value = alert.notes || '';
        }

        // Update button based on status
        const markResolvedBtn = document.querySelector('#alert-detail-modal .mark-resolved-btn');
        if (alert.status === 'resolved') {
            markResolvedBtn.textContent = 'Marcar como Pendiente';
            markResolvedBtn.onclick = () => this.markAsPending();
        } else {
            markResolvedBtn.textContent = 'Marcar como Resuelta';
            markResolvedBtn.onclick = () => this.markAsResolved();
        }

        document.getElementById('alert-detail-modal').classList.remove('hidden');
    },

    hideDetailModal() {
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

    async markAsResolved() {
        if (!this.selectedAlert) return;

        this.selectedAlert.status = 'resolved';
        this.saveAlerts();
        
        // Sync with hub if configured
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(this.selectedAlert.remoteId, 'resolved', this.selectedAlert.notes);
            if (success) {
                this.showToast('Alerta marcada como resuelta y sincronizada', 'success');
            } else {
                this.showToast('Alerta marcada como resuelta (error de sincronización)', 'warning');
            }
        } else {
            this.showToast('Alerta marcada como resuelta', 'success');
        }
        
        this.renderAlerts();
        this.hideDetailModal();
    },

    async markAsPending() {
        if (!this.selectedAlert) return;

        this.selectedAlert.status = 'pending';
        this.saveAlerts();
        
        // Sync with hub if configured
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(this.selectedAlert.remoteId, 'pending', this.selectedAlert.notes);
            if (success) {
                this.showToast('Alerta marcada como pendiente y sincronizada', 'success');
            } else {
                this.showToast('Alerta marcada como pendiente (error de sincronización)', 'warning');
            }
        } else {
            this.showToast('Alerta marcada como pendiente');
        }
        
        this.renderAlerts();
        this.hideDetailModal();
    },

    async saveNotes() {
        if (!this.selectedAlert) return;

        const notesInput = document.getElementById('alert-notes-input');
        if (!notesInput) return;

        this.selectedAlert.notes = notesInput.value;
        this.saveAlerts();

        // Sync with hub if configured
        if (this.selectedAlert.remoteId) {
            const success = await this.updateAlertStatusOnHub(
                this.selectedAlert.remoteId, 
                this.selectedAlert.status, 
                this.selectedAlert.notes
            );
            if (success) {
                this.showToast('Notas guardadas y sincronizadas', 'success');
            } else {
                this.showToast('Notas guardadas (error de sincronización)', 'warning');
            }
        } else {
            this.showToast('Notas guardadas', 'success');
        }
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        if (toast && toastMessage) {
            toast.className = 'toast';
            if (type === 'success') toast.classList.add('success');
            if (type === 'error') toast.classList.add('error');
            
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    },

    addConfigButton() {
        const header = document.querySelector('.alerts-header');
        if (!header) return;

        const configBtn = document.createElement('button');
        configBtn.className = 'btn btn-secondary btn-small';
        configBtn.textContent = '⚙️';
        configBtn.style.marginLeft = '10px';
        configBtn.title = 'Configurar URL del Hub';
        
        configBtn.addEventListener('click', () => {
            const url = prompt('Ingrese la URL del Hub de Alertas (Google Apps Script):', this.hubUrl);
            if (url) {
                this.hubUrl = url;
                localStorage.setItem('alert_sync_url', url);
                this.loadAlerts();
                this.renderAlerts();
                this.showToast('URL configurada correctamente', 'success');
            }
        });
        
        header.appendChild(configBtn);

        // Add test button
        const testBtn = document.createElement('button');
        testBtn.className = 'btn btn-secondary btn-small';
        testBtn.textContent = '🧪';
        testBtn.style.marginLeft = '5px';
        testBtn.title = 'Probar conexión al Hub';
        
        testBtn.addEventListener('click', async () => {
            await this.testHubConnection();
        });
        
        header.appendChild(testBtn);

        // Add send test alert button
        const sendTestBtn = document.createElement('button');
        sendTestBtn.className = 'btn btn-secondary btn-small';
        sendTestBtn.textContent = '📤';
        sendTestBtn.style.marginLeft = '5px';
        sendTestBtn.title = 'Enviar alerta de prueba al hub';
        
        sendTestBtn.addEventListener('click', async () => {
            await this.sendTestAlert();
        });
        
        header.appendChild(sendTestBtn);
    },

    async testHubConnection() {
        try {
            console.log('[ALERTS PANEL] Testing hub connection...');
            const response = await fetch(this.hubUrl);
            const data = await response.json();
            
            console.log('[ALERTS PANEL] Hub test response:', data);
            
            if (data.ok) {
                this.showToast('Hub conectado correctamente', 'success');
                
                // Now check for alerts
                const listResponse = await fetch(`${this.hubUrl}?action=listar`);
                const listData = await listResponse.json();
                
                let message = `Hub Status: OK\nMensaje: ${data.mensaje || 'Hub activo'}\n\n`;
                
                if (listData.ok && listData.alertas) {
                    message += `Alertas en hub: ${listData.alertas.length}\n`;
                    const webAlerts = listData.alertas.filter(a => a.deviceOrigen === 'web').length;
                    const androidAlerts = listData.alertas.filter(a => a.deviceOrigen !== 'web').length;
                    message += `- De web: ${webAlerts}\n`;
                    message += `- De Android: ${androidAlerts}\n`;
                    
                    if (listData.alertas.length > 0) {
                        message += `\nÚltima alerta:\n`;
                        const lastAlert = listData.alertas[0];
                        message += `- Estudiante: ${lastAlert.nombreEstudiante}\n`;
                        message += `- Nivel: ${lastAlert.nivelRiesgo}\n`;
                        message += `- Dispositivo: ${lastAlert.deviceOrigen || 'N/A'}\n`;
                        message += `- Fecha: ${lastAlert.timestamp}\n`;
                        message += `- Email Psicólogo: ${lastAlert.emailPsicologo || 'No asignado'}\n`;
                    }
                } else {
                    message += `Error al listar alertas: ${listData.error || 'Desconocido'}`;
                }
                
                alert(message);
            } else {
                this.showToast('Error en conexión al hub', 'error');
                alert(`Hub Error: ${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('[ALERTS PANEL] Hub connection test failed:', error);
            this.showToast('Error al probar conexión', 'error');
            alert(`Error de conexión: ${error.message}\n\nVerifica:\n1. La URL del hub es correcta\n2. El hub está accesible públicamente\n3. No hay bloqueo CORS\n4. El Google Apps Script está desplegado como "Cualquier persona"`);
        }
    },

    async sendTestAlert() {
        try {
            const testAlert = {
                remoteId: `test_web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                emailEstudiante: 'test@estudiante.com',
                nombreEstudiante: 'Estudiante de Prueba',
                gradoEstudiante: '11',
                tipo: 'evaluacion',
                nivelRiesgo: 'alto',
                timestamp: new Date().toISOString(),
                extracto: 'Evaluación de prueba. Puntaje 21. Prueba de alerta desde web.',
                estado: 'PENDIENTE',
                notas: '',
                idReferencia: 0,
                deviceOrigen: 'web',
                emailPsicologo: 'riverahoyoskevinfernando6@gmail.com'
            };

            console.log('[ALERTS PANEL] Sending test alert to hub:', testAlert);
            
            const url = `${this.hubUrl}?action=publicar&alerta=${encodeURIComponent(JSON.stringify(testAlert))}`;
            console.log('[ALERTS PANEL] Test alert URL:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                redirect: 'follow'
            });
            
            const data = await response.json();
            console.log('[ALERTS PANEL] Test alert response:', data);
            
            if (data.ok) {
                this.showToast('Alerta de prueba enviada al hub', 'success');
                alert(`Alerta de prueba enviada exitosamente\nRemote ID: ${data.remoteId}\n\nAhora haz clic en 🧪 para verificar si aparece en el hub.`);
                
                // Refresh alerts after a short delay
                setTimeout(() => {
                    this.loadAlerts();
                    this.renderAlerts();
                }, 2000);
            } else {
                this.showToast('Error al enviar alerta de prueba', 'error');
                alert(`Error al enviar alerta de prueba:\n${data.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('[ALERTS PANEL] Error sending test alert:', error);
            this.showToast('Error al enviar alerta de prueba', 'error');
            alert(`Error: ${error.message}`);
        }
    },

    async updateAlertStatusOnHub(remoteId, newStatus, notes) {
        if (!this.hubUrl || !remoteId) return false;

        try {
            const payload = {
                action: 'actualizar',
                remoteId: remoteId,
                estado: newStatus === 'resolved' ? 'ATENDIDA' : 'PENDIENTE',
                notas: notes || '',
                timestampActualizacion: new Date().toISOString()
            };

            const response = await fetch(this.hubUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return data.ok === true;
        } catch (error) {
            console.error('Error updating alert status on hub:', error);
            return false;
        }
    },

    startPolling() {
        // Poll for new alerts every 30 seconds
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.pollingInterval = setInterval(() => {
            this.loadAlerts();
            this.renderAlerts();
        }, 30000);
        console.log('[ALERTS PANEL] Started polling for alerts (30s interval)');
    },

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[ALERTS PANEL] Stopped polling for alerts');
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('[ALERTS PANEL] Notification permission granted');
                } else {
                    console.log('[ALERTS PANEL] Notification permission denied');
                }
            });
        } else {
            console.log('[ALERTS PANEL] This browser does not support notifications');
        }
    },

    notifyNewAlerts(count) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const pendingHighRisk = this.alerts.filter(a => 
                a.riskLevel === 'high' && a.status === 'pending'
            ).length;
            
            const title = count === 1 
                ? '🚨 Nueva Alerta de Riesgo' 
                : `🚨 ${count} Nuevas Alertas de Riesgo`;
            
            const body = pendingHighRisk > 0 
                ? `${pendingHighRisk} alerta(s) de alto riesgo pendiente(s). Revisa el panel de alertas.`
                : `${count} nueva(s) alerta(s) pendiente(s). Revisa el panel de alertas.`;

            const notification = new Notification(title, {
                body: body,
                icon: '/images/app-icon.jpeg',
                badge: '/images/app-icon.jpeg',
                tag: 'wellness-alerts',
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            console.log('[ALERTS PANEL] Browser notification sent');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init();
});

// Cleanup when leaving the page
window.addEventListener('beforeunload', () => {
    AlertsModule.stopPolling();
});
