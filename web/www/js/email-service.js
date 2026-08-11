// Email Service for Web App
// Wellness Mental App - Email Notification System
// Based on Android CorreoService

const EmailService = {
    // Email configuration - would be configured with real SMTP settings in production
    config: {
        // In production, these would come from environment variables or secure config
        smtpServer: null, // e.g., 'smtp.gmail.com'
        smtpPort: 587,
        smtpUser: null, // e.g., 'wellnessmental@gmail.com'
        smtpPassword: null, // App-specific password
        fromEmail: 'wellnessmental@school.edu',
        fromName: 'Wellness Mental App'
    },

    // Email templates (same as Android)
    templates: {
        prioritaria: (alerta) => {
            const nivelEmoji = alerta.nivelRiesgo?.toLowerCase() === 'alto' ? '🔴' :
                              alerta.nivelRiesgo?.toLowerCase() === 'medio' ? '🟡' : '🟢';
            
            const asunto = `[URGENTE] ${nivelEmoji} Alerta de Riesgo - ${alerta.nombreEstudiante || 'Estudiante'}`;
            
            const cuerpoTexto = `
ALERTA DE RIESGO - WELLNESS MENTAL
${'='.repeat(50)}

NIVEL DE RIESGO: ${alerta.nivelRiesgo?.toUpperCase() || 'N/A'}
ESTUDIANTE: ${alerta.nombreEstudiante || 'N/A'}
GRADO: ${alerta.gradoEstudiante || 'N/A'}
EMAIL: ${alerta.emailEstudiante || 'N/A'}
TIPO: ${alerta.tipo || 'N/A'}
FECHA: ${alerta.timestamp || new Date().toISOString()}

EXTRACTO:
${alerta.extracto || 'Sin extracto'}

ACCIONES RECOMENDADAS:
- Revisar el panel de alertas en la aplicación
- Contactar al estudiante de inmediato si es riesgo alto
- Programar sesión de seguimiento
- Documentar las acciones tomadas

Este mensaje fue generado automáticamente por Wellness Mental App.
            `.trim();

            const cuerpoHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .risk-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; margin: 10px 0; }
        .risk-alto { background: #e74c3c; }
        .risk-medio { background: #f39c12; }
        .risk-bajo { background: #27ae60; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 5px; }
        .info-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
        .info-value { font-size: 16px; margin: 5px 0; }
        .extract-box { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 15px 0; }
        .actions-box { background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; margin: 15px 0; }
        .actions-box ul { margin: 10px 0; padding-left: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        .urgent-banner { background: #e74c3c; color: white; text-align: center; padding: 10px; font-weight: bold; border-radius: 5px; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 Alerta de Riesgo</h1>
        <p>Wellness Mental App</p>
    </div>
    
    <div class="content">
        <div class="urgent-banner">⚠️ REQUIERE ATENCIÓN INMEDIATA</div>
        
        <div class="risk-badge risk-${alerta.nivelRiesgo?.toLowerCase() || 'bajo'}">
            ${nivelEmoji} RIESGO ${alerta.nivelRiesgo?.toUpperCase() || 'N/A'}
        </div>
        
        <div class="info-box">
            <div class="info-label">Estudiante</div>
            <div class="info-value">${alerta.nombreEstudiante || 'N/A'}</div>
            
            <div class="info-label">Grado</div>
            <div class="info-value">${alerta.gradoEstudiante || 'N/A'}</div>
            
            <div class="info-label">Email</div>
            <div class="info-value">${alerta.emailEstudiante || 'N/A'}</div>
            
            <div class="info-label">Tipo de Alerta</div>
            <div class="info-value">${alerta.tipo || 'N/A'}</div>
            
            <div class="info-label">Fecha y Hora</div>
            <div class="info-value">${this.formatDate(alerta.timestamp)}</div>
        </div>
        
        <div class="extract-box">
            <strong>📝 Extracto del mensaje:</strong>
            <p>${alerta.extracto || 'Sin extracto'}</p>
        </div>
        
        <div class="actions-box">
            <strong>✅ Acciones Recomendadas:</strong>
            <ul>
                <li>Revisar el panel de alertas en la aplicación web</li>
                <li>Contactar al estudiante de inmediato si es riesgo alto</li>
                <li>Programar sesión de seguimiento prioritaria</li>
                <li>Documentar todas las acciones tomadas</li>
                <li>Informar a padres/tutores si es menor de edad</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Este mensaje fue generado automáticamente por Wellness Mental App</p>
            <p>Si tiene preguntas, contacte al administrador del sistema</p>
        </div>
    </div>
</body>
</html>
            `.trim();

            return { asunto, cuerpoTexto, cuerpoHtml };
        },

        tutor: (alerta) => {
            const asunto = `📢 Aviso de Bienestar - ${alerta.nombreEstudiante || 'estudiante'}`;
            
            const cuerpoTexto = `
AVISO DE BIENESTAR - WELLNESS MENTAL
${'='.repeat(50)}

Estimado/a tutor/a,

Se ha generado una alerta de seguimiento en la app de bienestar mental.

ESTUDIANTE: ${alerta.nombreEstudiante || 'N/A'}
NIVEL DE RIESGO: ${alerta.nivelRiesgo?.toUpperCase() || 'N/A'}
EXTRACTO: ${alerta.extracto || 'Sin extracto'}

El equipo psicológico institucional ha sido notificado y está siguiendo el caso.
Su apoyo es fundamental para el bienestar del estudiante.

Si tiene preguntas, puede contactar al psicólogo institucional.
            `.trim();

            const cuerpoHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #11998e; margin: 15px 0; border-radius: 5px; }
        .info-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
        .info-value { font-size: 16px; margin: 5px 0; }
        .notice-box { background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📢 Aviso de Bienestar</h1>
        <p>Wellness Mental App</p>
    </div>
    
    <div class="content">
        <p>Estimado/a tutor/a,</p>
        <p>Se ha generado una alerta de seguimiento en la aplicación de bienestar mental de su hijo/a.</p>
        
        <div class="info-box">
            <div class="info-label">Estudiante</div>
            <div class="info-value">${alerta.nombreEstudiante || 'N/A'}</div>
            
            <div class="info-label">Nivel de Riesgo</div>
            <div class="info-value">${alerta.nivelRiesgo?.toUpperCase() || 'N/A'}</div>
            
            <div class="info-label">Extracto</div>
            <div class="info-value">${alerta.extracto || 'Sin extracto'}</div>
        </div>
        
        <div class="notice-box">
            <strong>✅ Información Importante:</strong>
            <p>El equipo psicológico institucional ha sido notificado y está siguiendo el caso de cerca. Su apoyo y comprensión son fundamentales para el bienestar del estudiante.</p>
        </div>
        
        <div class="footer">
            <p>Este mensaje fue generado automáticamente por Wellness Mental App</p>
        </div>
    </div>
</body>
</html>
            `.trim();

            return { asunto, cuerpoTexto, cuerpoHtml };
        }
    },

    // Format date for display
    formatDate(isoString) {
        if (!isoString) return new Date().toLocaleDateString('es-ES');
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    },

    // Send priority alert email to psychologist
    async enviarAlertaPrioritaria(emailPsicologo, alerta) {
        if (!emailPsicologo) {
            console.error('[EMAIL] No psychologist email provided');
            return { success: false, error: 'No email provided' };
        }

        try {
            const { asunto, cuerpoTexto, cuerpoHtml } = this.templates.prioritaria(alerta);
            
            console.log('[EMAIL] Sending priority alert to:', emailPsicologo);
            console.log('[EMAIL] Alert level:', alerta.nivelRiesgo);
            
            // In production, you would send via SMTP server or email API
            // For demo, we'll simulate the send
            const result = await this.simulateEmailSend({
                to: emailPsicologo,
                subject: asunto,
                text: cuerpoTexto,
                html: cuerpoHtml,
                priority: 'high'
            });
            
            // Log the email for audit purposes
            this.logEmailSent({
                to: emailPsicologo,
                type: 'priority_alert',
                alertId: alerta.remoteId || alerta.id,
                nivelRiesgo: alerta.nivelRiesgo,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            console.error('[EMAIL] Error sending priority alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Send copy to tutor
    async enviarCopiaAlertaTutor(tutorEmail, alerta) {
        if (!tutorEmail) {
            console.error('[EMAIL] No tutor email provided');
            return { success: false, error: 'No email provided' };
        }

        try {
            const { asunto, cuerpoTexto, cuerpoHtml } = this.templates.tutor(alerta);
            
            console.log('[EMAIL] Sending tutor copy to:', tutorEmail);
            
            const result = await this.simulateEmailSend({
                to: tutorEmail,
                subject: asunto,
                text: cuerpoTexto,
                html: cuerpoHtml,
                priority: 'normal'
            });
            
            this.logEmailSent({
                to: tutorEmail,
                type: 'tutor_copy',
                alertId: alerta.remoteId || alerta.id,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            console.error('[EMAIL] Error sending tutor copy:', error);
            return { success: false, error: error.message };
        }
    },

    // Simulate email send (for demo purposes)
    async simulateEmailSend(emailData) {
        // In production, this would use:
        // 1. SMTP server (nodemailer, etc.)
        // 2. Email API (SendGrid, Mailgun, AWS SES)
        // 3. Server-side endpoint that handles email sending
        
        console.log('[EMAIL] Email would be sent with data:', {
            to: emailData.to,
            subject: emailData.subject,
            priority: emailData.priority,
            timestamp: new Date().toISOString()
        });
        
        // Store in localStorage for demo purposes
        const sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
        sentEmails.push({
            ...emailData,
            sentAt: new Date().toISOString(),
            simulated: true
        });
        localStorage.setItem('sent_emails', JSON.stringify(sentEmails));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { 
            success: true, 
            message: 'Email sent successfully (simulated)',
            simulated: true 
        };
    },

    // Log email for audit trail
    logEmailSent(logData) {
        try {
            const emailLogs = JSON.parse(localStorage.getItem('email_logs') || '[]');
            emailLogs.push({
                ...logData,
                loggedAt: new Date().toISOString()
            });
            localStorage.setItem('email_logs', JSON.stringify(emailLogs));
            console.log('[EMAIL] Email logged:', logData);
        } catch (error) {
            console.error('[EMAIL] Error logging email:', error);
        }
    },

    // Get email logs (for admin/audit)
    getEmailLogs() {
        try {
            return JSON.parse(localStorage.getItem('email_logs') || '[]');
        } catch (error) {
            console.error('[EMAIL] Error getting email logs:', error);
            return [];
        }
    },

    // Configure email service (would be called during setup)
    configure(config) {
        this.config = { ...this.config, ...config };
        console.log('[EMAIL] Email service configured:', {
            smtpServer: config.smtpServer ? 'configured' : 'not configured',
            fromEmail: config.fromEmail
        });
    },

    // Test email configuration
    async testConfiguration(testEmail) {
        if (!testEmail) {
            return { success: false, error: 'No test email provided' };
        }

        const testAlert = {
            nombreEstudiante: 'Estudiante de Prueba',
            gradoEstudiante: '10°',
            emailEstudiante: 'estudiante@test.com',
            tipo: 'evaluacion',
            nivelRiesgo: 'alto',
            timestamp: new Date().toISOString(),
            extracto: 'Este es un correo de prueba del sistema de notificaciones de Wellness Mental.',
            remoteId: 'test-' + Date.now()
        };

        return this.enviarAlertaPrioritaria(testEmail, testAlert);
    },

    // Check if email service is properly configured
    isConfigured() {
        return !!(this.config.smtpServer && this.config.smtpUser && this.config.smtpPassword);
    },

    // Get configuration status
    getConfigStatus() {
        return {
            isConfigured: this.isConfigured(),
            hasSmtpServer: !!this.config.smtpServer,
            hasSmtpUser: !!this.config.smtpUser,
            hasSmtpPassword: !!this.config.smtpPassword,
            fromEmail: this.config.fromEmail
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}