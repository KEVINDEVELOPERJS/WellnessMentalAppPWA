// Calma Match Memory Game Module
const CalmaMatchModule = {
    emojis: ['🌸', '🌻', '🌹', '🌷', '🌺', '🌼', '🌻', '🌸'],
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
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

        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.startGame());
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
                this.startGame();
            });
        }
    },

    startGame() {
        this.stopTimer();
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.gameStarted = false;

        this.updateStats();
        this.generateCards();
        this.renderBoard();
    },

    generateCards() {
        // Create pairs
        const pairs = [...this.emojis, ...this.emojis];
        
        // Shuffle
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        this.cards = pairs.map((emoji, index) => ({
            id: index,
            emoji: emoji,
            flipped: false,
            matched: false
        }));
    },

    renderBoard() {
        const board = document.getElementById('game-board');
        if (!board) return;

        board.innerHTML = this.cards.map(card => `
            <div class="game-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" 
                 data-card-id="${card.id}">
                <div class="card-front">?</div>
                <div class="card-back">${card.emoji}</div>
            </div>
        `).join('');

        // Add click listeners
        board.querySelectorAll('.game-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => this.handleCardClick(parseInt(cardEl.dataset.cardId)));
        });
    },

    handleCardClick(cardId) {
        const card = this.cards[cardId];
        
        // Ignore if already flipped, matched, or two cards already flipped
        if (card.flipped || card.matched || this.flippedCards.length >= 2) {
            return;
        }

        // Start timer on first click
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }

        // Flip the card
        card.flipped = true;
        this.flippedCards.push(card);

        // Update visual
        const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
        cardEl.classList.add('flipped');

        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkForMatch();
        }
    },

    checkForMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.flippedCards = [];

            // Update visuals
            document.querySelector(`[data-card-id="${card1.id}"]`).classList.add('matched');
            document.querySelector(`[data-card-id="${card2.id}"]`).classList.add('matched');

            // Check for game complete
            if (this.matchedPairs === this.emojis.length) {
                this.stopTimer();
                setTimeout(() => this.showCompleteModal(), 500);
            }
        } else {
            // No match - flip back after delay
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                this.flippedCards = [];

                document.querySelector(`[data-card-id="${card1.id}"]`).classList.remove('flipped');
                document.querySelector(`[data-card-id="${card2.id}"]`).classList.remove('flipped');
            }, 1000);
        }
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
        
        // Calculate points (base 50 - 1 point per move over minimum, minimum 10 points)
        const points = Math.max(10, 50 - Math.max(0, this.moves - this.emojis.length));

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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CalmaMatchModule.init();
});
