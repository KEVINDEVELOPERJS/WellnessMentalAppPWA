// Videos Module
const VideosModule = {
    videos: [
        {
            id: 1,
            title: 'Respiración 4-7-8',
            description: 'Técnica de respiración para reducir ansiedad y mejorar el sueño',
            duration: '5:30',
            category: 'Respiración',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            tips: [
                'Siéntate cómodamente o acuéstate',
                'Inhala por la nariz por 4 segundos',
                'Mantén el aire por 7 segundos',
                'Exhala por la boca por 8 segundos'
            ]
        },
        {
            id: 2,
            title: 'Respiración Box',
            description: 'Técnica de respiración cuadrada para calmar la mente',
            duration: '4:00',
            category: 'Respiración',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            tips: [
                'Visualiza un cuadrado mientras respiras',
                'Inhala por 4 segundos',
                'Mantén por 4 segundos',
                'Exhala por 4 segundos',
                'Mantén vacío por 4 segundos'
            ]
        },
        {
            id: 3,
            title: 'Meditación Guiada',
            description: 'Sesión de meditación para principiantes',
            duration: '10:00',
            category: 'Meditación',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            tips: [
                'Encuentra un lugar silencioso',
                'Cierra los ojos suavemente',
                'Enfócate en tu respiración',
                'Deja pasar los pensamientos sin juzgar'
            ]
        },
        {
            id: 4,
            title: 'Relajación Muscular',
            description: 'Técnica de relajación progresiva de Jacobson',
            duration: '15:00',
            category: 'Relajación',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            tips: [
                'Acuéstate en una superficie cómoda',
                'Tensa y relaja grupos musculares',
                'Comienza desde los pies hasta la cabeza',
                'Siente la diferencia entre tensión y relajación'
            ]
        },
        {
            id: 5,
            title: 'Mindfulness Básico',
            description: 'Ejercicios de atención plena para el día a día',
            duration: '8:00',
            category: 'Mindfulness',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            tips: [
                'Practica la atención en el presente',
                'Observa sin juzgar',
                'Acepta tus pensamientos y emociones',
                'Regresa suavemente al presente cuando te distraigas'
            ]
        },
        {
            id: 6,
            title: 'Salud Mental: Estrategias',
            description: 'Consejos prácticos para mantener el bienestar emocional',
            duration: '12:00',
            category: 'Educación',
            color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            tips: [
                'Mantén una rutina diaria',
                'Conecta con otros',
                'Haz ejercicio regularmente',
                'Duerme lo suficiente',
                'Busca ayuda cuando la necesites'
            ]
        }
    ],

    init() {
        this.renderVideos();
        this.setupEventListeners();
    },

    renderVideos() {
        const grid = document.getElementById('videos-grid');
        if (!grid) return;

        grid.innerHTML = this.videos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-thumbnail" style="background: ${video.color}"></div>
                <div class="video-card-info">
                    <h3 class="video-card-title">${video.title}</h3>
                    <div class="video-card-meta">
                        <span>⏱️ ${video.duration}</span>
                        <span>📚 ${video.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click listeners
        grid.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = parseInt(card.dataset.videoId);
                this.openVideoPlayer(videoId);
            });
        });
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const backToVideosBtn = document.getElementById('back-to-videos');
        if (backToVideosBtn) {
            backToVideosBtn.addEventListener('click', () => {
                this.showVideosScreen();
            });
        }
    },

    openVideoPlayer(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        document.getElementById('video-title').textContent = video.title;
        document.getElementById('video-description').textContent = video.description;
        document.getElementById('video-duration').textContent = video.duration;
        document.getElementById('video-category').textContent = video.category;
        
        const tipsList = document.getElementById('video-tips-list');
        tipsList.innerHTML = video.tips.map(tip => `<li>${tip}</li>`).join('');

        this.showVideoPlayerScreen();
    },

    showVideosScreen() {
        document.getElementById('videos-screen').classList.add('active');
        document.getElementById('video-player-screen').classList.remove('active');
        
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.pause();
        }
    },

    showVideoPlayerScreen() {
        document.getElementById('videos-screen').classList.remove('active');
        document.getElementById('video-player-screen').classList.add('active');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    VideosModule.init();
});
