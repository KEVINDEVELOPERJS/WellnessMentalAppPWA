// Alerts Module for Psychologists
const AlertsModule = {
    currentRiskFilter: 'high',
    currentStatusFilter: 'all',
    alerts: [],
    selectedAlert: null,
    hubUrl: '', // Will be loaded from config
    pollingInterval: null,
    lastAlertCount: 0,

    init() {
        this.loadHubUrl();
        this.loadAlerts();
        this.setupEventListeners();
        this.renderAlerts();
        this.startPolling();
        this.requestNotificationPermission();
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
            console.log('[ALERTS PANEL] Fetching alerts from hub');
            console.log('[ALERTS PANEL] Hub URL:', this.hubUrl);
            const url = `${this.hubUrl}?action=listar`;
            console.log('[ALERTS PANEL] Request URL:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                redirect: 'follow'
            });
            
            console.log('[ALERTS PANEL] Response status:', response.status);
            console.log('[ALERTS PANEL] Response ok:', response.ok);
            
            const data = await response.json();
            
            console.log('[ALERTS PANEL] Hub response:', data);
            console.log('[ALERTS PANEL] Hub response ok:', data.ok);
            console.log('[ALERTS PANEL] Hub alertas count:', data.alertas ? data.alertas.length : 0);
            
            if (data.ok && data.alertas) {
                console.log('[ALERTS PANEL] Raw alerts from hub:', data.alertas);
                const previousCount = this.alerts.length;
                this.alerts = this.transformHubAlerts(data.alertas);
                console.log('[ALERTS PANEL] Transformed alerts:', this.alerts);
                this.saveAlerts();
                
                // Check for new alerts and notify
                if (this.alerts.length > previousCount && previousCount > 0) {
                    const newAlerts = this.alerts.length - previousCount;
                    console.log(`[ALERTS PANEL] ${newAlerts} new alert(s) detected`);
                    this.notifyNewAlerts(newAlerts);
                }
                
                console.log(`[ALERTS PANEL] Loaded ${this.alerts.length} alerts from hub`);
            } else {
                console.error('[ALERTS PANEL] Error fetching alerts from hub:', data.error);
                this.generateSampleAlerts();
            }
        } catch (error) {
            console.error('[ALERTS PANEL] Error connecting to hub:', error);
            console.error('[ALERTS PANEL] Error details:', error.message);
            this.generateSampleAlerts();
        }
    },

    transformHubAlerts(hubAlerts) {
        console.log('[ALERTS PANEL] Transforming', hubAlerts.length, 'alerts from hub');
        const transformed = hubAlerts.map(alerta => {
            const riskLevel = this.mapRiskLevel(alerta.nivelRiesgo);
            console.log('[ALERTS PANEL] Alert:', {
                remoteId: alerta.remoteId,
                device: alerta.deviceOrigen,
                student: alerta.nombreEstudiante,
                risk: alerta.nivelRiesgo,
                mappedRisk: riskLevel,
                status: alerta.estado
            });
            return {
                id: alerta.remoteId || alerta.idReferencia || Date.now(),
                studentName: alerta.nombreEstudiante || 'Estudiante',
                date: this.formatDate(alerta.timestamp),
                evaluation: alerta.tipo === 'evaluacion' ? 'Evaluación' : 'Chat IA',
                score: this.extractScore(alerta.extracto),
                maxScore: alerta.tipo === 'evaluacion' ? 21 : 10,
                riskLevel: riskLevel,
                description: alerta.extracto || 'Sin descripción',
                recommendations: this.generateRecommendations(alerta.nivelRiesgo, alerta.tipo),
                status: this.mapStatus(alerta.estado),
                studentEmail: alerta.emailEstudiante,
                grade: alerta.gradoEstudiante,
                remoteId: alerta.remoteId,
                notes: alerta.notas,
                deviceOrigen: alerta.deviceOrigen
            };
        });
        
        // Count by device origin
        const webAlerts = transformed.filter(a => a.deviceOrigen === 'web').length;
        const androidAlerts = transformed.filter(a => a.deviceOrigen !== 'web').length;
        console.log(`[ALERTS PANEL] Transformed alerts: ${webAlerts} from web, ${androidAlerts} from Android`);
        
        return transformed;
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
