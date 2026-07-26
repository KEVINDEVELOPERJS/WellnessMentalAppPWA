// App State
const AppState = {
    currentUser: null,
    token: null,
    db: null
};

// Database Configuration
const DB_CONFIG = {
    name: 'wellness_mental',
    version: 1,
    tables: {
        users: 'users',
        questionnaires: 'questionnaires',
        questions: 'questions',
        responses: 'responses',
        results: 'results',
        chatSessions: 'chat_sessions',
        chatMessages: 'chat_messages',
        alerts: 'alerts',
        exercises: 'exercises',
        progress: 'progress',
        points: 'points',
        achievements: 'achievements',
        userAchievements: 'user_achievements',
        garden: 'garden',
        checkIn: 'check_in',
        community: 'community',
        activeBreaks: 'active_breaks'
    }
};

// Utility Functions
const Utils = {
    // Show/hide loading overlay
    showLoading: () => {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },
    
    hideLoading: () => {
        document.getElementById('loading-overlay').classList.add('hidden');
    },
    
    // Show toast notification
    showToast: (message, type = 'info') => {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toast.className = 'toast';
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },
    
    // Screen navigation
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },
    
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Get current timestamp
    now: () => {
        return new Date().toISOString();
    },
    
    // Validate email
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validate password
    isValidPassword: (password) => {
        // Min 8 chars, 1 uppercase, 1 number, 1 special char
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return re.test(password);
    },
    
    // Hash password (simple implementation - in production use bcrypt)
    hashPassword: async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // Verify password
    verifyPassword: async (password, hash) => {
        const passwordHash = await Utils.hashPassword(password);
        return passwordHash === hash;
    },
    
    // Generate JWT-like token
    generateToken: (userId, email, role) => {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId,
            email,
            role,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }));
        const signature = btoa(`${header}.${payload}.secret`);
        return `${header}.${payload}.${signature}`;
    },
    
    // Decode token
    decodeToken: (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (e) {
            return null;
        }
    },
    
    // Check if token is valid
    isTokenValid: (token) => {
        const payload = Utils.decodeToken(token);
        if (!payload) return false;
        return payload.exp > Date.now();
    }
};

// Database Manager
class DatabaseManager {
    constructor() {
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Users table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.users)) {
                    const userStore = db.createObjectStore(DB_CONFIG.tables.users, { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('email', 'email', { unique: true });
                }
                
                // Questionnaires table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.questionnaires)) {
                    db.createObjectStore(DB_CONFIG.tables.questionnaires, { keyPath: 'id', autoIncrement: true });
                }
                
                // Questions table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.questions)) {
                    const questionStore = db.createObjectStore(DB_CONFIG.tables.questions, { keyPath: 'id', autoIncrement: true });
                    questionStore.createIndex('questionnaireId', 'questionnaireId');
                }
                
                // Responses table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.responses)) {
                    const responseStore = db.createObjectStore(DB_CONFIG.tables.responses, { keyPath: 'id', autoIncrement: true });
                    responseStore.createIndex('userId', 'userId');
                    responseStore.createIndex('questionnaireId', 'questionnaireId');
                }
                
                // Results table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.results)) {
                    const resultStore = db.createObjectStore(DB_CONFIG.tables.results, { keyPath: 'id', autoIncrement: true });
                    resultStore.createIndex('userId', 'userId');
                }
                
                // Chat sessions table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.chatSessions)) {
                    const chatStore = db.createObjectStore(DB_CONFIG.tables.chatSessions, { keyPath: 'id', autoIncrement: true });
                    chatStore.createIndex('userId', 'userId');
                }
                
                // Chat messages table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.chatMessages)) {
                    const messageStore = db.createObjectStore(DB_CONFIG.tables.chatMessages, { keyPath: 'id', autoIncrement: true });
                    messageStore.createIndex('chatId', 'chatId');
                }
                
                // Alerts table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.alerts)) {
                    const alertStore = db.createObjectStore(DB_CONFIG.tables.alerts, { keyPath: 'id', autoIncrement: true });
                    alertStore.createIndex('userId', 'userId');
                    alertStore.createIndex('psychologistId', 'psychologistId');
                }
                
                // Exercises table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.exercises)) {
                    db.createObjectStore(DB_CONFIG.tables.exercises, { keyPath: 'id', autoIncrement: true });
                }
                
                // Progress table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.progress)) {
                    const progressStore = db.createObjectStore(DB_CONFIG.tables.progress, { keyPath: 'id', autoIncrement: true });
                    progressStore.createIndex('userId', 'userId');
                }
                
                // Points table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.points)) {
                    const pointsStore = db.createObjectStore(DB_CONFIG.tables.points, { keyPath: 'userId' });
                }
                
                // Achievements table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.achievements)) {
                    db.createObjectStore(DB_CONFIG.tables.achievements, { keyPath: 'id', autoIncrement: true });
                }
                
                // User achievements table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.userAchievements)) {
                    const userAchievementStore = db.createObjectStore(DB_CONFIG.tables.userAchievements, { keyPath: 'id', autoIncrement: true });
                    userAchievementStore.createIndex('userId', 'userId');
                }
                
                // Garden table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.garden)) {
                    const gardenStore = db.createObjectStore(DB_CONFIG.tables.garden, { keyPath: 'id', autoIncrement: true });
                    gardenStore.createIndex('userId', 'userId');
                }
                
                // Check-in table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.checkIn)) {
                    const checkInStore = db.createObjectStore(DB_CONFIG.tables.checkIn, { keyPath: 'id', autoIncrement: true });
                    checkInStore.createIndex('userId', 'userId');
                    checkInStore.createIndex('date', 'date');
                }
                
                // Community table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.community)) {
                    const communityStore = db.createObjectStore(DB_CONFIG.tables.community, { keyPath: 'id', autoIncrement: true });
                    communityStore.createIndex('userId', 'userId');
                }
                
                // Active breaks table
                if (!db.objectStoreNames.contains(DB_CONFIG.tables.activeBreaks)) {
                    const breakStore = db.createObjectStore(DB_CONFIG.tables.activeBreaks, { keyPath: 'id', autoIncrement: true });
                    breakStore.createIndex('userId', 'userId');
                }
            };
        });
    }
    
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Auth Controller
class AuthController {
    constructor(dbManager) {
        this.db = dbManager;
    }
    
    async register(userData) {
        try {
            // Validate input
            if (!userData.name || userData.name.length < 2) {
                return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
            }
            
            if (!Utils.isValidEmail(userData.email)) {
                return { success: false, error: 'El correo electrónico no es válido' };
            }
            
            if (!Utils.isValidPassword(userData.password)) {
                return { success: false, error: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo' };
            }
            
            if (userData.age < 13 || userData.age > 100) {
                return { success: false, error: 'La edad debe estar entre 13 y 100 años' };
            }
            
            if (userData.role === 'estudiante' && !userData.grade) {
                return { success: false, error: 'El grado escolar es obligatorio para estudiantes' };
            }
            
            // Check if email already exists
            const existingUsers = await this.db.getByIndex(DB_CONFIG.tables.users, 'email', userData.email);
            if (existingUsers.length > 0) {
                return { success: false, error: 'Este correo ya está registrado' };
            }
            
            // Hash password
            const passwordHash = await Utils.hashPassword(userData.password);
            
            // Create user
            const user = {
                name: userData.name,
                email: userData.email.toLowerCase(),
                passwordHash,
                age: userData.age,
                grade: userData.grade || 'N/A',
                role: userData.role,
                createdAt: Utils.now(),
                consentimientoPadres: userData.age >= 16 || userData.role === 'psicologo',
                estado: 'activo'
            };
            
            const userId = await this.db.add(DB_CONFIG.tables.users, user);
            
            // Initialize points
            await this.db.add(DB_CONFIG.tables.points, {
                userId,
                puntosTotales: 0,
                nivel: 1,
                xpNivelActual: 0,
                fechaActualizacion: Utils.now()
            });
            
            return { success: true, user: { ...user, id: userId } };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Error al registrar usuario' };
        }
    }
    
    async login(email, password) {
        try {
            const users = await this.db.getByIndex(DB_CONFIG.tables.users, 'email', email.toLowerCase());
            
            if (users.length === 0) {
                return { success: false, error: 'Correo o contraseña incorrectos' };
            }
            
            const user = users[0];
            const isValid = await Utils.verifyPassword(password, user.passwordHash);
            
            if (!isValid) {
                return { success: false, error: 'Correo o contraseña incorrectos' };
            }
            
            if (user.estado !== 'activo') {
                return { success: false, error: 'La cuenta está inactiva' };
            }
            
            if (!user.consentimientoPadres && user.role === 'estudiante') {
                return { success: false, error: 'Se requiere consentimiento parental' };
            }
            
            // Generate token
            const token = Utils.generateToken(user.id, user.email, user.role);
            
            // Store session
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userRole', user.role);
            
            return { success: true, user, token };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error al iniciar sesión' };
        }
    }
    
    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        AppState.currentUser = null;
        AppState.token = null;
    }
    
    async getCurrentUser() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            return null;
        }
        
        if (!Utils.isTokenValid(token)) {
            await this.logout();
            return null;
        }
        
        try {
            const user = await this.db.get(DB_CONFIG.tables.users, parseInt(userId));
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
    
    async checkSession() {
        const user = await this.getCurrentUser();
        if (user) {
            AppState.currentUser = user;
            AppState.token = localStorage.getItem('token');
            return true;
        }
        return false;
    }
}

// Check-in System
const CheckInSystem = {
    selectedEmoji: null,
    selectedMood: null,

    init() {
        const checkInBtn = document.getElementById('check-in-btn');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', () => this.showCheckInModal());
        }

        const modalClose = document.querySelector('#check-in-modal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideCheckInModal());
        }

        const cancelBtn = document.querySelector('#check-in-modal .cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideCheckInModal());
        }

        const submitBtn = document.querySelector('#check-in-modal .submit-check-in');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitCheckIn());
        }

        // Emoji selection
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedEmoji = btn.dataset.emoji;
                this.selectedMood = btn.dataset.mood;
            });
        });
    },

    showCheckInModal() {
        // Check if already done today
        const today = new Date().toDateString();
        const lastCheckIn = localStorage.getItem('lastCheckIn');
        
        if (lastCheckIn === today) {
            const lastEmoji = localStorage.getItem('lastCheckInEmoji');
            Utils.showToast(`Ya completaste tu check-in hoy ${lastEmoji || '😊'}`);
            return;
        }

        document.getElementById('check-in-modal').classList.remove('hidden');
        this.selectedEmoji = null;
        this.selectedMood = null;
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('check-in-note').value = '';
    },

    hideCheckInModal() {
        document.getElementById('check-in-modal').classList.add('hidden');
    },

    async submitCheckIn() {
        if (!this.selectedEmoji || !this.selectedMood) {
            Utils.showToast('Por favor selecciona cómo te sientes');
            return;
        }

        const note = document.getElementById('check-in-note').value.trim();
        const userId = localStorage.getItem('userId');

        if (!userId) {
            Utils.showToast('Error: No hay sesión activa');
            return;
        }

        try {
            // Save check-in to database
            const checkInData = {
                userId: parseInt(userId),
                date: new Date().toDateString(),
                emoji: this.selectedEmoji,
                mood: this.selectedMood,
                note: note,
                timestamp: Utils.now()
            };

            await dbManager.add(DB_CONFIG.tables.checkIn, checkInData);

            // Store in localStorage for quick access
            const today = new Date().toDateString();
            localStorage.setItem('lastCheckIn', today);
            localStorage.setItem('lastCheckInEmoji', this.selectedEmoji);

            // Update dashboard
            this.updateCheckInStatus(this.selectedEmoji);

            // Award points
            await this.awardCheckInPoints();

            this.hideCheckInModal();
            Utils.showToast('¡Check-in registrado! +10 puntos', 'success');

        } catch (error) {
            console.error('Error submitting check-in:', error);
            Utils.showToast('Error al registrar check-in', 'error');
        }
    },

    updateCheckInStatus(emoji) {
        const status = document.getElementById('check-in-status');
        if (status) {
            status.textContent = `Hoy te sientes ${emoji}`;
        }
    },

    async awardCheckInPoints() {
        const userId = parseInt(localStorage.getItem('userId'));
        const pointsData = await dbManager.get(DB_CONFIG.tables.points, userId);
        
        if (pointsData) {
            pointsData.total += 10;
            pointsData.checkInStreak = (pointsData.checkInStreak || 0) + 1;
            pointsData.lastCheckIn = Utils.now();
            await dbManager.update(DB_CONFIG.tables.points, pointsData);
        } else {
            await dbManager.add(DB_CONFIG.tables.points, {
                userId: userId,
                total: 10,
                checkInStreak: 1,
                lastCheckIn: Utils.now()
            });
        }
    },

    async loadTodayCheckIn() {
        const today = new Date().toDateString();
        const lastCheckIn = localStorage.getItem('lastCheckIn');
        
        if (lastCheckIn === today) {
            const lastEmoji = localStorage.getItem('lastCheckInEmoji');
            this.updateCheckInStatus(lastEmoji || '😊');
        }
    }
};

// Initialize App
let dbManager;
let authController;

async function initApp() {
    try {
        // Initialize database
        dbManager = new DatabaseManager();
        await dbManager.init();
        
        // Initialize auth controller
        authController = new AuthController(dbManager);
        
        // Initialize check-in system
        CheckInSystem.init();
        
        // Check for existing session
        const hasSession = await authController.checkSession();
        
        if (hasSession) {
            await showDashboard();
        } else {
            Utils.showScreen('login-screen');
        }
        
        // Seed initial data if needed
        await seedInitialData();
        
    } catch (error) {
        console.error('App initialization error:', error);
        // Don't show error toast - just continue with login screen
        Utils.showScreen('login-screen');
    }
}

async function seedInitialData() {
    // Seed questionnaires
    const questionnaires = await dbManager.getAll(DB_CONFIG.tables.questionnaires);
    if (questionnaires.length === 0) {
        const gad7 = {
            id: 1,
            titulo: 'GAD-7',
            descripcion: 'Escala de Ansiedad Generalizada',
            instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?',
            categoria: 'ansiedad',
            tipo: 'GAD-7',
            estado: 'publicado'
        };
        
        const phq9 = {
            id: 2,
            titulo: 'PHQ-9',
            descripcion: 'Cuestionario de Salud del Paciente',
            instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?',
            categoria: 'depresion',
            tipo: 'PHQ-9',
            estado: 'publicado'
        };
        
        await dbManager.add(DB_CONFIG.tables.questionnaires, gad7);
        await dbManager.add(DB_CONFIG.tables.questionnaires, phq9);
        
        // Seed questions for GAD-7
        const gad7Questions = [
            'Sentirse nervioso/a, ansioso/a o con los nervios de punta',
            'No poder dejar de preocuparse o no poder controlar la preocupación',
            'Preocuparse demasiado por diferentes cosas',
            'Dificultad para relajarse',
            'Estar tan inquieto/a que le resulta difícil quedarse quieto/a',
            'Molestarse o irritarse con facilidad',
            'Sentir miedo como si algo terrible fuera a suceder'
        ];
        
        gad7Questions.forEach((texto, index) => {
            dbManager.add(DB_CONFIG.tables.questions, {
                questionnaireId: 1,
                texto,
                orden: index + 1,
                peso: 1.0,
                tipoRespuesta: 'likert_4'
            });
        });
        
        // Seed questions for PHQ-9
        const phq9Questions = [
            'Poco interés o placer en hacer las cosas',
            'Sentirse decaído/a, deprimido/a o sin esperanzas',
            'Dificultad para quedarse o permanecer dormido/a, o dormir demasiado',
            'Sentirse cansado/a o con poca energía',
            'Poco apetito o comer en exceso',
            'Sentirse mal consigo mismo/a o que es un fracaso',
            'Dificultad para concentrarse en cosas como leer o ver televisión',
            'Moverse o hablar tan lento que otros lo noten, o lo contrario: muy inquieto/a',
            'Pensamientos de que estaría mejor muerto/a o de hacerse daño'
        ];
        
        phq9Questions.forEach((texto, index) => {
            dbManager.add(DB_CONFIG.tables.questions, {
                questionnaireId: 2,
                texto,
                orden: index + 1,
                peso: 1.0,
                tipoRespuesta: 'likert_4'
            });
        });
        
        // Seed exercises
        const exercises = [
            {
                titulo: 'Respiración 4-7-8',
                descripcion: 'Inhala 4 segundos, mantén 7 y exhala 8. Ideal para calmar la ansiedad antes de dormir.',
                tipo: '4-7-8',
                duracionSeg: 300,
                dificultad: 'facil'
            },
            {
                titulo: 'Respiración en caja',
                descripcion: 'Inhala, mantén, exhala y mantén 4 segundos cada fase. Usada por atletas y militares.',
                tipo: 'caja',
                duracionSeg: 300,
                dificultad: 'media'
            },
            {
                titulo: 'Respiración coherente',
                descripcion: 'Inhala y exhala 5 segundos de forma rítmica. Equilibra el sistema nervioso.',
                tipo: 'coherente',
                duracionSeg: 300,
                dificultad: 'facil'
            }
        ];
        
        for (const exercise of exercises) {
            await dbManager.add(DB_CONFIG.tables.exercises, exercise);
        }
    }
}

async function showDashboard() {
    const user = AppState.currentUser;
    
    // Update dashboard UI
    document.getElementById('user-greeting').textContent = `Hola, ${user.name}`;
    document.getElementById('user-role-badge').textContent = user.role === 'psicologo' ? 'Psicólogo' : 'Estudiante';
    
    // Show alerts card for psychologists
    if (user.role === 'psicologo') {
        document.getElementById('alerts-card').classList.remove('hidden');
    }
    
    Utils.showScreen('dashboard-screen');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        Utils.showLoading();
        
        const result = await authController.login(email, password);
        
        Utils.hideLoading();
        
        if (result.success) {
            AppState.currentUser = result.user;
            AppState.token = result.token;
            Utils.showToast('Bienvenido de nuevo', 'success');
            await showDashboard();
        } else {
            Utils.showToast(result.error, 'error');
        }
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            age: parseInt(document.getElementById('register-age').value),
            role: document.getElementById('register-role').value,
            grade: document.getElementById('register-grade').value
        };
        
        Utils.showLoading();
        
        const result = await authController.register(userData);
        
        Utils.hideLoading();
        
        if (result.success) {
            Utils.showToast('Cuenta creada exitosamente', 'success');
            Utils.showScreen('login-screen');
        } else {
            Utils.showToast(result.error, 'error');
        }
    });
    
    // Navigation links
    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        Utils.showScreen('register-screen');
    });
    
    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        Utils.showScreen('login-screen');
    });
    
    // Role change handler
    document.getElementById('register-role').addEventListener('change', (e) => {
        const role = e.target.value;
        const gradeGroup = document.getElementById('grade-group');
        
        if (role === 'psicologo') {
            gradeGroup.classList.add('hidden');
        } else {
            gradeGroup.classList.remove('hidden');
        }
    });
    
    // Age change handler for tutor email
    document.getElementById('register-age').addEventListener('change', (e) => {
        const age = parseInt(e.target.value);
        const tutorGroup = document.getElementById('tutor-email-group');
        
        if (age < 16) {
            tutorGroup.classList.remove('hidden');
        } else {
            tutorGroup.classList.add('hidden');
        }
    });

    // Password visibility toggle for login
    document.getElementById('toggle-login-password').addEventListener('click', () => {
        const passwordInput = document.getElementById('login-password');
        const toggleBtn = document.getElementById('toggle-login-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Password visibility toggle for register
    document.getElementById('toggle-register-password').addEventListener('click', () => {
        const passwordInput = document.getElementById('register-password');
        const toggleBtn = document.getElementById('toggle-register-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    });

    // Password requirements validation
    document.getElementById('register-password').addEventListener('input', (e) => {
        const password = e.target.value;
        
        // Check each requirement
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        
        // Update requirement indicators
        updateRequirement('req-length', hasLength);
        updateRequirement('req-uppercase', hasUppercase);
        updateRequirement('req-number', hasNumber);
        updateRequirement('req-special', hasSpecial);
    });

    function updateRequirement(id, isValid) {
        const element = document.getElementById(id);
        element.classList.remove('valid', 'invalid');
        element.classList.add(isValid ? 'valid' : 'invalid');
    }
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await authController.logout();
        Utils.showScreen('login-screen');
        Utils.showToast('Sesión cerrada', 'success');
    });
    
    // Dashboard card buttons
    document.getElementById('evaluation-btn').addEventListener('click', () => {
        window.location.href = 'evaluation.html';
    });
    
    document.getElementById('chat-btn').addEventListener('click', () => {
        window.location.href = 'chat.html';
    });
    
    document.getElementById('exercises-btn').addEventListener('click', () => {
        window.location.href = 'exercises.html';
    });
    
    document.getElementById('games-btn').addEventListener('click', () => {
        window.location.href = 'games.html';
    });
    
    document.getElementById('videos-btn').addEventListener('click', () => {
        window.location.href = 'videos.html';
    });
    
    document.getElementById('active-breaks-btn').addEventListener('click', () => {
        window.location.href = 'active-breaks.html';
    });
    
    document.getElementById('mental-garden-btn').addEventListener('click', () => {
        window.location.href = 'mental-garden.html';
    });
    
    document.getElementById('parent-reports-btn').addEventListener('click', () => {
        window.location.href = 'parent-reports.html';
    });
    
    document.getElementById('community-btn').addEventListener('click', () => {
        window.location.href = 'community.html';
    });
    
    document.getElementById('alerts-btn').addEventListener('click', () => {
        window.location.href = 'alerts.html';
    });
    
    document.getElementById('profile-btn').addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
});
