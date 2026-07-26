// Puzzle Zen - Memory Pattern Game (Simon Says style)
const PuzzleZenModule = {
    colors: ['#9C27B0', '#4CAF50', '#2196F3', '#FFC107'],
    sequence: [],
    userSequence: [],
    level: 1,
    isPlaying: false,
    isShowingSequence: false,
    activeCircle: -1,
    
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
        
        // Circle click listeners
        document.querySelectorAll('.circle').forEach(circle => {
            circle.addEventListener('click', () => {
                const index = parseInt(circle.dataset.index);
                this.handleCircleClick(index);
            });
        });
        
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
        document.querySelectorAll('.circle').forEach((circle, index) => {
            circle.style.background = this.colors[index];
            circle.style.opacity = '0.6';
        });
    },
    
    startGame() {
        this.isPlaying = true;
        this.level = 1;
        this.sequence = [];
        this.userSequence = [];
        this.updateStats();
        this.addStepAndShow();
        
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('restart-btn').classList.remove('hidden');
    },
    
    restartGame() {
        this.stopGame();
        this.startGame();
    },
    
    stopGame() {
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.activeCircle = -1;
        this.renderInitialBoard();
    },
    
    addStepAndShow() {
        if (!this.isPlaying) return;
        
        // Add random step
        this.sequence.push(Math.floor(Math.random() * 4));
        this.userSequence = [];
        
        // Animate level up
        this.animateLevelUp();
        
        // Show sequence
        this.showSequence();
        
        this.updateStatus(`Memoriza el patrón nivel ${this.level}`);
    },
    
    animateLevelUp() {
        const levelDisplay = document.getElementById('level-display');
        levelDisplay.style.transform = 'scale(1.5)';
        levelDisplay.style.transition = 'transform 0.3s ease-out';
        
        setTimeout(() => {
            levelDisplay.style.transform = 'scale(1)';
        }, 300);
    },
    
    async showSequence() {
        this.isShowingSequence = true;
        
        for (let i = 0; i < this.sequence.length; i++) {
            if (!this.isPlaying) return;
            await this.flashCircle(this.sequence[i]);
            await this.delay(180);
        }
        
        this.isShowingSequence = false;
        this.activeCircle = -1;
        this.updateStatus('¡Tu turno! Repite el patrón');
    },
    
    async flashCircle(index) {
        const circle = document.querySelector(`.circle-${index}`);
        this.activeCircle = index;
        
        circle.style.opacity = '1';
        circle.style.transform = 'scale(1.35)';
        circle.style.boxShadow = `0 0 30px ${this.colors[index]}, 0 0 60px ${this.colors[index]}`;
        circle.style.transition = 'all 0.2s ease-out';
        
        await this.delay(450);
        
        circle.style.opacity = this.isShowingSequence ? '0.4' : '0.6';
        circle.style.transform = 'scale(1)';
        circle.style.boxShadow = 'none';
        
        this.activeCircle = -1;
    },
    
    handleCircleClick(index) {
        if (!this.isPlaying || this.isShowingSequence) return;
        
        this.flashCircle(index);
        this.userSequence.push(index);
        
        const position = this.userSequence.length - 1;
        
        // Check if correct
        if (this.userSequence[position] !== this.sequence[position]) {
            this.updateStatus(`¡Casi! Nivel alcanzado: ${this.level}`);
            setTimeout(() => this.endGame(), 600);
            return;
        }
        
        // Check if sequence complete
        if (this.userSequence.length === this.sequence.length) {
            this.level++;
            this.updateStats();
            this.updateStatus('¡Perfecto! Siguiente nivel...');
            setTimeout(() => this.addStepAndShow(), 800);
        }
    },
    
    updateStats() {
        const levelEl = document.getElementById('level');
        const levelDisplay = document.getElementById('level-display');
        
        if (levelEl) levelEl.textContent = this.level;
        if (levelDisplay) levelDisplay.textContent = `Nivel ${this.level}`;
    },
    
    updateStatus(message) {
        const status = document.getElementById('game-status');
        if (status) status.textContent = message;
    },
    
    endGame() {
        this.isPlaying = false;
        
        // Calculate points
        const points = this.level * 10 + 50;
        
        document.getElementById('final-level').textContent = this.level - 1;
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
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PuzzleZenModule.init();
});
