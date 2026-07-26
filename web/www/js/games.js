// Games/Gamification Module
class GamesModule {
    constructor() {
        this.userStats = {
            level: 'Principiante',
            points: 0,
            ranking: '--',
            progress: 0
        };
        this.missions = [];
        this.miniGames = [];
        this.ranking = [];
        this.achievements = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadMissions();
        this.loadMiniGames();
        this.loadRanking();
        this.loadAchievements();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    loadUserData() {
        const storedStats = localStorage.getItem('user_gamification_stats');
        if (storedStats) {
            this.userStats = JSON.parse(storedStats);
        } else {
            this.userStats = {
                level: 'Principiante',
                points: 0,
                ranking: '--',
                progress: 0
            };
            this.saveUserData();
        }
    }

    saveUserData() {
        localStorage.setItem('user_gamification_stats', JSON.stringify(this.userStats));
    }

    loadMissions() {
        const storedMissions = localStorage.getItem('daily_missions');
        const today = new Date().toDateString();
        
        if (storedMissions) {
            const missionsData = JSON.parse(storedMissions);
            if (missionsData.date === today) {
                this.missions = missionsData.missions;
            } else {
                this.generateNewMissions();
            }
        } else {
            this.generateNewMissions();
        }
    }

    generateNewMissions() {
        const missionTemplates = [
            { title: 'Completar 1 ejercicio de respiración', reward: 10, type: 'exercise' },
            { title: 'Realizar 1 evaluación psicológica', reward: 15, type: 'evaluation' },
            { title: 'Chatear con el asistente IA', reward: 5, type: 'chat' },
            { title: 'Hacer check-in emocional', reward: 5, type: 'checkin' },
            { title: 'Publicar en la comunidad', reward: 10, type: 'community' }
        ];

        this.missions = missionTemplates.map((template, index) => ({
            id: index + 1,
            ...template,
            completed: false
        }));

        this.saveMissions();
    }

    saveMissions() {
        localStorage.setItem('daily_missions', JSON.stringify({
            date: new Date().toDateString(),
            missions: this.missions
        }));
    }

    loadMiniGames() {
        this.miniGames = [
            { id: 'calma_match', nombre: 'Calma Match', descripcion: 'Combina gemas emocionales. ¡Sube en el ranking!', duracionMaxMin: 5, icono: '🍬', disponible: true, url: 'calma-match.html' },
            { id: 'jardin_mental', nombre: 'Jardín Mental', descripcion: 'Cultiva plantas con tu autocuidado diario', duracionMaxMin: 0, icono: '🌱', disponible: true, url: 'mental-garden.html' },
            { id: 'ritmo_calma', nombre: 'Ritmo Calma', descripcion: 'Toca al ritmo del orbe. ¡Sube tu combo!', duracionMaxMin: 5, icono: '🎵', disponible: true, url: 'ritmo-calma.html' },
            { id: 'puzzle_zen', nombre: 'Puzzle Zen', descripcion: 'Memoriza patrones relajantes', duracionMaxMin: 5, icono: '🧩', disponible: true, url: 'puzzle-zen.html' },
            { id: 'arte_emocional', nombre: 'Arte Emocional', descripcion: 'Expresa tus emociones con color', duracionMaxMin: 3, icono: '🎨', disponible: true, url: 'arte-emocional.html' }
        ];
    }

    loadRanking() {
        const storedRanking = localStorage.getItem('global_ranking');
        if (storedRanking) {
            this.ranking = JSON.parse(storedRanking);
        } else {
            this.generateSampleRanking();
        }
    }

    generateSampleRanking() {
        this.ranking = [
            { position: 1, name: 'María G.', points: 1250 },
            { position: 2, name: 'Carlos M.', points: 980 },
            { position: 3, name: 'Ana R.', points: 890 },
            { position: 4, name: 'Pedro S.', points: 750 },
            { position: 5, name: 'Laura L.', points: 620 }
        ];
        localStorage.setItem('global_ranking', JSON.stringify(this.ranking));
    }

    loadAchievements() {
        const storedAchievements = localStorage.getItem('user_achievements');
        if (storedAchievements) {
            this.achievements = JSON.parse(storedAchievements);
        } else {
            this.achievements = [
                { id: 1, name: 'Primer Paso', icon: '🎯', unlocked: false },
                { id: 2, name: 'Respirador', icon: '🧘', unlocked: false },
                { id: 3, name: 'Comunicador', icon: '💬', unlocked: false },
                { id: 4, name: 'Evaluador', icon: '📋', unlocked: false },
                { id: 5, name: 'Consistente', icon: '🔥', unlocked: false },
                { id: 6, name: 'Maestro Zen', icon: '🧘‍♂️', unlocked: false }
            ];
            this.saveAchievements();
        }
    }

    saveAchievements() {
        localStorage.setItem('user_achievements', JSON.stringify(this.achievements));
    }

    render() {
        this.renderUserStats();
        this.renderMissions();
        this.renderMiniGames();
        this.renderRanking();
        this.renderAchievements();
    }

    renderUserStats() {
        document.getElementById('user-level').textContent = this.userStats.level;
        document.getElementById('user-points').textContent = this.userStats.points;
        document.getElementById('user-ranking').textContent = `#${this.userStats.ranking}`;
        document.getElementById('progress-percent').textContent = `${this.userStats.progress}%`;
        document.getElementById('level-progress-fill').style.width = `${this.userStats.progress}%`;
    }

    renderMissions() {
        const missionsList = document.getElementById('missions-list');
        missionsList.innerHTML = this.missions.map(mission => `
            <div class="mission-item ${mission.completed ? 'completed' : ''}">
                <div class="mission-checkbox" data-mission-id="${mission.id}"></div>
                <div class="mission-info">
                    <div class="mission-title">${mission.title}</div>
                    <div class="mission-reward">+${mission.reward} puntos</div>
                </div>
            </div>
        `).join('');

        // Add click listeners for mission completion
        missionsList.querySelectorAll('.mission-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const missionId = parseInt(e.target.dataset.missionId);
                this.toggleMission(missionId);
            });
        });
    }

    toggleMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (mission && !mission.completed) {
            mission.completed = true;
            this.addPoints(mission.reward);
            this.saveMissions();
            this.renderMissions();
            this.renderUserStats();
            showToast(`¡Misión completada! +${mission.reward} puntos`);
            this.checkLevelUp();
        }
    }

    addPoints(points) {
        this.userStats.points += points;
        this.updateLevel();
        this.saveUserData();
    }

    updateLevel() {
        const levels = [
            { name: 'Principiante', minPoints: 0 },
            { name: 'Aprendiz', minPoints: 100 },
            { name: 'Intermedio', minPoints: 300 },
            { name: 'Avanzado', minPoints: 600 },
            { name: 'Experto', minPoints: 1000 },
            { name: 'Maestro', minPoints: 1500 }
        ];

        let currentLevel = levels[0];
        let nextLevel = levels[1];

        for (let i = 0; i < levels.length; i++) {
            if (this.userStats.points >= levels[i].minPoints) {
                currentLevel = levels[i];
                nextLevel = levels[i + 1] || levels[i];
            }
        }

        this.userStats.level = currentLevel.name;

        if (nextLevel !== currentLevel) {
            const range = nextLevel.minPoints - currentLevel.minPoints;
            const progress = this.userStats.points - currentLevel.minPoints;
            this.userStats.progress = Math.min(100, Math.round((progress / range) * 100));
        } else {
            this.userStats.progress = 100;
        }
    }

    checkLevelUp() {
        const oldLevel = this.userStats.level;
        this.updateLevel();
        if (oldLevel !== this.userStats.level) {
            showToast(`🎉 ¡Subiste de nivel: ${this.userStats.level}!`);
            this.unlockAchievement(5); // Maestro Zen achievement
        }
    }

    renderMiniGames() {
        const gamesList = document.getElementById('mini-games-list');
        gamesList.innerHTML = this.miniGames.map((game, index) => {
            const animClass = this.getAnimationClass(game.id);
            const buttonText = game.disponible ? 'Jugar' : 'Próximamente';
            return `
            <div class="game-card ${!game.disponible ? 'unavailable' : ''}" data-game-id="${game.id}">
                <div class="game-icon ${game.disponible ? animClass : ''}">${game.icono}</div>
                <div class="game-info">
                    <div class="game-title">${game.nombre}</div>
                    <div class="game-description">${game.descripcion}</div>
                </div>
                <button class="game-button" ${!game.disponible ? 'disabled' : ''}>${buttonText}</button>
            </div>
            `;
        }).join('');

        // Add click listeners for games
        gamesList.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.gameId;
                this.openGame(gameId);
            });
        });
    }

    getAnimationClass(gameId) {
        const animations = {
            'calma_match': 'anim-pulse',
            'jardin_mental': 'anim-bounce',
            'ritmo_calma': 'anim-shake',
            'puzzle_zen': 'anim-spin',
            'arte_emocional': 'anim-pop'
        };
        return animations[gameId] || '';
    }

    openGame(gameId) {
        const game = this.miniGames.find(g => g.id === gameId);
        if (game) {
            if (game.url) {
                window.location.href = game.url;
            } else {
                showToast('🎮 Próximamente disponible');
            }
        }
    }

    renderRanking() {
        const rankingList = document.getElementById('ranking-list');
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Usuario' };
        
        rankingList.innerHTML = this.ranking.map((player, index) => `
            <div class="ranking-item ${player.name === user.name ? 'current-user' : ''}">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${player.name}</div>
                    <div class="ranking-points">${player.points} puntos</div>
                </div>
            </div>
        `).join('');
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        achievementsGrid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            </div>
        `).join('');
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.renderAchievements();
            showToast(`🏆 Logro desbloqueado: ${achievement.name}`);
        }
    }

    completeMission(type) {
        const mission = this.missions.find(m => m.type === type && !m.completed);
        if (mission) {
            this.toggleMission(mission.id);
        }
    }
}

// Initialize games module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('games-screen')) {
        window.gamesModule = new GamesModule();
    }
});
