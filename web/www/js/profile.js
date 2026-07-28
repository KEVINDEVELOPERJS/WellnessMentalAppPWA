// Profile Module
class ProfileModule {
    constructor() {
        this.user = null;
        this.stats = {
            daysActive: 0,
            exercisesCompleted: 0,
            chatsCount: 0,
            evaluationsCount: 0
        };
        this.notifications = {
            evaluations: true,
            exercises: true,
            chat: true,
            reports: true,
            hour: 9,
            minute: 0
        };
        this.parentCode = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadStats();
        this.loadNotifications();
        this.loadParentCode();
        this.setupEventListeners();
        this.render();
    }

    loadUserData() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
        } else {
            this.user = { name: 'Usuario', email: 'usuario@email.com', role: 'estudiante' };
        }
    }

    loadStats() {
        const storedStats = localStorage.getItem('user_stats');
        if (storedStats) {
            this.stats = JSON.parse(storedStats);
        }
    }

    saveStats() {
        localStorage.setItem('user_stats', JSON.stringify(this.stats));
    }

    loadNotifications() {
        const storedNotif = localStorage.getItem('user_notifications');
        if (storedNotif) {
            this.notifications = JSON.parse(storedNotif);
        }
    }

    saveNotifications() {
        localStorage.setItem('user_notifications', JSON.stringify(this.notifications));
    }

    loadParentCode() {
        const storedCode = localStorage.getItem('parent_code');
        if (storedCode) {
            this.parentCode = JSON.parse(storedCode);
            // Check if code is expired (24 hours)
            const codeDate = new Date(this.parentCode.date);
            const now = new Date();
            const hoursDiff = (now - codeDate) / (1000 * 60 * 60);
            if (hoursDiff > 24) {
                this.parentCode = null;
                localStorage.removeItem('parent_code');
            }
        }
    }

    setupEventListeners() {
        // Back to dashboard
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Avatar upload
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        const avatarUpload = document.getElementById('avatar-upload');
        
        if (editAvatarBtn && avatarUpload) {
            editAvatarBtn.addEventListener('click', () => {
                avatarUpload.click();
            });
            
            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // Notification toggles
        document.getElementById('notif-evaluations').addEventListener('change', (e) => {
            this.notifications.evaluations = e.target.checked;
            this.saveNotifications();
        });

        document.getElementById('notif-exercises').addEventListener('change', (e) => {
            this.notifications.exercises = e.target.checked;
            this.saveNotifications();
        });

        document.getElementById('notif-chat').addEventListener('change', (e) => {
            this.notifications.chat = e.target.checked;
            this.saveNotifications();
        });

        document.getElementById('notif-reports').addEventListener('change', (e) => {
            this.notifications.reports = e.target.checked;
            this.saveNotifications();
        });

        // Time picker
        document.getElementById('notif-time-btn').addEventListener('click', () => {
            this.openTimePicker();
        });

        // Change password
        document.getElementById('change-password-btn').addEventListener('click', () => {
            this.openChangePasswordModal();
        });

        // 2FA
        document.getElementById('enable-2fa-btn').addEventListener('click', () => {
            this.generate2FACode();
        });

        // Download data
        document.getElementById('download-data-btn').addEventListener('click', () => {
            this.downloadUserData();
        });

        // Parent code
        document.getElementById('generate-parent-code-btn').addEventListener('click', () => {
            this.generateParentCode();
        });

        document.getElementById('revoke-parent-btn').addEventListener('click', () => {
            this.revokeParentAccess();
        });

        // Logout all
        document.getElementById('logout-all-btn').addEventListener('click', () => {
            this.logoutAll();
        });

        // Modal close buttons
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Change password form
        document.getElementById('change-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Time picker sliders
        document.getElementById('hour-slider').addEventListener('input', (e) => {
            this.updateTimeDisplay();
        });

        document.getElementById('minute-slider').addEventListener('input', (e) => {
            this.updateTimeDisplay();
        });

        // Save time
        document.querySelector('.save-time-btn').addEventListener('click', () => {
            this.saveNotificationTime();
        });

        // Close 2FA modal
        document.querySelector('.close-modal-btn').addEventListener('click', () => {
            this.closeAllModals();
        });
    }

    render() {
        // User info
        document.getElementById('user-initials').textContent = this.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('user-name').textContent = this.user.name;
        document.getElementById('user-role').textContent = this.user.role === 'estudiante' ? 'Estudiante' : 'Psicólogo';
        
        // Load saved avatar
        this.loadAvatar();

        // Stats
        document.getElementById('stat-days').textContent = this.stats.daysActive;
        document.getElementById('stat-exercises').textContent = this.stats.exercisesCompleted;
        document.getElementById('stat-chats').textContent = this.stats.chatsCount;
        document.getElementById('stat-evaluations').textContent = this.stats.evaluationsCount;

        // Level and points (from games module)
        const gamificationStats = JSON.parse(localStorage.getItem('user_gamification_stats')) || {
            level: 'Principiante',
            points: 0,
            progress: 0
        };
        document.getElementById('profile-level').textContent = gamificationStats.level;
        document.getElementById('profile-points').textContent = `${gamificationStats.points} puntos`;
        document.getElementById('profile-progress-fill').style.width = `${gamificationStats.progress}%`;

        // Notifications
        document.getElementById('notif-evaluations').checked = this.notifications.evaluations;
        document.getElementById('notif-exercises').checked = this.notifications.exercises;
        document.getElementById('notif-chat').checked = this.notifications.chat;
        document.getElementById('notif-reports').checked = this.notifications.reports;
        this.updateTimeButton();

        // Parent code
        if (this.parentCode) {
            document.getElementById('parent-code-status').textContent = `Código activo: ${this.parentCode.code}`;
        } else {
            document.getElementById('parent-code-status').textContent = 'Sin código activo';
        }
    }

    updateTimeButton() {
        const hour = this.notifications.hour;
        const minute = this.notifications.minute;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        document.getElementById('notif-time-btn').textContent = 
            `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    openTimePicker() {
        document.getElementById('hour-slider').value = this.notifications.hour;
        document.getElementById('minute-slider').value = this.notifications.minute;
        this.updateTimeDisplay();
        document.getElementById('time-picker-modal').classList.remove('hidden');
    }

    updateTimeDisplay() {
        const hour = parseInt(document.getElementById('hour-slider').value);
        const minute = parseInt(document.getElementById('minute-slider').value);
        document.getElementById('time-display').textContent = 
            `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    saveNotificationTime() {
        this.notifications.hour = parseInt(document.getElementById('hour-slider').value);
        this.notifications.minute = parseInt(document.getElementById('minute-slider').value);
        this.saveNotifications();
        this.updateTimeButton();
        this.closeAllModals();
        showToast('Hora de notificación actualizada');
    }

    openChangePasswordModal() {
        document.getElementById('change-password-modal').classList.remove('hidden');
    }

    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;

        // In a real app, this would validate with a backend
        if (newPassword.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Simulate password change
        localStorage.setItem('user_password', newPassword);
        this.closeAllModals();
        document.getElementById('change-password-form').reset();
        showToast('Contraseña actualizada exitosamente');
    }

    generate2FACode() {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        document.getElementById('2fa-code').textContent = code;
        document.getElementById('2fa-modal').classList.remove('hidden');
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            showToast('Código copiado al portapapeles');
        }).catch(() => {
            showToast('Código generado');
        });
    }

    downloadUserData() {
        const userData = {
            profile: this.user,
            stats: this.stats,
            notifications: this.notifications,
            gamification: JSON.parse(localStorage.getItem('user_gamification_stats') || '{}'),
            achievements: JSON.parse(localStorage.getItem('user_achievements') || '[]')
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `wellness_mental_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showToast('Datos descargados exitosamente');
    }

    generateParentCode() {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        this.parentCode = {
            code: code,
            date: new Date().toISOString()
        };
        localStorage.setItem('parent_code', JSON.stringify(this.parentCode));
        this.render();
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            showToast('Código copiado al portapapeles');
        }).catch(() => {
            showToast('Código generado: ' + code);
        });
    }

    revokeParentAccess() {
        if (confirm('¿Estás seguro de que quieres revocar el acceso de tus padres?')) {
            this.parentCode = null;
            localStorage.removeItem('parent_code');
            this.render();
            showToast('Acceso de padres revocado');
        }
    }

    logoutAll() {
        if (confirm('¿Estás seguro de que quieres cerrar todas las sesiones?')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    incrementStat(statName) {
        this.stats[statName]++;
        this.saveStats();
        this.render();
    }
    
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Por favor selecciona una imagen válida');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('La imagen no debe superar 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Save to localStorage
            localStorage.setItem('user_avatar', imageData);
            
            // Update UI
            this.loadAvatar();
            
            showToast('Foto de perfil actualizada', 'success');
        };
        reader.onerror = () => {
            showToast('Error al cargar la imagen', 'error');
        };
        reader.readAsDataURL(file);
    }
    
    loadAvatar() {
        const savedAvatar = localStorage.getItem('user_avatar');
        const avatarContainer = document.getElementById('user-avatar-container');
        const initials = document.getElementById('user-initials');
        
        if (savedAvatar && avatarContainer) {
            avatarContainer.style.backgroundImage = `url(${savedAvatar})`;
            avatarContainer.style.backgroundSize = 'cover';
            avatarContainer.style.backgroundPosition = 'center';
            initials.style.display = 'none';
        } else if (avatarContainer && initials) {
            avatarContainer.style.backgroundImage = 'none';
            initials.style.display = 'block';
        }
    }
}

// Initialize profile module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profile-screen')) {
        window.profileModule = new ProfileModule();
    }
});
