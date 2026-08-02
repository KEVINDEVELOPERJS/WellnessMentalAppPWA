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
        console.log('CalmaMatchModule init called');
        console.log('Start button exists:', !!document.getElementById('start-btn'));
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
            startBtn.addEventListener('click', (e) => {
                console.log('Start button clicked');
                e.preventDefault();
                this.startGame();
            });
        } else {
            console.error('Start button not found');
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
        // Crear contenedor de efectos si no existe
        let container = document.getElementById('fx-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fx-container';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
                overflow: hidden;
            `;
            const boardContainer = document.querySelector('.game-board-container');
            if (boardContainer) {
                boardContainer.appendChild(container);
            }
        }
        if (typeof GameFxEngine !== 'undefined') {
            this.fx = GameFxEngine;
            this.fx.init();
        } else {
            console.error('GameFxEngine not available during createFxContainer');
        }
    },
    
    startGame() {
        console.log('startGame called');
        
        // Reset game state
        this.gameStarted = true;
        this.isProcessing = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = this.DURATION;
        this.selectedCell = null;
        
        // Enable FX engine
        if (typeof GameFxEngine !== 'undefined') {
            this.fx = GameFxEngine;
            this.fx.init();
        } else {
            console.error('GameFxEngine not available');
            this.fx = null;
        }
        
        console.log('Generating grid...');
        this.generateGrid();
        console.log('Grid generated:', this.grid);
        
        console.log('Rendering board...');
        this.renderBoard();
        
        console.log('Updating stats...');
        this.updateStats();
        
        console.log('Starting timer...');
        this.startTimer();
        
        console.log('Hiding start button, showing restart button...');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        if (startBtn) {
            startBtn.classList.add('hidden');
            console.log('Start button hidden');
        }
        if (restartBtn) {
            restartBtn.classList.remove('hidden');
            console.log('Restart button shown');
        }
        
        console.log('Game started successfully');
    },
    
    restartGame() {
        this.stopGame();
        this.startGame();
    },
    
    stopGame() {
        this.gameStarted = false;
        this.isProcessing = false;
        if (this.fx) this.fx.stop();
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
        if (!board) {
            console.error('Game board element not found');
            return;
        }
        
        console.log('Rendering board, grid:', this.grid);
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
                
                // Add emoji and gradient background like Android version
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'cell-emoji';
                emojiSpan.textContent = this.emojis[type];
                cell.appendChild(emojiSpan);
                
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
            if (this.fx) this.fx.triggerShake(8);
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
        
        // Calculate score (matching Android version logic)
        const multiplier = this.combo >= 8 ? 8 : this.combo >= 5 ? 5 : this.combo >= 3 ? 3 : this.combo >= 2 ? 2 : 1;
        let points = 0;
        
        matches.forEach(match => {
            const bonus = match.length >= 5 ? 3 : match.length >= 4 ? 2 : 1;
            points += match.length * 12 * multiplier * bonus;
        });
        
        this.score += points;
        this.updateStats();
        
        // Calculate center of matches for effects
        const boardRect = board.getBoundingClientRect();
        let centerX = 0, centerY = 0;
        let totalCells = 0;
        
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                const cell = board.children[row * this.COLS + col];
                if (cell) {
                    const rect = cell.getBoundingClientRect();
                    centerX += rect.left + rect.width / 2 - boardRect.left;
                    centerY += rect.top + rect.height / 2 - boardRect.top;
                    totalCells++;
                }
            });
        });
        
        if (totalCells > 0) {
            centerX /= totalCells;
            centerY /= totalCells;
        }
        
        // Visual effects (matching Android version)
        const dominantType = matches[0]?.[0] ? this.grid[matches[0][0].row][matches[0][0].col] : 0;
        const color = this.colors[dominantType] || '#FFC107';
        
        // Spawn particle burst with power based on combo
        if (this.fx) {
            const power = 1 + this.combo * 0.25 + matches.length * 0.08;
            const particleCount = Math.min(matches.length * 4 + this.combo * 3, 40);
            this.fx.spawnParticleBurst(centerX, centerY, color, particleCount, power);
            
            // Spawn score popup
            this.fx.spawnScorePopup(centerX, centerY - 20, points, color);
            
            // Combo banner for combos >= 2
            if (this.combo >= 2) {
                const comboMsg = this.getComboMessage(this.combo);
                if (comboMsg) {
                    this.fx.spawnComboBanner(boardRect.width / 2, boardRect.height * 0.38, comboMsg, this.combo);
                    this.showComboSpecial(this.combo, comboMsg);
                }
            }
            
            // Match length messages
            matches.forEach(match => {
                const matchMsg = this.getMatchMessage(match.length);
                if (matchMsg) {
                    const firstCell = match[0];
                    const cell = board.children[firstCell.row * this.COLS + firstCell.col];
                    if (cell) {
                        const rect = cell.getBoundingClientRect();
                        const cellX = rect.left + rect.width / 2 - boardRect.left;
                        const cellY = rect.top + rect.height / 2 - boardRect.top;
                        this.fx.spawnComboBanner(cellX, cellY - 30, matchMsg, this.combo + 2);
                    }
                }
            });
            
            // Spawn stars for high combos
            if (this.combo >= 3) {
                this.fx.spawnStars(centerX, centerY, this.combo * 2);
            }
            
            // Flash and shake for high combos (matching Android)
            if (this.combo >= 4) {
                this.fx.triggerFlash(color, Math.min(0.2 + this.combo * 0.04, 0.55));
                this.fx.triggerShake(Math.min(this.combo * 2.5, 18));
            }
            if (this.combo >= 6) {
                this.fx.triggerFlash('#FFC107', 0.35);
                this.fx.triggerShake(12);
            }
        }
        
        // Animate matches elimination
        await this.animateMatches(matches, this.combo, points);
        
        // Remove matches from grid after animation
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
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    async animateMatches(matches, comboLevel, pointsGained) {
        const board = document.getElementById('game-board');
        if (!board) return;
        
        // Duration based on combo level (matching Android version)
        const duration = comboLevel >= 5 ? 380 : comboLevel >= 3 ? 320 : 260;
        
        // Animate each matched cell with scale and rotation like Android
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                const cell = board.children[row * this.COLS + col];
                if (cell) {
                    // Phase 1: Scale up with rotation (0-30%)
                    cell.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    cell.style.transform = 'scale(1.36) rotate(15deg)';
                    cell.style.opacity = '1';
                    
                    // Phase 2: Scale down with more rotation (30-100%)
                    setTimeout(() => {
                        cell.style.transition = `transform ${duration * 0.7}ms ease-out, opacity ${duration * 0.7}ms ease-out`;
                        cell.style.transform = 'scale(0) rotate(20deg)';
                        cell.style.opacity = '0';
                    }, duration * 0.3);
                }
            });
        });
        
        await this.delay(duration);
        
        // Reset transforms after animation
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                const cell = board.children[row * this.COLS + col];
                if (cell) {
                    cell.style.transition = '';
                    cell.style.transform = '';
                    cell.style.opacity = '';
                }
            });
        });
    },
    
    showComboSpecial(combo, message) {
        const comboEl = document.getElementById('combo');
        if (!comboEl) return;
        
        // Color based on combo level
        let color = '#666';
        if (combo >= 8) color = '#F44336';
        else if (combo >= 5) color = '#FF9800';
        else if (combo >= 3) color = '#2196F3';
        else if (combo >= 2) color = '#4CAF50';
        
        comboEl.textContent = message;
        comboEl.style.color = color;
        comboEl.style.fontWeight = 'bold';
        comboEl.style.fontSize = '18px';
        
        // Reset after delay
        setTimeout(() => {
            comboEl.textContent = this.combo;
            comboEl.style.color = '';
            comboEl.style.fontWeight = '';
            comboEl.style.fontSize = '';
        }, 1500);
    },
    
    getComboMessage(combo) {
        // Matching Android version messages
        if (combo >= 10) return '¡ULTRA CALMA!';
        if (combo >= 8) return '¡LEGENDARIO!';
        if (combo >= 6) return '¡DIVINO!';
        if (combo >= 5) return '¡INCREÍBLE!';
        if (combo >= 4) return '¡DELICIOSO!';
        if (combo >= 3) return '¡GENIAL!';
        if (combo >= 2) return '¡BIEN!';
        return '';
    },
    
    getMatchMessage(count) {
        // Matching Android version messages
        if (count >= 5) return '¡EXPLOSIÓN!';
        if (count >= 4) return '¡RAYO!';
        return null;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing CalmaMatchModule');
    CalmaMatchModule.init();
});

// Fallback in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already ready, initializing CalmaMatchModule');
    CalmaMatchModule.init();
}

// Direct event listener as fallback
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'start-btn') {
        console.log('Direct click listener triggered');
        e.preventDefault();
        e.stopPropagation();
        if (typeof CalmaMatchModule !== 'undefined') {
            CalmaMatchModule.startGame();
        } else {
            console.error('CalmaMatchModule not defined');
        }
    }
}, true);
