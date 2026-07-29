// Evaluation Controller
class EvaluationController {
    constructor(dbManager) {
        this.db = dbManager;
        this.currentQuestionnaire = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.results = null;
    }
    
    async getQuestionnaires() {
        try {
            const questionnaires = await this.db.getAll(DB_CONFIG.tables.questionnaires);
            return questionnaires.filter(q => q.estado === 'publicado');
        } catch (error) {
            console.error('Error getting questionnaires:', error);
            return [];
        }
    }
    
    async getQuestions(questionnaireId) {
        try {
            const allQuestions = await this.db.getAll(DB_CONFIG.tables.questions);
            return allQuestions
                .filter(q => q.questionnaireId === questionnaireId)
                .sort((a, b) => a.orden - b.orden);
        } catch (error) {
            console.error('Error getting questions:', error);
            return [];
        }
    }
    
    async startQuestionnaire(questionnaireId) {
        try {
            this.currentQuestionnaire = await this.db.get(DB_CONFIG.tables.questionnaires, questionnaireId);
            this.currentQuestions = await this.getQuestions(questionnaireId);
            this.currentQuestionIndex = 0;
            this.answers = new Array(this.currentQuestions.length).fill(null);
            
            return {
                success: true,
                questionnaire: this.currentQuestionnaire,
                totalQuestions: this.currentQuestions.length
            };
        } catch (error) {
            console.error('Error starting questionnaire:', error);
            return { success: false, error: 'Error al iniciar cuestionario' };
        }
    }
    
    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            return null;
        }
        return this.currentQuestions[this.currentQuestionIndex];
    }
    
    setAnswer(answerValue) {
        this.answers[this.currentQuestionIndex] = parseInt(answerValue);
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }
    
    calculateScore() {
        const totalScore = this.answers.reduce((sum, answer) => sum + (answer || 0), 0);
        const maxScore = this.currentQuestions.length * 3;
        
        let level, riskLevel, icon;
        
        if (this.currentQuestionnaire.tipo === 'GAD-7') {
            if (totalScore <= 4) {
                level = 'Ansiedad Mínima';
                riskLevel = 'Bajo';
                icon = '😊';
            } else if (totalScore <= 9) {
                level = 'Ansiedad Leve';
                riskLevel = 'Bajo';
                icon = '🙂';
            } else if (totalScore <= 14) {
                level = 'Ansiedad Moderada';
                riskLevel = 'Moderado';
                icon = '😐';
            } else {
                level = 'Ansiedad Severa';
                riskLevel = 'Alto';
                icon = '😰';
            }
        } else if (this.currentQuestionnaire.tipo === 'PHQ-9') {
            if (totalScore <= 4) {
                level = 'Depresión Mínima';
                riskLevel = 'Bajo';
                icon = '😊';
            } else if (totalScore <= 9) {
                level = 'Depresión Leve';
                riskLevel = 'Bajo';
                icon = '🙂';
            } else if (totalScore <= 14) {
                level = 'Depresión Moderada';
                riskLevel = 'Moderado';
                icon = '😐';
            } else if (totalScore <= 19) {
                level = 'Depresión Moderadamente Severa';
                riskLevel = 'Alto';
                icon = '😔';
            } else {
                level = 'Depresión Severa';
                riskLevel = 'Alto';
                icon = '😢';
            }
        } else {
            level = 'Evaluación Completada';
            riskLevel = 'Bajo';
            icon = '📊';
        }
        
        return {
            totalScore,
            maxScore,
            level,
            riskLevel,
            icon
        };
    }
    
    getRecommendations(score) {
        const recommendations = [];
        
        if (score.riskLevel === 'Bajo') {
            recommendations.push('Continuar con prácticas de bienestar y autocuidado');
            recommendations.push('Mantener una rutina de sueño regular');
            recommendations.push('Realizar actividad física moderada');
            recommendations.push('Practicar ejercicios de respiración y mindfulness');
        } else if (score.riskLevel === 'Moderado') {
            recommendations.push('Considerar hablar con un consejero o terapeuta');
            recommendations.push('Practicar técnicas de manejo de estrés');
            recommendations.push('Mantener contacto con amigos y familiares');
            recommendations.push('Evitar el consumo de alcohol y otras sustancias');
            recommendations.push('Establecer límites saludables en trabajo y estudio');
        } else {
            recommendations.push('Se recomienda consultar con un profesional de salud mental');
            recommendations.push('Contactar líneas de ayuda disponibles en tu país');
            recommendations.push('No aislarse, buscar apoyo de seres queridos');
            recommendations.push('Considerar terapia cognitivo-conductual');
            recommendations.push('Seguir las indicaciones de un profesional de la salud');
        }
        
        return recommendations;
    }
    
    getPrediagnosis(score) {
        if (this.currentQuestionnaire.tipo === 'GAD-7') {
            if (score.totalScore <= 4) {
                return 'Puntaje dentro del rango normal. Se recomienda continuar con prácticas de bienestar.';
            } else if (score.totalScore <= 9) {
                return 'Síntomas leves de ansiedad. Se recomienda monitorear y practicar técnicas de relajación.';
            } else if (score.totalScore <= 14) {
                return 'Síntomas moderados de ansiedad que podrían interferir con actividades diarias. Se recomienda considerar ayuda profesional.';
            } else {
                return 'Síntomas severos de ansiedad que requieren atención profesional. Se recomienda consultar con un especialista en salud mental.';
            }
        } else if (this.currentQuestionnaire.tipo === 'PHQ-9') {
            if (score.totalScore <= 4) {
                return 'Puntaje dentro del rango normal. Se recomienda mantener hábitos saludables.';
            } else if (score.totalScore <= 9) {
                return 'Síntomas leves de depresión. Se recomienda aumentar actividad física y social.';
            } else if (score.totalScore <= 14) {
                return 'Síntomas moderados de depresión. Se recomienda considerar terapia o consejería.';
            } else if (score.totalScore <= 19) {
                return 'Síntomas moderadamente severos de depresión. Se recomienda buscar ayuda profesional.';
            } else {
                return 'Síntomas severos de depresión que requieren atención inmediata. Se recomienda consultar con un especialista.';
            }
        }
        return 'Evaluación completada exitosamente.';
    }
    
    async saveResults(userId, score, prediagnosis, recommendations) {
        try {
            const result = {
                userId,
                questionnaireId: this.currentQuestionnaire.id,
                puntaje: score.totalScore,
                nivelRiesgo: score.riskLevel,
                prediagnostico: prediagnosis,
                recomendaciones: recommendations.join('\n'),
                datosEncriptados: JSON.stringify({
                    answers: this.answers,
                    timestamp: Utils.now()
                }),
                fecha: Utils.now()
            };
            
            const resultId = await this.db.add(DB_CONFIG.tables.results, result);
            
            // Save individual responses
            for (let i = 0; i < this.currentQuestions.length; i++) {
                const response = {
                    userId,
                    questionId: this.currentQuestions[i].id,
                    questionnaireId: this.currentQuestionnaire.id,
                    valor: this.answers[i] || 0,
                    fecha: Utils.now()
                };
                await this.db.add(DB_CONFIG.tables.responses, response);
            }
            
            // Add points for completing evaluation
            await this.addPointsForEvaluation(userId);
            
            // Send alert to hub if risk is high or moderate
            if (score.riskLevel === 'Alto' || score.riskLevel === 'Moderado') {
                await this.sendAlertToHub(userId, result, score, resultId);
            }
            
            return { success: true, resultId };
        } catch (error) {
            console.error('Error saving results:', error);
            return { success: false, error: 'Error al guardar resultados' };
        }
    }

    async sendAlertToHub(userId, result, score, resultId) {
        try {
            console.log('[EVALUATION] Starting alert sending process');
            console.log('[EVALUATION] Score:', score);
            console.log('[EVALUATION] Risk level:', score.riskLevel);
            
            // Get user info
            const user = await this.db.get(DB_CONFIG.tables.users, userId);
            if (!user) {
                console.error('[EVALUATION] User not found:', userId);
                return;
            }
            console.log('[EVALUATION] User found:', user.email, user.name);

            // Get psychologist email
            const psicologoEmail = await this.getPsicologoEmail();
            console.log('[EVALUATION] Psychologist email:', psicologoEmail);

            if (!psicologoEmail) {
                console.error('[EVALUATION] No psychologist email found - alert will be sent but email notification may fail');
            }

            const hubUrl = 'https://script.google.com/macros/s/AKfycbzQpzgBXaROCzV0k3nKK28NEcMQDvaAHLi2Nj2y57MxhYrdvgnwQmKZqZ7Dg2Kq-Vyl/exec';
            
            const alerta = {
                remoteId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                emailEstudiante: user.email,
                nombreEstudiante: user.name,
                gradoEstudiante: user.grade || 'N/A',
                tipo: 'evaluacion',
                nivelRiesgo: score.riskLevel.toLowerCase(),
                timestamp: result.fecha,
                extracto: `Evaluación ${this.currentQuestionnaire.tipo}. Puntaje ${score.totalScore}. ${result.prediagnostico.substring(0, 50)}`,
                estado: 'PENDIENTE',
                notas: '',
                idReferencia: resultId,
                deviceOrigen: 'web',
                emailPsicologo: psicologoEmail || ''
            };

            console.log('[EVALUATION] Sending alert to hub:', JSON.stringify(alerta));
            console.log('[EVALUATION] Alert risk level for email trigger:', alerta.nivelRiesgo);
            console.log('[EVALUATION] Psychologist email for email trigger:', alerta.emailPsicologo);

            const url = `${hubUrl}?action=publicar&alerta=${encodeURIComponent(JSON.stringify(alerta))}`;
            console.log('[EVALUATION] Full request URL:', url);
            
            const response = await fetch(url, {
                mode: 'cors',
                redirect: 'follow'
            });

            console.log('[EVALUATION] Response status:', response.status);
            console.log('[EVALUATION] Response ok:', response.ok);
            console.log('[EVALUATION] Response headers:', response.headers);

            const data = await response.json();
            console.log('[EVALUATION] Hub response:', data);
            console.log('[EVALUATION] Hub response ok:', data.ok);
            console.log('[EVALUATION] Hub response remoteId:', data.remoteId);
            console.log('[EVALUATION] Hub response error:', data.error);
            
            if (data.ok) {
                console.log('[EVALUATION] Alert sent to hub successfully');
                console.log('[EVALUATION] Remote ID:', data.remoteId);
                
                // Show success toast to user
                if (score.riskLevel === 'Alto') {
                    Utils.showToast('Alerta de alto riesgo enviada al psicólogo', 'warning');
                }
            } else {
                console.error('[EVALUATION] Error sending alert to hub:', data.error);
                console.error('[EVALUATION] Full error response:', JSON.stringify(data));
                Utils.showToast('Error al enviar alerta al hub', 'error');
            }
        } catch (error) {
            console.error('[EVALUATION] Error sending alert to hub:', error);
            Utils.showToast('Error de conexión al enviar alerta', 'error');
        }
    }

    async getPsicologoEmail() {
        try {
            console.log('[EVALUATION] Getting psychologist email from hub');
            // Try to get from hub first
            const hubUrl = 'https://script.google.com/macros/s/AKfycbzQpzgBXaROCzV0k3nKK28NEcMQDvaAHLi2Nj2y57MxhYrdvgnwQmKZqZ7Dg2Kq-Vyl/exec';
            const response = await fetch(`${hubUrl}?action=listar_psicologos`, {
                mode: 'cors',
                redirect: 'follow'
            });
            const data = await response.json();
            
            console.log('[EVALUATION] Hub psychologists response:', data);
            
            if (data.ok && data.psicologos && data.psicologos.length > 0) {
                console.log('[EVALUATION] Found psychologist in hub:', data.psicologos[0].email);
                return data.psicologos[0].email;
            }
            
            console.log('[EVALUATION] No psychologist in hub, checking local database');
            // Fallback: get from local database
            const allUsers = await this.db.getAll(DB_CONFIG.tables.users);
            const psicologo = allUsers.find(u => u.role === 'psicologo');
            if (psicologo) {
                console.log('[EVALUATION] Found psychologist in local database:', psicologo.email);
                return psicologo.email;
            }
            
            console.log('[EVALUATION] No psychologist found anywhere');
            return null;
        } catch (error) {
            console.error('[EVALUATION] Error getting psychologist email:', error);
            return null;
        }
    }
    
    async addPointsForEvaluation(userId) {
        try {
            const pointsData = await this.db.get(DB_CONFIG.tables.points, userId);
            if (pointsData) {
                pointsData.puntosTotales += 50;
                pointsData.xpNivelActual += 50;
                pointsData.fechaActualizacion = Utils.now();
                
                // Check for level up
                const xpNeeded = pointsData.nivel * 100;
                if (pointsData.xpNivelActual >= xpNeeded) {
                    pointsData.nivel++;
                    pointsData.xpNivelActual = pointsData.xpNivelActual - xpNeeded;
                }
                
                await this.db.update(DB_CONFIG.tables.points, pointsData);
            }
        } catch (error) {
            console.error('Error adding points:', error);
        }
    }
    
    reset() {
        this.currentQuestionnaire = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.results = null;
    }
}

// Initialize Evaluation Controller
let evaluationController;

// UI Functions
function updateQuestionUI() {
    const question = evaluationController.getCurrentQuestion();
    if (!question) return;
    
    document.getElementById('question-text').textContent = question.texto;
    document.getElementById('question-progress').textContent = 
        `${evaluationController.currentQuestionIndex + 1}/${evaluationController.currentQuestions.length}`;
    
    const progress = ((evaluationController.currentQuestionIndex + 1) / evaluationController.currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Clear previous selection
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.checked = false;
    });
    
    // Set previous answer if exists
    const previousAnswer = evaluationController.answers[evaluationController.currentQuestionIndex];
    if (previousAnswer !== null) {
        const input = document.querySelector(`input[name="answer"][value="${previousAnswer}"]`);
        if (input) input.checked = true;
    }
    
    // Update navigation buttons
    document.getElementById('prev-question').disabled = evaluationController.currentQuestionIndex === 0;
    
    const isLastQuestion = evaluationController.currentQuestionIndex === evaluationController.currentQuestions.length - 1;
    const nextButton = document.getElementById('next-question');
    nextButton.textContent = isLastQuestion ? 'Finalizar' : 'Siguiente';
    
    // Enable/disable next button based on answer
    updateNextButtonState();
}

function updateNextButtonState() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    document.getElementById('next-question').disabled = !selectedAnswer;
}

function showResultsScreen(score, prediagnosis, recommendations) {
    document.getElementById('result-icon').textContent = score.icon;
    document.getElementById('result-title').textContent = score.level;
    document.getElementById('result-level').textContent = `Nivel de riesgo: ${score.riskLevel}`;
    document.getElementById('total-score').textContent = score.totalScore;
    document.getElementById('prediagnosis').textContent = prediagnosis;
    
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
    
    // Show/hide risk warning
    const riskWarning = document.getElementById('risk-warning');
    if (score.riskLevel === 'Alto') {
        riskWarning.classList.remove('hidden');
    } else {
        riskWarning.classList.add('hidden');
    }
    
    Utils.showScreen('results-screen');
}

async function completeQuestionnaire() {
    Utils.showLoading();
    
    const score = evaluationController.calculateScore();
    const prediagnosis = evaluationController.getPrediagnosis(score);
    const recommendations = evaluationController.getRecommendations(score);
    
    const userId = parseInt(localStorage.getItem('userId'));
    await evaluationController.saveResults(userId, score, prediagnosis, recommendations);
    
    Utils.hideLoading();
    
    showResultsScreen(score, prediagnosis, recommendations);
    Utils.showToast('Evaluación completada exitosamente', 'success');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize evaluation controller when app is ready
    const initInterval = setInterval(() => {
        if (dbManager && authController) {
            evaluationController = new EvaluationController(dbManager);
            clearInterval(initInterval);
        }
    }, 100);
    
    // Back to dashboard
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Back to list
    document.getElementById('back-to-list').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cancelar la evaluación? Se perderá el progreso.')) {
            evaluationController.reset();
            Utils.showScreen('questionnaire-list-screen');
        }
    });
    
    // Start questionnaire buttons
    document.querySelectorAll('.start-questionnaire').forEach(button => {
        button.addEventListener('click', async () => {
            const card = button.closest('.questionnaire-card');
            const questionnaireId = parseInt(card.dataset.questionnaire);
            
            Utils.showLoading();
            
            const result = await evaluationController.startQuestionnaire(questionnaireId);
            
            Utils.hideLoading();
            
            if (result.success) {
                document.getElementById('questionnaire-title').textContent = result.questionnaire.titulo;
                document.getElementById('questionnaire-instructions').textContent = result.questionnaire.instrucciones;
                updateQuestionUI();
                Utils.showScreen('questionnaire-screen');
            } else {
                Utils.showToast(result.error, 'error');
            }
        });
    });
    
    // Answer selection
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.addEventListener('change', (e) => {
            evaluationController.setAnswer(e.target.value);
            updateNextButtonState();
        });
    });
    
    // Previous question
    document.getElementById('prev-question').addEventListener('click', () => {
        if (evaluationController.previousQuestion()) {
            updateQuestionUI();
        }
    });
    
    // Next question
    document.getElementById('next-question').addEventListener('click', () => {
        const hasMore = evaluationController.nextQuestion();
        if (hasMore) {
            updateQuestionUI();
        } else {
            completeQuestionnaire();
        }
    });
    
    // Back to dashboard from results
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Share results
    document.getElementById('share-results-btn').addEventListener('click', () => {
        const score = evaluationController.calculateScore();
        const text = `Mis resultados de ${evaluationController.currentQuestionnaire.titulo}:\n${score.level} - Puntaje: ${score.totalScore}/${score.maxScore}\n\n${evaluationController.getPrediagnosis(score)}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Resultados de Evaluación - Wellness Mental',
                text: text
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                Utils.showToast('Resultados copiados al portapapeles', 'success');
            }).catch(() => {
                Utils.showToast('No se pudo compartir los resultados', 'error');
            });
        }
    });
});
