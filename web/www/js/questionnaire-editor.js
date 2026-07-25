// Questionnaire Editor Module for Psychologists
const QuestionnaireEditorModule = {
    questionnaires: [],
    currentQuestionnaire: null,
    questionCount: 0,

    init() {
        this.loadQuestionnaires();
        this.setupEventListeners();
        this.renderQuestionnaires();
    },

    loadQuestionnaires() {
        const stored = localStorage.getItem('psychologist_questionnaires');
        if (stored) {
            this.questionnaires = JSON.parse(stored);
        } else {
            this.generateSampleQuestionnaires();
        }
    },

    generateSampleQuestionnaires() {
        this.questionnaires = [
            {
                id: 1,
                title: 'Escala de Estrés Académico',
                description: 'Mide el nivel de estrés relacionado con actividades académicas',
                category: 'estres',
                instructions: 'Responde basándote en cómo te has sentido durante el último mes',
                status: 'publicado',
                questions: [
                    { text: 'Me siento abrumado/a por la cantidad de trabajo académico', order: 1 },
                    { text: 'Tengo dificultades para concentrarme en mis estudios', order: 2 },
                    { text: 'Me preocupa no cumplir con los plazos de entrega', order: 3 }
                ],
                createdAt: '2026-07-20'
            },
            {
                id: 2,
                title: 'Escala de Bienestar General',
                description: 'Evaluación general del bienestar emocional y físico',
                category: 'bienestar',
                instructions: 'Indica tu nivel de acuerdo con cada afirmación',
                status: 'borrador',
                questions: [
                    { text: 'Me siento satisfecho/a con mi vida en general', order: 1 },
                    { text: 'Tengo relaciones sociales satisfactorias', order: 2 }
                ],
                createdAt: '2026-07-22'
            }
        ];

        this.saveQuestionnaires();
    },

    saveQuestionnaires() {
        localStorage.setItem('psychologist_questionnaires', JSON.stringify(this.questionnaires));
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const newBtn = document.getElementById('new-questionnaire-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.showForm());
        }

        const backToEditorBtn = document.getElementById('back-to-editor');
        if (backToEditorBtn) {
            backToEditorBtn.addEventListener('click', () => this.showEditor());
        }

        const addQuestionBtn = document.getElementById('add-question-btn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => this.addQuestion());
        }

        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    renderQuestionnaires() {
        const list = document.getElementById('questionnaires-list');
        const emptyState = document.getElementById('empty-state');

        if (this.questionnaires.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        list.classList.remove('hidden');
        emptyState.classList.add('hidden');

        list.innerHTML = this.questionnaires.map(q => `
            <div class="questionnaire-item" data-id="${q.id}">
                <div class="questionnaire-item-header">
                    <span class="questionnaire-title">${q.title}</span>
                    <span class="questionnaire-status ${q.status}">${q.status === 'publicado' ? 'Publicado' : 'Borrador'}</span>
                </div>
                <div class="questionnaire-details">${q.description}</div>
                <div class="questionnaire-meta">
                    <span>📂 ${q.category}</span>
                    <span>❓ ${q.questions.length} preguntas</span>
                    <span>📅 ${q.createdAt}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners for editing
        list.querySelectorAll('.questionnaire-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.editQuestionnaire(id);
            });
        });
    },

    showForm() {
        this.currentQuestionnaire = null;
        this.questionCount = 0;
        document.getElementById('form-title').textContent = 'Nuevo Cuestionario';
        document.getElementById('questionnaire-form').reset();
        document.getElementById('questions-container').innerHTML = '';
        document.getElementById('editor-screen').classList.remove('active');
        document.getElementById('form-screen').classList.add('active');
    },

    showEditor() {
        document.getElementById('form-screen').classList.remove('active');
        document.getElementById('editor-screen').classList.add('active');
        this.renderQuestionnaires();
    },

    editQuestionnaire(id) {
        const q = this.questionnaires.find(q => q.id === id);
        if (!q) return;

        this.currentQuestionnaire = q;
        this.questionCount = q.questions.length;

        document.getElementById('form-title').textContent = 'Editar Cuestionario';
        document.getElementById('q-title').value = q.title;
        document.getElementById('q-description').value = q.description;
        document.getElementById('q-category').value = q.category;
        document.getElementById('q-instructions').value = q.instructions || '';
        document.getElementById('q-status').value = q.status;

        // Render questions
        const container = document.getElementById('questions-container');
        container.innerHTML = q.questions.map((question, index) => `
            <div class="question-item" data-index="${index}">
                <div class="question-item-header">
                    <span class="question-number">Pregunta ${index + 1}</span>
                    <button type="button" class="remove-question-btn" data-index="${index}">🗑️</button>
                </div>
                <input type="text" 
                       class="question-text" 
                       value="${question.text}" 
                       placeholder="Escribe la pregunta aquí"
                       required>
            </div>
        `).join('');

        // Add remove listeners
        container.querySelectorAll('.remove-question-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.removeQuestion(index);
            });
        });

        document.getElementById('editor-screen').classList.remove('active');
        document.getElementById('form-screen').classList.add('active');
    },

    addQuestion() {
        this.questionCount++;
        const container = document.getElementById('questions-container');
        const questionHtml = `
            <div class="question-item" data-index="${this.questionCount - 1}">
                <div class="question-item-header">
                    <span class="question-number">Pregunta ${this.questionCount}</span>
                    <button type="button" class="remove-question-btn" data-index="${this.questionCount - 1}">🗑️</button>
                </div>
                <input type="text" 
                       class="question-text" 
                       placeholder="Escribe la pregunta aquí"
                       required>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', questionHtml);

        // Add remove listener
        const newBtn = container.querySelector(`.remove-question-btn[data-index="${this.questionCount - 1}"]`);
        newBtn.addEventListener('click', () => {
            this.removeQuestion(this.questionCount - 1);
        });
    },

    removeQuestion(index) {
        const container = document.getElementById('questions-container');
        const questionItem = container.querySelector(`.question-item[data-index="${index}"]`);
        if (questionItem) {
            questionItem.remove();
            this.questionCount--;
            this.renumberQuestions();
        }
    },

    renumberQuestions() {
        const container = document.getElementById('questions-container');
        container.querySelectorAll('.question-item').forEach((item, index) => {
            item.dataset.index = index;
            item.querySelector('.question-number').textContent = `Pregunta ${index + 1}`;
            item.querySelector('.remove-question-btn').dataset.index = index;
        });
    },

    handleSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('q-title').value;
        const description = document.getElementById('q-description').value;
        const category = document.getElementById('q-category').value;
        const instructions = document.getElementById('q-instructions').value;
        const status = document.getElementById('q-status').value;

        // Collect questions
        const questions = [];
        document.querySelectorAll('.question-text').forEach((input, index) => {
            if (input.value.trim()) {
                questions.push({
                    text: input.value.trim(),
                    order: index + 1
                });
            }
        });

        if (questions.length === 0) {
            this.showToast('Debes agregar al menos una pregunta', 'error');
            return;
        }

        const questionnaireData = {
            title,
            description,
            category,
            instructions,
            status,
            questions,
            createdAt: new Date().toISOString().split('T')[0]
        };

        if (this.currentQuestionnaire) {
            // Update existing
            const index = this.questionnaires.findIndex(q => q.id === this.currentQuestionnaire.id);
            if (index !== -1) {
                this.questionnaires[index] = { ...this.questionnaires[index], ...questionnaireData };
            }
        } else {
            // Create new
            questionnaireData.id = Date.now();
            this.questionnaires.push(questionnaireData);
        }

        this.saveQuestionnaires();
        this.showEditor();
        this.showToast('Cuestionario guardado exitosamente', 'success');
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
    QuestionnaireEditorModule.init();
});
