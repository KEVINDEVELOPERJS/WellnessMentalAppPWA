// Alerts Module for Psychologists
const AlertsModule = {
    currentRiskFilter: 'high',
    alerts: [],
    selectedAlert: null,

    init() {
        this.loadAlerts();
        this.setupEventListeners();
        this.renderAlerts();
    },

    loadAlerts() {
        // Load sample alerts (in real app, this would come from a database)
        const storedAlerts = localStorage.getItem('psychologist_alerts');
        if (storedAlerts) {
            this.alerts = JSON.parse(storedAlerts);
        } else {
            this.generateSampleAlerts();
        }
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
            refreshBtn.addEventListener('click', () => {
                this.loadAlerts();
                this.renderAlerts();
                this.showToast('Alertas actualizadas');
            });
        }

        // Risk tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentRiskFilter = btn.dataset.risk;
                this.renderAlerts();
            });
        });

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
    },

    renderAlerts() {
        const list = document.getElementById('alerts-list');
        const emptyState = document.getElementById('empty-state');

        const filteredAlerts = this.alerts.filter(alert => {
            if (this.currentRiskFilter === 'all') return true;
            return alert.riskLevel === this.currentRiskFilter;
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

    markAsResolved() {
        if (!this.selectedAlert) return;

        this.selectedAlert.status = 'resolved';
        this.saveAlerts();
        this.renderAlerts();
        this.hideDetailModal();
        this.showToast('Alerta marcada como resuelta', 'success');
    },

    markAsPending() {
        if (!this.selectedAlert) return;

        this.selectedAlert.status = 'pending';
        this.saveAlerts();
        this.renderAlerts();
        this.hideDetailModal();
        this.showToast('Alerta marcada como pendiente');
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AlertsModule.init();
});
