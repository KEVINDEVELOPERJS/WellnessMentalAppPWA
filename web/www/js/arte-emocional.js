// Arte Emocional - Emotional Art Expression Game
const ArteEmocionalModule = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    currentColor: '#FF6B6B',
    brushSize: 5,
    selectedEmotion: null,
    emotionCount: 0,
    fx: GameFxEngine,
    
    emotionColors: {
        alegria: ['#FF6B6B', '#FFEAA7', '#F7DC6F', '#FFA07A'],
        tristeza: ['#45B7D1', '#5DADE2', '#85C1E9', '#AED6F1'],
        calma: ['#96CEB4', '#98D8C8', '#52BE80', '#27AE60'],
        energia: ['#E74C3C', '#F39C12', '#D35400', '#C0392B'],
        amor: ['#E91E63', '#F48FB1', '#F06292', '#EC407A'],
        miedo: ['#9B59B6', '#8E44AD', '#BB8FCE', '#AF7AC5']
    },
    
    init() {
        this.canvas = document.getElementById('art-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
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
    
    setupCanvas() {
        const container = document.getElementById('canvas-container');
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width - 20;
        this.canvas.height = 300;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    },
    
    setupEventListeners() {
        const backBtn = document.getElementById('back-to-games');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'games.html';
            });
        }
        
        // Emotion selection
        document.querySelectorAll('.emotion-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectEmotion(card.dataset.emotion);
            });
        });
        
        // Color palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.selectColor(swatch.dataset.color);
            });
        });
        
        // Brush size
        document.querySelectorAll('.brush-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectBrushSize(btn.dataset.size);
            });
        });
        
        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Clear canvas
        document.getElementById('clear-canvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Save art
        document.getElementById('save-art').addEventListener('click', () => {
            this.saveArt();
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
                this.resetGame();
            });
        }
    },
    
    selectEmotion(emotion) {
        this.selectedEmotion = emotion;
        
        // Update UI
        document.querySelectorAll('.emotion-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-emotion="${emotion}"]`).classList.add('selected');
        
        // Update color palette with emotion-specific colors
        const colors = this.emotionColors[emotion] || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach((swatch, index) => {
            if (colors[index]) {
                swatch.dataset.color = colors[index];
                swatch.style.background = colors[index];
            }
        });
        
        // Select first color
        this.selectColor(colors[0]);
        
        this.updateStatus(`Exprésate con ${emotion}`);
    },
    
    selectColor(color) {
        this.currentColor = color;
        
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    },
    
    selectBrushSize(size) {
        const sizes = {
            small: 3,
            medium: 5,
            large: 10
        };
        this.brushSize = sizes[size] || 5;
        
        document.querySelectorAll('.brush-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
    },
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    },
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    },
    
    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    },
    
    clearCanvas() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    saveArt() {
        if (!this.selectedEmotion) {
            showToast('Por favor selecciona una emoción primero');
            return;
        }
        
        this.emotionCount++;
        document.getElementById('emotion-count').textContent = this.emotionCount;
        
        // Calculate points
        const points = 30;
        
        document.getElementById('final-emotion').textContent = this.selectedEmotion.charAt(0).toUpperCase() + this.selectedEmotion.slice(1);
        document.getElementById('final-points').textContent = `+${points}`;
        
        this.addPoints(points);
        
        // Visual feedback
        this.fx.triggerFlash('#4CAF50', 0.3);
        
        setTimeout(() => this.showCompleteModal(), 300);
    },
    
    showCompleteModal() {
        document.getElementById('game-complete-modal').classList.remove('hidden');
    },
    
    hideCompleteModal() {
        document.getElementById('game-complete-modal').classList.add('hidden');
    },
    
    resetGame() {
        this.selectedEmotion = null;
        this.clearCanvas();
        document.querySelectorAll('.emotion-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateStatus('Selecciona una emoción y exprésala con colores');
    },
    
    updateStatus(message) {
        const status = document.getElementById('game-status');
        if (status) status.textContent = message;
    },
    
    addPoints(amount) {
        // Update the gamification stats for the games dashboard
        const storedStats = localStorage.getItem('user_gamification_stats');
        if (storedStats) {
            const stats = JSON.parse(storedStats);
            stats.points += amount;
            localStorage.setItem('user_gamification_stats', JSON.stringify(stats));
        } else {
            localStorage.setItem('user_gamification_stats', JSON.stringify({
                level: 'Principiante',
                points: amount,
                ranking: '--',
                progress: 0
            }));
        }
        
        // Also store in legacy format for compatibility
        const current = parseInt(localStorage.getItem('userPoints') || '0');
        localStorage.setItem('userPoints', current + amount);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ArteEmocionalModule.init();
});
