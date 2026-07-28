// Chat Controller
class ChatController {
    constructor(dbManager) {
        this.db = dbManager;
        this.currentSession = null;
        this.apiKey = null;
        this.messages = [];
    }
    
    async initSession(userId) {
        try {
            // Check for existing active session
            const sessions = await this.db.getByIndex(DB_CONFIG.tables.chatSessions, 'userId', userId);
            const activeSession = sessions.find(s => s.estado === 'activo');
            
            if (activeSession) {
                this.currentSession = activeSession;
                await this.loadMessages(activeSession.id);
            } else {
                // Create new session
                const session = {
                    userId,
                    clavePublica: Utils.generateId(),
                    clavePrivadaEnc: Utils.generateId(),
                    fechaInicio: Utils.now(),
                    estado: 'activo'
                };
                
                const sessionId = await this.db.add(DB_CONFIG.tables.chatSessions, session);
                this.currentSession = { ...session, id: sessionId };
                this.messages = [];
            }
            
            return { success: true, session: this.currentSession };
        } catch (error) {
            console.error('Error initializing chat session:', error);
            return { success: false, error: 'Error al inicializar sesión de chat' };
        }
    }
    
    async loadMessages(sessionId) {
        try {
            const allMessages = await this.db.getAll(DB_CONFIG.tables.chatMessages);
            this.messages = allMessages
                .filter(m => m.chatId === sessionId)
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            return this.messages;
        } catch (error) {
            console.error('Error loading messages:', error);
            return [];
        }
    }
    
    async sendMessage(content, userId) {
        try {
            if (!this.currentSession) {
                await this.initSession(userId);
            }
            
            // Save user message
            const userMessage = {
                chatId: this.currentSession.id,
                userId,
                emisor: 'usuario',
                contenidoEnc: content,
                sentimiento: 0,
                riesgoDetectado: 0,
                fecha: Utils.now()
            };
            
            await this.db.add(DB_CONFIG.tables.chatMessages, userMessage);
            this.messages.push(userMessage);
            
            // Analyze sentiment and risk
            const analysis = this.analyzeMessage(content);
            
            // Update message with analysis
            userMessage.sentimiento = analysis.sentiment;
            userMessage.riesgoDetectado = analysis.risk;
            await this.db.update(DB_CONFIG.tables.chatMessages, userMessage);
            
            // Create alert if high risk detected
            if (analysis.risk >= 2) {
                await this.createRiskAlert(userId, content, analysis.risk);
            }
            
            // Generate AI response
            const aiResponse = await this.generateAIResponse(content, analysis);
            
            // Save AI message
            const assistantMessage = {
                chatId: this.currentSession.id,
                userId,
                emisor: 'asistente',
                contenidoEnc: aiResponse,
                sentimiento: 0,
                riesgoDetectado: 0,
                fecha: Utils.now()
            };
            
            await this.db.add(DB_CONFIG.tables.chatMessages, assistantMessage);
            this.messages.push(assistantMessage);
            
            return {
                success: true,
                userMessage,
                assistantMessage,
                riskDetected: analysis.risk >= 2
            };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: 'Error al enviar mensaje' };
        }
    }
    
    analyzeMessage(content) {
        const lowerContent = content.toLowerCase();
        
        // Risk keywords
        const highRiskKeywords = ['suicidio', 'matarme', 'morir', 'acabar', 'no quiero vivir', 'fin'];
        const mediumRiskKeywords = ['triste', 'deprimido', 'solo', 'desesperado', 'angustia', 'panic'];
        
        let risk = 0;
        let sentiment = 0;
        
        // Check for risk
        highRiskKeywords.forEach(keyword => {
            if (lowerContent.includes(keyword)) {
                risk = 3;
            }
        });
        
        if (risk === 0) {
            mediumRiskKeywords.forEach(keyword => {
                if (lowerContent.includes(keyword)) {
                    risk = Math.max(risk, 2);
                }
            });
        }
        
        // Simple sentiment analysis
        const positiveWords = ['feliz', 'bien', 'alegre', 'contento', 'mejor', 'gracias'];
        const negativeWords = ['triste', 'mal', 'preocupado', 'ansioso', 'miedo', 'solo'];
        
        positiveWords.forEach(word => {
            if (lowerContent.includes(word)) sentiment += 1;
        });
        
        negativeWords.forEach(word => {
            if (lowerContent.includes(word)) sentiment -= 1;
        });
        
        return { sentiment, risk };
    }
    
    async generateAIResponse(userMessage, analysis) {
        // If API key is configured, use OpenAI
        if (this.apiKey) {
            try {
                const response = await this.callOpenAI(userMessage, analysis);
                if (response) return response;
            } catch (error) {
                console.error('OpenAI API error:', error);
            }
        }
        
        // Fallback to rule-based responses
        return this.getRuleBasedResponse(userMessage, analysis);
    }
    
    async callOpenAI(userMessage, analysis) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres un asistente emocional empático y de apoyo. Tu objetivo es escuchar y proporcionar apoyo emocional. Si detectas riesgo de suicidio o autolesión, responde con empatía pero recomienda buscar ayuda profesional inmediatamente.'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
            return null;
        } catch (error) {
            console.error('OpenAI API call failed:', error);
            return null;
        }
    }
    
    getRuleBasedResponse(userMessage, analysis) {
        const lowerMessage = userMessage.toLowerCase();
        
        // High risk responses
        if (analysis.risk >= 3) {
            return "Siento mucho que estés pasando por esto. Tu vida es valiosa y hay personas que quieren ayudarte. Por favor, contacta con una línea de ayuda: 📞 911 (emergencias) o busca un profesional de salud mental. No estás solo/a en esto.";
        }
        
        if (analysis.risk >= 2) {
            return "Entiendo que estás pasando por un momento difícil. Es valioso que compartas lo que sientes. Te recomiendo hablar con un consejero o terapeuta. Mientras tanto, estoy aquí para escucharte. ¿Hay algo específico que quieras compartir?";
        }
        
        // Anxiety responses
        if (lowerMessage.includes('ansioso') || lowerMessage.includes('nervioso') || lowerMessage.includes('preocupado')) {
            return "Es normal sentir ansiedad a veces. ¿Hay algo específico que te esté causando preocupación? Puedo sugerirte algunas técnicas de respiración que podrían ayudarte a calmarte.";
        }
        
        // Sadness responses
        if (lowerMessage.includes('triste') || lowerMessage.includes('deprimido')) {
            return "Siento que te sientas así. Las emociones difíciles son parte de la vida. ¿Quieres hablar más sobre lo que te está haciendo sentir triste? A veces compartir ayuda a aliviar la carga.";
        }
        
        // Stress responses
        if (lowerMessage.includes('estrés') || lowerMessage.includes('presión') || lowerMessage.includes('cansado')) {
            return "El estrés puede ser abrumador. ¿Hay algo en particular que esté generando presión? Es importante encontrar momentos para descansar y cuidar de ti mismo/a.";
        }
        
        // Loneliness responses
        if (lowerMessage.includes('solo') || lowerMessage.includes('aislado')) {
            return "Sentirse solo puede ser muy difícil. Recuerda que no tienes que enfrentar todo esto por tu cuenta. ¿Hay alguien en tu vida con quien te gustaría hablar? Estoy aquí para escucharte también.";
        }
        
        // Default supportive response
        const supportResponses = [
            "Gracias por compartir eso conmigo. ¿Hay algo más que quieras hablar?",
            "Te escucho. ¿Cómo te ha hecho sentir esto?",
            "Es valioso que expreses tus sentimientos. ¿Hay algo específico que necesites ahora?",
            "Estoy aquí para apoyarte. ¿Qué más te gustaría compartir?",
            "Compartir tus emociones es un paso importante. ¿Cómo puedo ayudarte mejor?"
        ];
        
        return supportResponses[Math.floor(Math.random() * supportResponses.length)];
    }
    
    async createRiskAlert(userId, messageContent, riskLevel) {
        try {
            console.log('[CHAT] Creating risk alert');
            console.log('[CHAT] Risk level:', riskLevel);
            console.log('[CHAT] Message:', messageContent.substring(0, 50));
            
            const user = await this.db.get(DB_CONFIG.tables.users, userId);
            if (!user) {
                console.error('[CHAT] User not found:', userId);
                return { success: false };
            }
            console.log('[CHAT] User found:', user.email, user.name);

            // Get psychologist email
            const psicologoEmail = await this.getPsicologoEmail();
            console.log('[CHAT] Psychologist email:', psicologoEmail);

            // Save to local database
            const alert = {
                userId,
                tipo: 'chat_ia',
                nivelRiesgo: riskLevel >= 3 ? 'ALTO' : 'MEDIO',
                timestamp: Utils.now(),
                extracto: messageContent.substring(0, 200),
                estado: 'PENDIENTE',
                gradoEstudiante: user?.grade || 'N/A',
                emailEstudiante: user?.email || '',
                nombreEstudiante: user?.name || ''
            };
            
            await this.db.add(DB_CONFIG.tables.alerts, alert);
            console.log('[CHAT] Alert saved to local database');

            // Send to hub
            await this.sendAlertToHub(alert, psicologoEmail, this.currentSession?.id);
            
            return { success: true };
        } catch (error) {
            console.error('[CHAT] Error creating risk alert:', error);
            return { success: false };
        }
    }

    async getPsicologoEmail() {
        try {
            // Try to get from hub first
            const hubUrl = 'https://script.google.com/macros/s/AKfycbyLUvV6UxvwSqraxhDSODl_ZZ0Yjw7q0fS2T1w19_h2VQEV8y_g8IePLQDVEcPYmPvZuA/exec';
            const response = await fetch(`${hubUrl}?action=listar_psicologos`, {
                mode: 'cors',
                redirect: 'follow'
            });
            const data = await response.json();
            
            if (data.ok && data.psicologos && data.psicologos.length > 0) {
                return data.psicologos[0].email;
            }
            
            // Fallback: get from local database
            const allUsers = await this.db.getAll(DB_CONFIG.tables.users);
            const psicologo = allUsers.find(u => u.role === 'psicologo');
            if (psicologo) {
                return psicologo.email;
            }
            
            return null;
        } catch (error) {
            console.error('Error getting psychologist email:', error);
            return null;
        }
    }

    async sendAlertToHub(alert, psicologoEmail, chatId) {
        try {
            const hubUrl = 'https://script.google.com/macros/s/AKfycbyLUvV6UxvwSqraxhDSODl_ZZ0Yjw7q0fS2T1w19_h2VQEV8y_g8IePLQDVEcPYmPvZuA/exec';
            
            const alerta = {
                remoteId: `web_chat_${Date.now()}_${alert.userId}`,
                emailEstudiante: alert.emailEstudiante,
                nombreEstudiante: alert.nombreEstudiante,
                gradoEstudiante: alert.gradoEstudiante,
                tipo: 'chat',
                nivelRiesgo: alert.nivelRiesgo.toLowerCase(),
                timestamp: alert.timestamp,
                extracto: alert.extracto,
                estado: 'PENDIENTE',
                notas: '',
                idReferencia: chatId || '',
                deviceOrigen: 'web',
                emailPsicologo: psicologoEmail || ''
            };

            const url = `${hubUrl}?action=publicar&alerta=${encodeURIComponent(JSON.stringify(alerta))}`;
            const response = await fetch(url, {
                mode: 'cors',
                redirect: 'follow'
            });

            const data = await response.json();
            if (data.ok) {
                console.log('Chat alert sent to hub successfully');
            } else {
                console.error('Error sending chat alert to hub:', data.error);
            }
        } catch (error) {
            console.error('Error sending chat alert to hub:', error);
        }
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
}

// Initialize Chat Controller
let chatController;

// UI Functions
function addMessageToUI(message, isUser) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const text = document.createElement('p');
    text.textContent = message.contenidoEnc || message;
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    content.appendChild(text);
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant-message typing-message';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    content.appendChild(indicator);
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showRiskAlert() {
    const messagesContainer = document.getElementById('chat-messages');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'risk-alert';
    alertDiv.innerHTML = `
        <div class="risk-alert-icon">⚠️</div>
        <div class="risk-alert-content">
            <h4>Se ha detectado contenido sensible</h4>
            <p>Si necesitas ayuda urgente, contacta líneas de emergencia: 911</p>
        </div>
    `;
    
    messagesContainer.appendChild(alertDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateSendButtonState() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = input.value.trim().length === 0;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat controller when app is ready
    const initInterval = setInterval(() => {
        if (dbManager && authController) {
            chatController = new ChatController(dbManager);
            
            // Initialize session
            const userId = parseInt(localStorage.getItem('userId'));
            if (userId) {
                chatController.initSession(userId);
            }
            
            clearInterval(initInterval);
        }
    }, 100);
    
    // Back to dashboard
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Quick response buttons
    document.querySelectorAll('.quick-response-btn').forEach(button => {
        button.addEventListener('click', () => {
            const response = button.dataset.response;
            document.getElementById('message-input').value = response;
            updateSendButtonState();
            document.getElementById('send-btn').click();
        });
    });
    
    // Message input
    const messageInput = document.getElementById('message-input');
    
    messageInput.addEventListener('input', updateSendButtonState);
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!document.getElementById('send-btn').disabled) {
                document.getElementById('send-btn').click();
            }
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Send button
    document.getElementById('send-btn').addEventListener('click', async () => {
        const content = messageInput.value.trim();
        if (!content) return;
        
        const userId = parseInt(localStorage.getItem('userId'));
        if (!userId) {
            Utils.showToast('Debes iniciar sesión primero', 'error');
            return;
        }
        
        // Add user message to UI
        addMessageToUI({ contenidoEnc: content }, true);
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        updateSendButtonState();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message
        const result = await chatController.sendMessage(content, userId);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (result.success) {
            // Add AI response to UI
            addMessageToUI(result.assistantMessage, false);
            
            // Show risk alert if needed
            if (result.riskDetected) {
                showRiskAlert();
            }
        } else {
            Utils.showToast('Error al enviar mensaje', 'error');
        }
    });
});
