// Puzzle Zen Game Module (Sliding Puzzle)
const PuzzleZenModule = {
    size: 3,
    tiles: [],
    emptyIndex: 8,
    moves: 0,
    timer: 0,
    timerInterval: null,
    gameStarted: false,

    init() {
        this.setupEventListeners();
        this.startGame();
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-games');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.stopTimer();
                window.location.href = 'games.html';
            });
        }

        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffleBoard());
        }

        const solveBtn = document.getElementById('solve-btn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => this.solvePuzzle());
        }

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.size = parseInt(btn.dataset.size);
                this.startGame();
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
                this.startGame();
            });
        }
    },

    startGame() {
        this.stopTimer();
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;

        // Initialize solved state
        this.tiles = Array.from({ length: this.size * this.size }, (_, i) => i);
        this.emptyIndex = this.tiles.length - 1;

        this.updateStats();
        this.shuffleBoard();
    },

    shuffleBoard() {
        // Perform random valid moves to ensure solvability
        const shuffleMoves = this.size * this.size * 10;
        
        for (let i = 0; i < shuffleMoves; i++) {
            const movableIndices = this.getMovableIndices();
            const randomIndex = movableIndices[Math.floor(Math.random() * movableIndices.length)];
            this.swapTiles(randomIndex, this.emptyIndex, false);
        }

        this.moves = 0;
        this.updateStats();
        this.renderBoard();
    },

    getMovableIndices() {
        const movable = [];
        const row = Math.floor(this.emptyIndex / this.size);
        const col = this.emptyIndex % this.size;

        // Check adjacent tiles
        if (row > 0) movable.push(this.emptyIndex - this.size); // Up
        if (row < this.size - 1) movable.push(this.emptyIndex + this.size); // Down
        if (col > 0) movable.push(this.emptyIndex - 1); // Left
        if (col < this.size - 1) movable.push(this.emptyIndex + 1); // Right

        return movable;
    },

    swapTiles(index1, index2, countMove = true) {
        [this.tiles[index1], this.tiles[index2]] = [this.tiles[index2], this.tiles[index1]];
        this.emptyIndex = index1;

        if (countMove) {
            this.moves++;
            this.updateStats();
        }
    },

    renderBoard() {
        const board = document.getElementById('puzzle-board');
        if (!board) return;

        board.className = `puzzle-board size-${this.size}`;

        const movableIndices = new Set(this.getMovableIndices());

        board.innerHTML = this.tiles.map((value, index) => {
            const isEmpty = value === this.tiles.length - 1;
            const isMovable = !isEmpty && movableIndices.has(index);

            return `
                <div class="puzzle-tile ${isEmpty ? 'empty' : ''} ${isMovable ? 'movable' : ''}" 
                     data-index="${index}">
                    ${isEmpty ? '' : value + 1}
                </div>
            `;
        }).join('');

        // Add click listeners
        board.querySelectorAll('.puzzle-tile:not(.empty)').forEach(tile => {
            tile.addEventListener('click', () => this.handleTileClick(parseInt(tile.dataset.index)));
        });
    },

    handleTileClick(index) {
        const movableIndices = this.getMovableIndices();
        
        if (!movableIndices.includes(index)) {
            return;
        }

        // Start timer on first move
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }

        // Swap tiles
        this.swapTiles(index, this.emptyIndex);
        this.renderBoard();

        // Check for win
        if (this.checkWin()) {
            this.stopTimer();
            setTimeout(() => this.showCompleteModal(), 500);
        }
    },

    checkWin() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] !== i) {
                return false;
            }
        }
        return true;
    },

    solvePuzzle() {
        // Reset to solved state
        this.tiles = Array.from({ length: this.size * this.size }, (_, i) => i);
        this.emptyIndex = this.tiles.length - 1;
        this.renderBoard();
        this.showToast('Puzzle resuelto automáticamente');
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateStats();
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateStats() {
        const timerEl = document.getElementById('timer');
        const movesEl = document.getElementById('moves');

        if (timerEl) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        if (movesEl) {
            movesEl.textContent = this.moves;
        }
    },

    showCompleteModal() {
        const modal = document.getElementById('game-complete-modal');
        
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Calculate points (base 75 - 1 point per move over minimum, minimum 25 points)
        const minMoves = this.size * this.size * 2;
        const points = Math.max(25, 75 - Math.max(0, this.moves - minMoves));

        document.getElementById('final-time').textContent = timeStr;
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-points').textContent = `+${points}`;

        // Award points
        this.addPoints(points);

        modal.classList.remove('hidden');
    },

    hideCompleteModal() {
        document.getElementById('game-complete-modal').classList.add('hidden');
    },

    addPoints(amount) {
        const current = parseInt(localStorage.getItem('userPoints') || '0');
        localStorage.setItem('userPoints', current + amount);
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
    PuzzleZenModule.init();
});
