// Videos Module
const VideosModule = {
    videos: [
        {
            id: 1,
            title: 'Kiara en un espejismo de vida',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            videoFile: 'videos/video1.mp4',
            tips: []
        },
        {
            id: 2,
            title: 'La importancia de salud mental desde lo básico',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            videoFile: 'videos/video2.mp4',
            tips: []
        },
        {
            id: 3,
            title: 'Una madre y sus soles en medio del disciplinamiento emocional',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            videoFile: 'videos/video3.mp4',
            tips: []
        },
        {
            id: 4,
            title: 'Las cicatrices que se pueden volver traumas',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            videoFile: 'videos/video4.mp4',
            tips: []
        },
        {
            id: 5,
            title: 'Cuidar sin perderse',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            videoFile: 'videos/video5.mp4',
            tips: []
        },
        {
            id: 6,
            title: 'El camino hacia la sanación emocional',
            description: '',
            duration: '0:00',
            category: 'Historia',
            color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            videoFile: 'videos/video6.mp4',
            tips: []
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

        // Set video source
        const videoPlayer = document.getElementById('video-player');
        const videoSource = videoPlayer.querySelector('source');
        videoSource.src = video.videoFile;
        videoPlayer.load();

        this.showVideoPlayerScreen();

        // Play immediately
        videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));

        // Request fullscreen after a short delay
        setTimeout(() => {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
        }, 100);
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
