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
    
    init() {
        this.setupEventListeners();
        this.renderInitialBoard();
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
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
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
        
        switch (result) {
            case 'PERFECT':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.perfectHits++;
                this.score += 15 * (1 + this.combo * 0.1);
                this.showFeedback('¡Perfecto!', '#4CAF50');
                break;
            case 'GOOD':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.score += 10 * (1 + this.combo * 0.05);
                this.showFeedback('¡Bien!', '#FFC107');
                break;
            case 'MISS':
                this.combo = 0;
                this.score = Math.max(0, this.score - 5);
                this.showFeedback('Falló', '#F44336');
                break;
        }
        
        this.updateStats();
    },
    
    showFeedback(text, color) {
        const feedbackText = document.getElementById('feedback-text');
        if (feedbackText) {
            feedbackText.textContent = text;
            feedbackText.style.color = color;
            feedbackText.classList.add('show');
            
            setTimeout(() => {
                feedbackText.classList.remove('show');
            }, 500);
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
