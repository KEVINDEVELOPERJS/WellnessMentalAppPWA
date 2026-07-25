// Active Breaks Configuration Module
const ActiveBreaksModule = {
    config: {
        enabled: false,
        startHour: 8,
        startMinute: 0,
        endHour: 20,
        endMinute: 0,
        frequency: 2,
        breakTypes: {
            breathing: true,
            stretching: true,
            walking: false,
            meditation: false
        }
    },

    currentTimePickerTarget: null,

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.updateUI();
    },

    loadConfig() {
        const saved = localStorage.getItem('activeBreaksConfig');
        if (saved) {
            this.config = JSON.parse(saved);
        }
    },

    saveConfig() {
        localStorage.setItem('activeBreaksConfig', JSON.stringify(this.config));
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const toggle = document.getElementById('active-breaks-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.config.enabled = e.target.checked;
            });
        }

        const startTimeBtn = document.getElementById('start-time-btn');
        if (startTimeBtn) {
            startTimeBtn.addEventListener('click', () => {
                this.currentTimePickerTarget = 'start';
                this.openTimePicker(this.config.startHour, this.config.startMinute);
            });
        }

        const endTimeBtn = document.getElementById('end-time-btn');
        if (endTimeBtn) {
            endTimeBtn.addEventListener('click', () => {
                this.currentTimePickerTarget = 'end';
                this.openTimePicker(this.config.endHour, this.config.endMinute);
            });
        }

        const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
        frequencyInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.config.frequency = parseInt(e.target.value);
            });
        });

        const breakTypeCheckboxes = document.querySelectorAll('.break-types input[type="checkbox"]');
        breakTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const type = e.target.id.replace('break-', '');
                this.config.breakTypes[type] = e.target.checked;
            });
        });

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.loadConfig();
                this.updateUI();
                window.location.href = 'index.html';
            });
        }

        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveConfiguration();
            });
        }

        // Time picker modal
        const modalClose = document.querySelector('#time-picker-modal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeTimePicker());
        }

        const modalCancel = document.querySelector('#time-picker-modal .cancel-btn');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.closeTimePicker());
        }

        const modalSave = document.querySelector('#time-picker-modal .save-time-btn');
        if (modalSave) {
            modalSave.addEventListener('click', () => this.saveTime());
        }

        const hourSlider = document.getElementById('hour-slider');
        const minuteSlider = document.getElementById('minute-slider');
        if (hourSlider && minuteSlider) {
            hourSlider.addEventListener('input', () => this.updateTimeDisplay());
            minuteSlider.addEventListener('input', () => this.updateTimeDisplay());
        }
    },

    updateUI() {
        const toggle = document.getElementById('active-breaks-toggle');
        if (toggle) {
            toggle.checked = this.config.enabled;
        }

        const startTimeBtn = document.getElementById('start-time-btn');
        if (startTimeBtn) {
            startTimeBtn.textContent = this.formatTime(this.config.startHour, this.config.startMinute);
        }

        const endTimeBtn = document.getElementById('end-time-btn');
        if (endTimeBtn) {
            endTimeBtn.textContent = this.formatTime(this.config.endHour, this.config.endMinute);
        }

        const frequencyInput = document.querySelector(`input[name="frequency"][value="${this.config.frequency}"]`);
        if (frequencyInput) {
            frequencyInput.checked = true;
        }

        document.getElementById('break-breathing').checked = this.config.breakTypes.breathing;
        document.getElementById('break-stretching').checked = this.config.breakTypes.stretching;
        document.getElementById('break-walking').checked = this.config.breakTypes.walking;
        document.getElementById('break-meditation').checked = this.config.breakTypes.meditation;
    },

    formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${period}`;
    },

    openTimePicker(hour, minute) {
        const modal = document.getElementById('time-picker-modal');
        const hourSlider = document.getElementById('hour-slider');
        const minuteSlider = document.getElementById('minute-slider');
        
        hourSlider.value = hour;
        minuteSlider.value = minute;
        this.updateTimeDisplay();
        
        modal.classList.remove('hidden');
    },

    closeTimePicker() {
        const modal = document.getElementById('time-picker-modal');
        modal.classList.add('hidden');
        this.currentTimePickerTarget = null;
    },

    updateTimeDisplay() {
        const hour = parseInt(document.getElementById('hour-slider').value);
        const minute = parseInt(document.getElementById('minute-slider').value);
        
        document.getElementById('hour-value').textContent = hour;
        document.getElementById('minute-value').textContent = minute.toString().padStart(2, '0');
        document.getElementById('time-display').textContent = 
            `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },

    saveTime() {
        const hour = parseInt(document.getElementById('hour-slider').value);
        const minute = parseInt(document.getElementById('minute-slider').value);

        if (this.currentTimePickerTarget === 'start') {
            this.config.startHour = hour;
            this.config.startMinute = minute;
            document.getElementById('start-time-btn').textContent = this.formatTime(hour, minute);
        } else if (this.currentTimePickerTarget === 'end') {
            this.config.endHour = hour;
            this.config.endMinute = minute;
            document.getElementById('end-time-btn').textContent = this.formatTime(hour, minute);
        }

        this.closeTimePicker();
    },

    saveConfiguration() {
        // Validate time range
        const startTotalMinutes = this.config.startHour * 60 + this.config.startMinute;
        const endTotalMinutes = this.config.endHour * 60 + this.config.endMinute;

        if (startTotalMinutes >= endTotalMinutes) {
            this.showToast('La hora de inicio debe ser anterior a la hora fin');
            return;
        }

        if (this.config.enabled && !this.checkNotificationPermission()) {
            this.requestNotificationPermission();
        }

        this.saveConfig();
        this.showToast('Configuración guardada correctamente');

        if (this.config.enabled) {
            this.scheduleNotifications();
        } else {
            this.clearNotifications();
        }

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    checkNotificationPermission() {
        return 'Notification' in window && Notification.permission === 'granted';
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    },

    scheduleNotifications() {
        // In a real implementation, this would use a service worker or backend
        // For now, we'll store the config and simulate notification scheduling
        console.log('Scheduling notifications:', this.config);
    },

    clearNotifications() {
        // Clear any scheduled notifications
        console.log('Clearing notifications');
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
    ActiveBreaksModule.init();
});
