// Community Module
class CommunityModule {
    constructor() {
        this.posts = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.renderPosts();
    }

    setupEventListeners() {
        // Back to dashboard
        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderPosts();
            });
        });

        // New post FAB
        document.getElementById('new-post-btn').addEventListener('click', () => {
            document.getElementById('new-post-modal').classList.remove('hidden');
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('new-post-modal').classList.add('hidden');
        });

        document.getElementById('cancel-post').addEventListener('click', () => {
            document.getElementById('new-post-modal').classList.add('hidden');
        });

        // New post form
        document.getElementById('new-post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewPost();
        });

        // Close modal on outside click
        document.getElementById('new-post-modal').addEventListener('click', (e) => {
            if (e.target.id === 'new-post-modal') {
                document.getElementById('new-post-modal').classList.add('hidden');
            }
        });
    }

    loadPosts() {
        // Load posts from localStorage
        const storedPosts = localStorage.getItem('community_posts');
        if (storedPosts) {
            this.posts = JSON.parse(storedPosts);
        } else {
            // Sample posts for demo
            this.posts = [
                {
                    id: 1,
                    title: 'Mi viaje con la ansiedad',
                    content: 'Comencé a usar los ejercicios de respiración hace un mes y la diferencia ha sido increíble. Al principio me costaba, pero ahora es parte de mi rutina diaria.',
                    author: 'María G.',
                    category: 'ansiedad',
                    likes: 12,
                    liked: false,
                    date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 2,
                    title: 'Consejos para dormir mejor',
                    content: 'Después de mucho probar, descubrí que dejar el celular una hora antes de dormir me ayuda mucho. También uso la técnica 4-7-8 antes de acostarme.',
                    author: 'Carlos M.',
                    category: 'bienestar',
                    likes: 8,
                    liked: false,
                    date: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 3,
                    title: 'El poder de la meditación',
                    content: 'Nunca creí que la meditación fuera para mí hasta que la probé. Solo 5 minutos al día han cambiado mi perspectiva sobre el estrés.',
                    author: 'Ana R.',
                    category: 'estres',
                    likes: 15,
                    liked: false,
                    date: new Date(Date.now() - 259200000).toISOString()
                }
            ];
            this.savePosts();
        }
    }

    savePosts() {
        localStorage.setItem('community_posts', JSON.stringify(this.posts));
    }

    renderPosts() {
        const postsList = document.getElementById('posts-list');
        const emptyState = document.getElementById('empty-state');
        
        let filteredPosts = this.posts;
        if (this.currentCategory !== 'all') {
            filteredPosts = this.posts.filter(post => post.category === this.currentCategory);
        }

        if (filteredPosts.length === 0) {
            postsList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        postsList.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');

        // Add event listeners for like and report buttons
        postsList.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.closest('.like-btn').dataset.postId);
                this.toggleLike(postId);
            });
        });

        postsList.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.closest('.report-btn').dataset.postId);
                this.reportPost(postId);
            });
        });
    }

    createPostHTML(post) {
        const categoryLabels = {
            'ansiedad': 'Ansiedad',
            'depresion': 'Depresión',
            'estres': 'Estrés',
            'bienestar': 'Bienestar'
        };

        const formattedDate = new Date(post.date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });

        const initials = post.author.split(' ').map(name => name[0]).join('').toUpperCase();

        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-avatar">${initials}</div>
                    <div class="post-author-info">
                        <div class="post-author-name">${post.author}</div>
                        <span class="post-category">${categoryLabels[post.category]}</span>
                    </div>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-content">${post.content}</p>
                <div class="post-footer">
                    <div class="post-actions">
                        <button class="post-action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                            <span>${post.liked ? '❤️' : '🤍'}</span>
                            <span>${post.likes}</span>
                        </button>
                        <button class="post-action-btn report-btn" data-post-id="${post.id}">
                            <span>🚩</span>
                            <span>Reportar</span>
                        </button>
                    </div>
                    <span class="post-date">${formattedDate}</span>
                </div>
            </div>
        `;
    }

    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            this.savePosts();
            this.renderPosts();
        }
    }

    reportPost(postId) {
        if (confirm('¿Estás seguro de que quieres reportar este post?')) {
            showToast('Post reportado. Gracias por ayudarnos a mantener la comunidad segura.');
            // In a real app, this would send a report to a server
        }
    }

    createNewPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const category = document.getElementById('post-category').value;

        if (!title || !content) {
            showToast('Por favor completa todos los campos');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Usuario' };
        
        const newPost = {
            id: Date.now(),
            title,
            content,
            author: user.name,
            category,
            likes: 0,
            liked: false,
            date: new Date().toISOString()
        };

        this.posts.unshift(newPost);
        this.savePosts();
        this.renderPosts();

        // Reset form and close modal
        document.getElementById('new-post-form').reset();
        document.getElementById('new-post-modal').classList.add('hidden');

        showToast('¡Post publicado exitosamente!');

        // Check for achievements
        this.checkAchievements();
    }

    checkAchievements() {
        const userPosts = this.posts.filter(post => post.author === (JSON.parse(localStorage.getItem('user')) || {}).name).length;
        
        if (userPosts === 1) {
            showToast('🏆 Logro desbloqueado: Primer post');
        } else if (userPosts === 5) {
            showToast('🏆 Logro desbloqueado: Comunicador');
        } else if (userPosts === 10) {
            showToast('🏆 Logro desbloqueado: Colaborador activo');
        }
    }
}

// Initialize community module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('community-screen')) {
        new CommunityModule();
    }
});
