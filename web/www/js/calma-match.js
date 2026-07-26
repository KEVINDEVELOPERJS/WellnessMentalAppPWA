// Calma Match - Candy Crush Style Match-3 Game
const CalmaMatchModule = {
    COLS: 8,
    ROWS: 8,
    TYPES: 5,
    DURATION: 90, // seconds
    
    emojis: ['💜', '💚', '💙', '⭐', '🌸'],
    colors: ['#9C27B0', '#4CAF50', '#2196F3', '#FFC107', '#E91E63'],
    
    grid: [],
    selectedCell: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 90,
    gameStarted: false,
    isProcessing: false,
    timerInterval: null,
    fx: null,
    
    init() {
        this.setupEventListeners();
        this.renderInitialBoard();
        this.createFxContainer();
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
        const board = document.getElementById('game-board');
        if (!board) return;
        
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.COLS}, 1fr)`;
        
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'match-cell empty';
                cell.dataset.row = r;
                cell.dataset.col = c;
                board.appendChild(cell);
            }
        }
    },

    createFxContainer() {
        // Desactivado - no crear contenedor de efectos
        return;
    },
    
    startGame() {
        this.gameStarted = true;
        this.isProcessing = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = this.DURATION;
        this.selectedCell = null;
        
        // this.fx.init(); // Desactivado
        this.generateGrid();
        this.renderBoard();
        this.updateStats();
        this.startTimer();
        
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('restart-btn').classList.remove('hidden');
    },
    
    restartGame() {
        this.stopGame();
        this.startGame();
    },
    
    stopGame() {
        this.gameStarted = false;
        this.isProcessing = false;
        this.fx.stop();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    generateGrid() {
        do {
            this.grid = [];
            for (let r = 0; r < this.ROWS; r++) {
                const row = [];
                for (let c = 0; c < this.COLS; c++) {
                    row.push(Math.floor(Math.random() * this.TYPES));
                }
                this.grid.push(row);
            }
        } while (this.findMatches().length > 0);
    },
    
    renderBoard() {
        const board = document.getElementById('game-board');
        if (!board) return;
        
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.COLS}, 1fr)`;
        
        // Eliminar shake effect
        board.style.transform = 'none';
        
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = document.createElement('div');
                const type = this.grid[r][c];
                cell.className = 'match-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.dataset.type = type;
                
                if (this.selectedCell && this.selectedCell.row === r && this.selectedCell.col === c) {
                    cell.classList.add('selected');
                }
                
                cell.innerHTML = '';
                cell.style.background = `linear-gradient(135deg, ${this.colors[type]}dd, ${this.colors[type]}88)`;
                
                cell.addEventListener('click', () => this.handleCellClick(r, c));
                board.appendChild(cell);
            }
        }
    },
    
    handleCellClick(row, col) {
        if (!this.gameStarted || this.isProcessing) return;
        
        if (!this.selectedCell) {
            // Select first cell
            this.selectedCell = { row, col };
            this.renderBoard();
        } else {
            const prev = this.selectedCell;
            
            if (prev.row === row && prev.col === col) {
                // Deselect
                this.selectedCell = null;
                this.renderBoard();
            } else if (this.areAdjacent(prev, { row, col })) {
                // Try swap
                this.trySwap(prev.row, prev.col, row, col);
            } else {
                // Select new cell
                this.selectedCell = { row, col };
                this.renderBoard();
            }
        }
    },
    
    areAdjacent(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
    },
    
    async trySwap(r1, c1, r2, c2) {
        this.isProcessing = true;
        this.selectedCell = null;
        
        // Perform swap
        this.swap(r1, c1, r2, c2);
        this.renderBoard();
        
        await this.delay(200);
        
        const matches = this.findMatches();
        
        if (matches.length === 0) {
            // Swap back - invalid move
            this.swap(r1, c1, r2, c2);
            this.renderBoard();
            
            // Shake effect para movimiento inválido
            this.fx.triggerShake(8);
            await this.delay(300);
            
            this.isProcessing = false;
        } else {
            // Valid move - process cascade
            await this.processCascade(matches);
        }
    },
    
    swap(r1, c1, r2, c2) {
        const temp = this.grid[r1][c1];
        this.grid[r1][c1] = this.grid[r2][c2];
        this.grid[r2][c2] = temp;
    },
    
    findMatches() {
        const matches = [];
        const visited = new Set();
        
        // Check horizontal matches
        for (let r = 0; r < this.ROWS; r++) {
            let c = 0;
            while (c < this.COLS) {
                const type = this.grid[r][c];
                if (type === -1) { c++; continue; }
                
                let end = c + 1;
                while (end < this.COLS && this.grid[r][end] === type) end++;
                
                if (end - c >= 3) {
                    const match = [];
                    for (let i = c; i < end; i++) {
                        const key = `${r},${i}`;
                        if (!visited.has(key)) {
                            match.push({ row: r, col: i });
                            visited.add(key);
                        }
                    }
                    if (match.length > 0) matches.push(match);
                }
                c = end;
            }
        }
        
        // Check vertical matches
        for (let c = 0; c < this.COLS; c++) {
            let r = 0;
            while (r < this.ROWS) {
                const type = this.grid[r][c];
                if (type === -1) { r++; continue; }
                
                let end = r + 1;
                while (end < this.ROWS && this.grid[end][c] === type) end++;
                
                if (end - r >= 3) {
                    const match = [];
                    for (let i = r; i < end; i++) {
                        const key = `${i},${c}`;
                        if (!visited.has(key)) {
                            match.push({ row: i, col: c });
                            visited.add(key);
                        }
                    }
                    if (match.length > 0) matches.push(match);
                }
                r = end;
            }
        }
        
        return matches;
    },
    
    async processCascade(matches) {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // Get board element for animations
        const board = document.getElementById('game-board');
        
        // Calculate score
        const multiplier = this.combo >= 5 ? 5 : this.combo >= 3 ? 3 : this.combo >= 2 ? 2 : 1;
        let points = 0;
        
        matches.forEach(match => {
            const bonus = match.length >= 5 ? 3 : match.length >= 4 ? 2 : 1;
            points += match.length * 12 * multiplier * bonus;
        });
        
        this.score += points;
        this.updateStats();
        
        // Desactivar temporalmente efectos visuales para aislar el problema
        // Calcular centro de los matches para efectos
        const boardRect = board.getBoundingClientRect();
        const centerX = boardRect.width / 2;
        const centerY = boardRect.height / 2;
        
        // Efectos desactivados temporalmente
        
        // Remove matches from grid immediately without animation
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                this.grid[row][col] = -1;
            });
        });
        this.renderBoard();
        
        // Apply gravity
        await this.applyGravity();
        
        // Fill empty cells
        await this.fillEmptyCells();
        
        // Check for new matches
        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.delay(200);
            await this.processCascade(newMatches);
        } else {
            this.combo = 0;
            this.isProcessing = false;
            this.updateStats();
        }
    },
    
    async applyGravity() {
        for (let c = 0; c < this.COLS; c++) {
            const gems = [];
            for (let r = this.ROWS - 1; r >= 0; r--) {
                if (this.grid[r][c] !== -1) {
                    gems.push(this.grid[r][c]);
                }
            }
            
            let writeRow = this.ROWS - 1;
            for (const gem of gems) {
                this.grid[writeRow][c] = gem;
                writeRow--;
            }
            
            while (writeRow >= 0) {
                this.grid[writeRow][c] = -1;
                writeRow--;
            }
        }
        
        this.renderBoard();
        await this.delay(200);
    },
    
    async fillEmptyCells() {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.grid[r][c] === -1) {
                    this.grid[r][c] = Math.floor(Math.random() * this.TYPES);
                }
            }
        }
        
        this.renderBoard();
        await this.delay(200);
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
    
    updateStats() {
        const scoreEl = document.getElementById('score');
        const comboEl = document.getElementById('combo');
        const timerEl = document.getElementById('timer');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (comboEl) comboEl.textContent = this.combo;
        if (timerEl) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    
    endGame() {
        this.stopGame();
        
        // Calculate points to award
        const points = Math.floor(this.score / 10) + 50;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-combo').textContent = this.maxCombo;
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
    CalmaMatchModule.init();
});
