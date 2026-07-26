// Ritmo Calma - Breathing Rhythm Game
const RitmoCalmaModule = {
    angle: 0,
    speed: 2.8,
    combo: 0,
    maxCombo: 0,
    score: 0,
    perfectHits: 0,
    timeLeft: 90,
    isPlaying: false,
    animationId: null,
    timerInterval: null,
    lastResult: null,
    radius: 120,
    pulseScale: 1,
    feedbackAlpha: 0,
    feedbackText: '',
    fx: GameFxEngine,
    audioContext: null,
    
    init() {
        this.setupEventListeners();
        this.renderInitialBoard();
        this.createFxContainer();
        this.initAudio();
    },

    createFxContainer() {
        if (!document.getElementById('fx-container')) {
            const container = document.createElement('div');
            container.id = 'fx-container';
            container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000; overflow: hidden;';
            document.body.appendChild(container);
        }
    },

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    },
    
    setupEventListeners() {
        const backBtn = document.getElementById('back-to-games');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.stopGame();
                window.location.href = 'games.html';
            });
        }
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // Tap on game board
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.addEventListener('click', () => this.handleTap());
        }
        
        // Modal controls
        const modalClose = document.querySelector('#game-complete-modal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideCompleteModal());
        }
        
        const closeModalBtn = document.querySelector('#game-complete-modal .close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideCompleteModal());
        }
        
        const restartModalBtn = document.querySelector('#game-complete-modal .restart-modal-btn');
        if (restartModalBtn) {
            restartModalBtn.addEventListener('click', () => {
                this.hideCompleteModal();
                this.restartGame();
            });
        }
    },
    
    renderInitialBoard() {
        this.updateIndicatorPosition();
    },
    
    startGame() {
        this.isPlaying = true;
        this.angle = 0;
        this.speed = 2.8;
        this.combo = 0;
        this.maxCombo = 0;
        this.score = 0;
        this.perfectHits = 0;
        this.timeLeft = 90;
        this.lastResult = null;
        this.pulseScale = 1;
        this.feedbackAlpha = 0;
        
        this.fx.init();
        this.playStartTone();
        this.updateStats();
        this.startAnimation();
        this.startTimer();
        
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('restart-btn').classList.remove('hidden');
    },
    
    restartGame() {
        this.stopGame();
        this.startGame();
    },
    
    stopGame() {
        this.isPlaying = false;
        this.fx.stop();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    startAnimation() {
        const animate = () => {
            if (!this.isPlaying) return;
            
            this.angle += this.speed;
            if (this.angle >= 360) this.angle = 0;
            
            this.updateIndicatorPosition();
            this.updatePulseAnimation();
            this.updateFeedback();
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    },

    updatePulseAnimation() {
        // Decay del pulso
        if (this.pulseScale > 1) {
            this.pulseScale -= 0.006;
            if (this.pulseScale < 1) this.pulseScale = 1;
        }
        
        // Aplicar escala al orbe central
        const centerCircle = document.querySelector('.center-circle');
        if (centerCircle) {
            centerCircle.style.transform = `scale(${this.pulseScale})`;
        }
    },

    updateFeedback() {
        const feedbackText = document.getElementById('feedback-text');
        if (!feedbackText) return;
        
        if (this.feedbackAlpha > 0) {
            feedbackText.style.opacity = this.feedbackAlpha;
            feedbackText.textContent = this.feedbackText;
            
            // Color según resultado
            const colors = {
                'PERFECT': '#4CAF50',
                'GOOD': '#2196F3',
                'MISS': '#F44336'
            };
            feedbackText.style.color = colors[this.lastResult] || '#4CAF50';
            
            this.feedbackAlpha -= 0.02;
            if (this.feedbackAlpha < 0) this.feedbackAlpha = 0;
        } else {
            feedbackText.style.opacity = 0;
        }
    },
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateStats();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },
    
    updateIndicatorPosition() {
        const indicator = document.getElementById('indicator');
        if (!indicator) return;
        
        const board = document.getElementById('game-board');
        const boardSize = board ? board.offsetWidth : 300;
        const centerX = boardSize / 2;
        const centerY = boardSize / 2;
        const radius = (boardSize / 2) - 20;
        
        const angleRad = (this.angle - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        
        indicator.style.left = `${x - 10}px`;
        indicator.style.top = `${y - 10}px`;
    },
    
    handleTap() {
        if (!this.isPlaying) return;
        
        const result = this.checkTap();
        this.processResult(result);
    },
    
    checkTap() {
        const targetAngle = 0; // Top position (0 degrees)
        const tolerance = 30; // Degrees tolerance
        
        const angleDiff = Math.abs(this.angle - targetAngle);
        const wrappedDiff = Math.min(angleDiff, 360 - angleDiff);
        
        if (wrappedDiff <= tolerance / 2) {
            return 'PERFECT';
        } else if (wrappedDiff <= tolerance) {
            return 'GOOD';
        } else {
            return 'MISS';
        }
    },
    
    processResult(result) {
        this.lastResult = result;
        
        const multiplier = this.getComboMultiplier(this.combo);
        
        switch (result) {
            case 'PERFECT':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.perfectHits++;
                this.score += 15 * multiplier;
                this.feedbackText = this.combo >= 10 ? '🔥 INCREÍBLE x' + multiplier : '¡PERFECTO! x' + multiplier;
                this.feedbackAlpha = 1;
                this.pulseScale = 1.12;
                this.playTone('PERFECT');
                
                // Efectos visuales
                if (this.combo >= 5) {
                    this.fx.triggerFlash('#4CAF50', 0.2);
                }
                
                // Acelerar cada 8 perfect hits
                if (this.perfectHits % 8 === 0) {
                    this.accelerate();
                }
                break;
            case 'GOOD':
                this.combo = Math.max(0, this.combo - 1);
                this.score += 8;
                this.feedbackText = 'Bien';
                this.feedbackAlpha = 1;
                this.playTone('GOOD');
                break;
            case 'MISS':
                this.combo = 0;
                this.score = Math.max(0, this.score - 5);
                this.feedbackText = 'Fallaste';
                this.feedbackAlpha = 1;
                this.playTone('MISS');
                this.fx.triggerShake(8);
                this.fx.triggerFlash('#F44336', 0.3);
                break;
        }
        
        this.updateStats();
    },

    getComboMultiplier(combo) {
        if (combo >= 20) return 5;
        if (combo >= 15) return 4;
        if (combo >= 10) return 3;
        if (combo >= 5) return 2;
        return 1;
    },

    accelerate() {
        this.speed = Math.min(this.speed + 0.35, 6.5);
    },
    
    playStartTone() {
        this.playTone(440, 0.5); // A4 - tono de inicio
    },

    playTone(result) {
        if (!this.audioContext) return;
        
        let frequency;
        let duration;
        
        switch (result) {
            case 'PERFECT':
                frequency = this.getPerfectTone();
                duration = 0.3;
                break;
            case 'GOOD':
                frequency = 392; // G4
                duration = 0.2;
                break;
            case 'MISS':
                frequency = 261.63; // C4
                duration = 0.15;
                break;
            default:
                return;
        }
        
        this.playTone(frequency, duration);
    },

    getPerfectTone() {
        if (this.combo >= 15) return 880; // A5
        if (this.combo >= 10) return 783.99; // G5
        if (this.combo >= 5) return 659.25; // E5
        return 523.25; // C5
    },

    playTone(frequency, duration) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            // Envelope ADSR
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.1); // Attack
            gainNode.gain.linearRampToValueAtTime(0.2, now + duration * 0.3); // Decay
            gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (e) {
            console.log('Error playing tone:', e);
        }
    },
    
    updateStats() {
        const scoreEl = document.getElementById('score');
        const comboEl = document.getElementById('combo');
        const timerEl = document.getElementById('timer');
        
        if (scoreEl) scoreEl.textContent = Math.floor(this.score);
        if (comboEl) comboEl.textContent = this.combo;
        if (timerEl) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    
    endGame() {
        this.isPlaying = false;
        
        // Calculate points
        const points = Math.floor(this.score / 10) + 50;
        
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-combo').textContent = this.maxCombo;
        document.getElementById('final-perfect').textContent = this.perfectHits;
        document.getElementById('final-points').textContent = `+${points}`;
        
        this.addPoints(points);
        
        setTimeout(() => this.showCompleteModal(), 500);
    },
    
    showCompleteModal() {
        document.getElementById('game-complete-modal').classList.remove('hidden');
    },
    
    hideCompleteModal() {
        document.getElementById('game-complete-modal').classList.add('hidden');
    },
    
    addPoints(amount) {
        const current = parseInt(localStorage.getItem('userPoints') || '0');
        localStorage.setItem('userPoints', current + amount);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    RitmoCalmaModule.init();
});
