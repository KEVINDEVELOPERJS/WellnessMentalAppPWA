// Alerts Module for Psychologists
const AlertsModule = {
    currentRiskFilter: 'high',
    currentStatusFilter: 'all',
    alerts: [],
    selectedAlert: null,
    hubUrl: '', // Will be loaded from config

    init() {
        this.loadHubUrl();
        this.loadAlerts();
        this.setupEventListeners();
        this.renderAlerts();
    },

    loadHubUrl() {
        // Load hub URL from config or use default
        this.hubUrl = localStorage.getItem('alert_sync_url') || 'https://script.google.com/macros/s/AKfycbyLUvV6UxvwSqraxhDSODl_ZZ0Yjw7q0fS2T1w19_h2VQEV8y_g8IePLQDVEcPYmPvZuA/exec';
        if (!this.hubUrl) {
            console.warn('Alert hub URL not configured. Using sample data.');
        }
    },

    async loadAlerts() {
        if (this.hubUrl) {
            await this.fetchAlertsFromHub();
        } else {
            // Load from localStorage or generate sample alerts
            const storedAlerts = localStorage.getItem('psychologist_alerts');
            if (storedAlerts) {
                this.alerts = JSON.parse(storedAlerts);
            } else {
                this.generateSampleAlerts();
            }
        }
    },

    async fetchAlertsFromHub() {
        try {
            const url = `${this.hubUrl}?action=listar`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.ok && data.alertas) {
                this.alerts = this.transformHubAlerts(data.alertas);
                this.saveAlerts();
                console.log(`Loaded ${this.alerts.length} alerts from hub`);
            } else {
                console.error('Error fetching alerts from hub:', data.error);
                this.generateSampleAlerts();
            }
        } catch (error) {
            console.error('Error connecting to hub:', error);
            this.generateSampleAlerts();
        }
    },

    transformHubAlerts(hubAlerts) {
        return hubAlerts.map(alerta => ({
            id: alerta.remoteId || alerta.idReferencia || Date.now(),
            studentName: alerta.nombreEstudiante || 'Estudiante',
            date: this.formatDate(alerta.timestamp),
            evaluation: alerta.tipo === 'evaluacion' ? 'Evaluación' : 'Chat IA',
            score: this.extractScore(alerta.extracto),
            maxScore: alerta.tipo === 'evaluacion' ? 21 : 10,
            riskLevel: this.mapRiskLevel(alerta.nivelRiesgo),
            description: alerta.extracto || 'Sin descripción',
            recommendations: this.generateRecommendations(alerta.nivelRiesgo, alerta.tipo),
            status: this.mapStatus(alerta.estado),
            studentEmail: alerta.emailEstudiante,
            grade: alerta.gradoEstudiante,
            remoteId: alerta.remoteId,
            notes: alerta.notas
        }));
    },

    mapRiskLevel(nivel) {
        const level = nivel?.toLowerCase() || 'bajo';
        if (level.includes('alto')) return 'high';
        if (level.includes('medio')) return 'medium';
        return 'low';
    },

    mapStatus(estado) {
        const status = estado?.toLowerCase() || 'pendiente';
        if (status.includes('atendida') || status.includes('resuelta')) return 'resolved';
        if (status.includes('seguimiento')) return 'pending';
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

    extractScore(extracto) {
        if (!extracto) return 0;
        const match = extracto.match(/Puntaje\s+(\d+)/);
        return match ? parseInt(match[1]) : 0;
    },

    generateRecommendations(nivelRiesgo, tipo) {
        const nivel = nivelRiesgo?.toLowerCase() || 'bajo';
        const recommendations = [];
        
        if (nivel.includes('alto')) {
            recommendations.push('Contactar al estudiante de inmediato');
            recommendations.push('Programar sesión de terapia prioritaria');
            recommendations.push('Informar a padres/tutores si es menor de edad');
            recommendations.push('Documentar intervención en notas');
        } else if (nivel.includes('medio')) {
            recommendations.push('Programar sesión de evaluación');
            recommendations.push('Monitorear progreso semanalmente');
            recommendations.push('Considerar actividades de bienestar adicionales');
        } else {
            recommendations.push('Continuar monitoreo regular');
            recommendations.push('Reevaluar en próximo check-in');
        }
        
        if (tipo === 'chat') {
            recommendations.push('Revisar historial de chat completo');
        }
        
        return recommendations;
    },

    generateSampleAlerts() {
        this.alerts = [
            {
                id: 1,
                studentName: 'María García',
                date: '24/07/2026',
                evaluation: 'GAD-7',
                score: 15,
                maxScore: 21,
                riskLevel: 'high',
                description: 'La estudiante muestra niveles elevados de ansiedad generalizada que requieren atención inmediata.',
                recommendations: [
                    'Contactar a la estudiante para seguimiento prioritario',
                    'Programar sesión de terapia esta semana',
                    'Informar a padres/tutores (menor de edad)'
                ],
                status: 'pending'
            },
            {
                id: 2,
                studentName: 'Carlos López',
                date: '23/07/2026',
                evaluation: 'PHQ-9',
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

        const filteredAlerts = this.alerts.filter(alert => {
            // Risk filter
            if (this.currentRiskFilter !== 'all' && alert.riskLevel !== this.currentRiskFilter) {
                return false;
            }
            // Status filter
            if (this.currentStatusFilter !== 'all' && alert.status !== this.currentStatusFilter) {
                return false;
            }
            return true;
        });

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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init();
});
