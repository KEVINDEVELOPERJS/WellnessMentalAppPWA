// Parent Reports Module
const ParentReportsModule = {
    currentCode: null,
    currentReports: [],
    currentReport: null,

    init() {
        this.loadCurrentCode();
        this.setupEventListeners();
    },

    loadCurrentCode() {
        const saved = localStorage.getItem('parentInvitationCode');
        if (saved) {
            const data = JSON.parse(saved);
            const now = new Date().getTime();
            if (now < data.expiry) {
                this.currentCode = data.code;
                this.showCurrentCodeSection();
            } else {
                localStorage.removeItem('parentInvitationCode');
            }
        }
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const generateCodeBtn = document.getElementById('generate-code-btn');
        if (generateCodeBtn) {
            generateCodeBtn.addEventListener('click', () => this.generateInvitationCode());
        }

        const copyCodeBtn = document.getElementById('copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => this.copyCode());
        }

        const revokeCodeBtn = document.getElementById('revoke-code-btn');
        if (revokeCodeBtn) {
            revokeCodeBtn.addEventListener('click', () => this.revokeCode());
        }

        const parentAccessForm = document.getElementById('parent-access-form');
        if (parentAccessForm) {
            parentAccessForm.addEventListener('submit', (e) => this.handleParentAccess(e));
        }

        const twoFaForm = document.getElementById('2fa-form');
        if (twoFaForm) {
            twoFaForm.addEventListener('submit', (e) => this.handle2FA(e));
        }

        const backToAccessBtn = document.getElementById('back-to-access');
        if (backToAccessBtn) {
            backToAccessBtn.addEventListener('click', () => this.showAccessSection());
        }

        const backToReportsBtn = document.getElementById('back-to-reports');
        if (backToReportsBtn) {
            backToReportsBtn.addEventListener('click', () => this.showReportsSection());
        }

        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
        }

        const contactPsychologistBtn = document.getElementById('contact-psychologist-btn');
        if (contactPsychologistBtn) {
            contactPsychologistBtn.addEventListener('click', () => this.contactPsychologist());
        }
    },

    generateInvitationCode() {
        // Generate a random 8-character code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
        this.currentCode = code;

        localStorage.setItem('parentInvitationCode', JSON.stringify({
            code: code,
            expiry: expiry
        }));

        this.showCurrentCodeSection();
        this.showToast('Código generado exitosamente');
    },

    showCurrentCodeSection() {
        document.getElementById('current-code-section').classList.remove('hidden');
        document.getElementById('current-code').textContent = this.currentCode;
    },

    copyCode() {
        if (this.currentCode) {
            navigator.clipboard.writeText(this.currentCode).then(() => {
                this.showToast('Código copiado al portapapeles');
            }).catch(() => {
                this.showToast('Error al copiar el código');
            });
        }
    },

    revokeCode() {
        if (confirm('¿Estás seguro de revocar el código actual? Tus padres ya no podrán acceder con este código.')) {
            localStorage.removeItem('parentInvitationCode');
            this.currentCode = null;
            document.getElementById('current-code-section').classList.add('hidden');
            this.showToast('Código revocado exitosamente');
        }
    },

    handleParentAccess(e) {
        e.preventDefault();
        const code = document.getElementById('invitation-code').value.trim().toUpperCase();

        if (code.length !== 8) {
            this.showToast('El código debe tener 8 caracteres');
            return;
        }

        // Simulate validation - in real app, this would be server-side
        const saved = localStorage.getItem('parentInvitationCode');
        if (saved) {
            const data = JSON.parse(saved);
            const now = new Date().getTime();
            if (code === data.code && now < data.expiry) {
                // Generate 2FA code
                const twoFACode = this.generate2FACode();
                this.showToast(`Código 2FA: ${twoFACode}`);
                this.show2FASection();
            } else {
                this.showToast('Código inválido o expirado');
            }
        } else {
            this.showToast('Código inválido');
        }
    },

    generate2FACode() {
        // Generate a random 6-digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    handle2FA(e) {
        e.preventDefault();
        const code = document.getElementById('2fa-code').value.trim();

        if (code.length !== 6) {
            this.showToast('El código debe tener 6 dígitos');
            return;
        }

        // Simulate 2FA validation
        this.loadSampleReports();
        this.showReportsSection();
        this.showToast('Verificación exitosa');
    },

    loadSampleReports() {
        this.currentReports = [
            {
                id: 1,
                date: '24/07/2026',
                riskLevel: 'low',
                riskLabel: 'Bajo',
                summary: 'El estudiante muestra un estado emocional estable con indicadores positivos de bienestar.',
                detail: 'Los resultados de las evaluaciones indican niveles de ansiedad y depresión dentro de rangos normales. Se recomienda continuar con las prácticas de bienestar actuales.',
                recommendations: [
                    'Mantener rutina de ejercicios de respiración',
                    'Continuar con check-ins emocionales diarios',
                    'Fomentar actividades recreativas'
                ]
            },
            {
                id: 2,
                date: '15/07/2026',
                riskLevel: 'medium',
                riskLabel: 'Medio',
                summary: 'Se observó un aumento temporal en los niveles de estrés durante el periodo de exámenes.',
                detail: 'Las evaluaciones muestran niveles moderados de estrés relacionados con presión académica. Se sugiere implementar técnicas de manejo de estrés.',
                recommendations: [
                    'Implementar técnicas de manejo de estrés',
                    'Establecer horarios de estudio con descansos',
                    'Considerar actividades de relajación antes de dormir'
                ]
            },
            {
                id: 3,
                date: '01/07/2026',
                riskLevel: 'low',
                riskLabel: 'Bajo',
                summary: 'Estado emocional estable con buena adherencia a las actividades de bienestar.',
                detail: 'El estudiante ha mantenido una constancia positiva en los ejercicios de respiración y check-ins diarios. Los indicadores de ansiedad y depresión se mantienen en rangos saludables.',
                recommendations: [
                    'Continuar con la rutina actual',
                    'Explorar nuevas actividades de mindfulness',
                    'Mantener comunicación abierta sobre emociones'
                ]
            }
        ];

        this.renderReports();
    },

    renderReports() {
        const list = document.getElementById('reports-list');
        const noReports = document.getElementById('no-reports');

        if (this.currentReports.length === 0) {
            list.classList.add('hidden');
            noReports.classList.remove('hidden');
            return;
        }

        list.classList.remove('hidden');
        noReports.classList.add('hidden');

        list.innerHTML = this.currentReports.map(report => `
            <div class="report-item risk-${report.riskLevel}" data-report-id="${report.id}">
                <div class="report-item-header">
                    <span class="report-item-title">Informe #${report.id}</span>
                    <span class="report-item-date">${report.date}</span>
                </div>
                <div>
                    <span class="report-item-risk ${report.riskLevel}">Riesgo: ${report.riskLabel}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners
        list.querySelectorAll('.report-item').forEach(item => {
            item.addEventListener('click', () => {
                const reportId = parseInt(item.dataset.reportId);
                this.showReportDetail(reportId);
            });
        });
    },

    showReportDetail(reportId) {
        const report = this.currentReports.find(r => r.id === reportId);
        if (!report) return;

        this.currentReport = report;

        const riskIcon = document.getElementById('report-risk-icon');
        const riskLevel = document.getElementById('report-risk-level');
        const reportDate = document.getElementById('report-date');
        const summary = document.getElementById('report-summary');
        const detail = document.getElementById('report-detail');
        const recommendations = document.getElementById('report-recommendations');

        riskIcon.textContent = report.riskLevel === 'high' ? '🔴' : 
                               report.riskLevel === 'medium' ? '🟡' : '🟢';
        riskLevel.textContent = `Nivel de Riesgo: ${report.riskLabel}`;
        reportDate.textContent = `Fecha: ${report.date}`;
        summary.textContent = report.summary;
        detail.textContent = report.detail;
        recommendations.innerHTML = report.recommendations.map(rec => `<li>${rec}</li>`).join('');

        this.showReportDetailSection();
    },

    showAccessSection() {
        document.getElementById('access-section').classList.remove('hidden');
        document.getElementById('2fa-section').classList.add('hidden');
        document.getElementById('reports-section').classList.add('hidden');
        document.getElementById('report-detail-section').classList.add('hidden');
    },

    show2FASection() {
        document.getElementById('access-section').classList.add('hidden');
        document.getElementById('2fa-section').classList.remove('hidden');
        document.getElementById('reports-section').classList.add('hidden');
        document.getElementById('report-detail-section').classList.add('hidden');
    },

    showReportsSection() {
        document.getElementById('access-section').classList.add('hidden');
        document.getElementById('2fa-section').classList.add('hidden');
        document.getElementById('reports-section').classList.remove('hidden');
        document.getElementById('report-detail-section').classList.add('hidden');
    },

    showReportDetailSection() {
        document.getElementById('access-section').classList.add('hidden');
        document.getElementById('2fa-section').classList.add('hidden');
        document.getElementById('reports-section').classList.add('hidden');
        document.getElementById('report-detail-section').classList.remove('hidden');
    },

    downloadPDF() {
        if (!this.currentReport) return;

        // Simulate PDF generation
        this.showToast('Generando PDF...');
        
        setTimeout(() => {
            // In a real implementation, this would generate and download a PDF
            const content = `
INFORME DE BIENESTAR ESTUDIANTIL
================================

Fecha: ${this.currentReport.date}
Nivel de Riesgo: ${this.currentReport.riskLabel}

RESUMEN
-------
${this.currentReport.summary}

DETALLE
-------
${this.currentReport.detail}

RECOMENDACIONES
---------------
${this.currentReport.recommendations.map(r => '- ' + r).join('\n')}
            `;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `informe_${this.currentReport.date.replace(/\//g, '-')}.txt`;
            a.click();
            URL.revokeObjectURL(url);

            this.showToast('PDF descargado exitosamente');
        }, 1000);
    },

    contactPsychologist() {
        const subject = encodeURIComponent('Consulta sobre informe de bienestar');
        const body = encodeURIComponent(
            'Hola,\n\nTengo consultas sobre el informe de bienestar de mi hijo/a.\n\nPor favor, podrían proporcionarme más información.\n\nGracias.'
        );
        
        window.location.href = `mailto:psicologo@wellnessmental.com?subject=${subject}&body=${body}`;
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        if (toast && toastMessage) {
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
    ParentReportsModule.init();
});
