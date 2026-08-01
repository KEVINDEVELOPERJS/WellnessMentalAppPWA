// Puzzle Zen - Memory Pattern Game (Simon Says style)
const PuzzleZenModule = {
    colors: ['#9C27B0', '#4CAF50', '#2196F3', '#FFC107'],
    sequence: [],
    userSequence: [],
    level: 1,
    isPlaying: false,
    isShowingSequence: false,
    activeCircle: -1,
    activeScale: 1,
    levelScale: 1,
    fx: GameFxEngine,
    
    init() {
        this.setupEventListeners();
        this.renderInitialBoard();
        this.createFxContainer();
    },

    createFxContainer() {
        if (!document.getElementById('fx-container')) {
            const container = document.createElement('div');
            container.id = 'fx-container';
            container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000; overflow: hidden;';
            document.body.appendChild(container);
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
            circle.style.transform = 'scale(1)';
            circle.style.boxShadow = 'none';
        });
        
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.style.transform = `scale(${this.levelScale})`;
        }
    },
    
    startGame() {
        this.isPlaying = true;
        this.level = 1;
        this.sequence = [];
        this.userSequence = [];
        this.fx.init();
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
        this.activeScale = 1;
        this.levelScale = 1;
        this.fx.stop();
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
        if (!levelDisplay) return;
        
        // Animación con overshoot como en Android
        this.levelScale = 0.5;
        const animate = () => {
            if (this.levelScale < 1.15) {
                this.levelScale += 0.13;
                if (this.levelScale > 1.15) this.levelScale = 1.15;
                levelDisplay.style.transform = `scale(${this.levelScale})`;
                requestAnimationFrame(animate);
            } else {
                // Decay a 1.0
                const decay = () => {
                    if (this.levelScale > 1.0) {
                        this.levelScale -= 0.015;
                        if (this.levelScale < 1.0) this.levelScale = 1.0;
                        levelDisplay.style.transform = `scale(${this.levelScale})`;
                        requestAnimationFrame(decay);
                    }
                };
                decay();
            }
        };
        animate();
        
        // Efecto de partículas para nivel
        const board = document.getElementById('puzzle-board');
        if (board) {
            const rect = board.getBoundingClientRect();
            this.fx.spawnParticleBurst(rect.width / 2, rect.height / 2, '#FFD700', 15, 0.8);
        }
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
        if (!circle) return;
        
        this.activeCircle = index;
        this.activeScale = 1;
        
        // Animación de pulso con overshoot como en Android
        const animate = () => {
            if (this.activeScale < 1.35) {
                this.activeScale += 0.07;
                if (this.activeScale > 1.35) this.activeScale = 1.35;
                circle.style.opacity = '1';
                circle.style.transform = `scale(${this.activeScale})`;
                circle.style.boxShadow = `0 0 30px ${this.colors[index]}, 0 0 60px ${this.colors[index]}`;
                circle.style.transition = 'all 0.1s ease-out';
                requestAnimationFrame(animate);
            }
        };
        animate();
        
        await this.delay(450);
        
        // Decay animación
        const decay = () => {
            if (this.activeScale > 1.0) {
                this.activeScale -= 0.035;
                if (this.activeScale < 1.0) this.activeScale = 1.0;
                circle.style.opacity = this.isShowingSequence ? '0.4' : '0.6';
                circle.style.transform = `scale(${this.activeScale})`;
                circle.style.boxShadow = 'none';
                requestAnimationFrame(decay);
            } else {
                this.activeCircle = -1;
            }
        };
        decay();
    },
    
    handleCircleClick(index) {
        if (!this.isPlaying || this.isShowingSequence) return;
        
        this.flashCircle(index);
        this.userSequence.push(index);
        
        const position = this.userSequence.length - 1;
        
        // Check if correct
        if (this.userSequence[position] !== this.sequence[position]) {
            this.updateStatus(`¡Casi! Nivel alcanzado: ${this.level}`);
            
            // Efecto de error
            const circle = document.querySelector(`.circle-${index}`);
            if (circle) {
                circle.style.background = '#F44336';
                this.fx.triggerShake(10);
                this.fx.triggerFlash('#F44336', 0.3);
            }
            
            // End the game immediately when user makes a mistake
            this.isPlaying = false;
            setTimeout(() => this.endGame(), 600);
            return;
        }
        
        // Check if sequence complete
        if (this.userSequence.length === this.sequence.length) {
            this.level++;
            this.updateStats();
            this.updateStatus('¡Perfecto! Siguiente nivel...');
            
            // Efecto de éxito
            const board = document.getElementById('puzzle-board');
            if (board) {
                const rect = board.getBoundingClientRect();
                this.fx.spawnParticleBurst(rect.width / 2, rect.height / 2, '#4CAF50', 20, 1);
                this.fx.spawnScorePopup(rect.width / 2, rect.height / 2 - 30, '¡Perfecto!', '#4CAF50');
            }
            
            setTimeout(() => this.addStepAndShow(), 800);
        }
    },
                this.fx.triggerFlash('#F44336', 0.3);
            }
            
            setTimeout(() => this.endGame(), 600);
            return;
        }
        
        // Check if sequence complete
        if (this.userSequence.length === this.sequence.length) {
            this.level++;
            this.updateStats();
            this.updateStatus('¡Perfecto! Siguiente nivel...');
            
            // Efecto de éxito
            const board = document.getElementById('puzzle-board');
            if (board) {
                const rect = board.getBoundingClientRect();
                this.fx.spawnParticleBurst(rect.width / 2, rect.height / 2, '#4CAF50', 20, 1);
                this.fx.spawnScorePopup(rect.width / 2, rect.height / 2 - 30, '¡Perfecto!', '#4CAF50');
            }
            
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
        this.isShowingSequence = false;
        
        // Calculate points based on level reached (current level - 1 since error occurred)
        const points = (this.level - 1) * 10 + 50;
        
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
