// Game FX Engine - Sistema de efectos visuales compartido
// Inspirado en CalmaMatchFxEngine de la app Android
const GameFxEngine = {
    particles: [],
    floatingTexts: [],
    comboBanners: [],
    shakeIntensity: 0,
    shakeX: 0,
    shakeY: 0,
    flashColor: null,
    flashAlpha: 0,
    isRunning: false,
    animationId: null,

    // Inicializar el motor de efectos
    init() {
        this.particles = [];
        this.floatingTexts = [];
        this.comboBanners = [];
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.flashColor = null;
        this.flashAlpha = 0;
        this.isRunning = false;
    },

    // Iniciar el loop de animación
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.tick();
    },

    // Detener el motor de efectos
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    // Tick principal del motor
    tick() {
        if (!this.isRunning) return;

        this.updateParticles();
        this.updateFloatingTexts();
        this.updateComboBanners();
        this.updateShake();
        this.updateFlash();
        this.render();

        if (this.hasActiveEffects()) {
            this.animationId = requestAnimationFrame(() => this.tick());
        } else {
            this.isRunning = false;
        }
    },

    // Verificar si hay efectos activos
    hasActiveEffects() {
        return this.particles.length > 0 || 
               this.floatingTexts.length > 0 || 
               this.comboBanners.length > 0 ||
               this.shakeIntensity > 0 ||
               this.flashAlpha > 0;
    },

    // Limpiar todos los efectos
    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.comboBanners = [];
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.flashColor = null;
        this.flashAlpha = 0;
    },

    // Crear explosión de partículas (matching Android version)
    spawnParticleBurst(x, y, color, count = 20, power = 1) {
        // Colored particles
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (4 + Math.random() * 6) * power;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.018 + Math.random() * 0.02,
                size: 3 + Math.random() * 6,
                color
            });
        }
        
        // White particles (60% of count, minimum 3)
        const whiteCount = Math.max(Math.floor(count * 0.6), 3);
        for (let i = 0; i < whiteCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.025,
                size: 2 + Math.random() * 4,
                color: '#FFFFFF'
            });
        }
        this.ensureRunning();
    },

    // Crear texto flotante (puntos)
    spawnScorePopup(x, y, score, color) {
        this.floatingTexts.push({
            x, y,
            text: `+${score}`,
            color,
            life: 1,
            vy: -2,
            scale: 1
        });
        this.ensureRunning();
    },

    // Crear banner de combo (matching Android version colors)
    spawnComboBanner(x, y, text, comboLevel) {
        // Colors matching Android version
        let color;
        if (comboLevel >= 8) color = '#FF4081';
        else if (comboLevel >= 5) color = '#FFD700';
        else if (comboLevel >= 3) color = '#FF9800';
        else color = '#4CAF50';
        
        this.comboBanners.push({
            x, y,
            text,
            color,
            life: 1,
            scale: 0.5,
            isCombo: true
        });
        this.ensureRunning();
    },

    // Trigger shake effect - enabled for Android-like experience
    triggerShake(intensity) {
        this.shakeIntensity = intensity;
        this.ensureRunning();
    },

    // Trigger flash effect - enabled for Android-like experience
    triggerFlash(color, alpha = 0.3) {
        this.flashColor = color;
        this.flashAlpha = Math.min(Math.max(alpha, 0.15), 0.55);
        this.ensureRunning();
    },

    // Spawn stars for high combos (matching Android version)
    spawnStars(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.015,
                size: 4 + Math.random() * 5,
                color: '#FFD700' // Gold color for stars
            });
        }
        this.ensureRunning();
    },

    // Asegurar que el motor esté corriendo
    ensureRunning() {
        if (!this.isRunning) {
            this.start();
        }
    },

    // Actualizar partículas
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravedad
            p.life -= p.decay;
            p.size *= 0.95;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    // Actualizar textos flotantes
    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.vy *= 0.95;
            t.life -= 0.018;
            // Scale up animation like Android version
            if (t.scale < 1.2) {
                t.scale += 0.06;
            }

            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    },

    // Actualizar banners de combo
    updateComboBanners() {
        for (let i = this.comboBanners.length - 1; i >= 0; i--) {
            const b = this.comboBanners[i];
            
            // Scale up animation like Android version
            if (b.scale < 1.2) {
                b.scale += 0.06;
            }
            
            b.life -= 0.012;
            
            if (b.life <= 0) {
                this.comboBanners.splice(i, 1);
            }
        }
    },

    // Actualizar shake
    updateShake() {
        if (this.shakeIntensity > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= 0.75;
            
            if (Math.abs(this.shakeX) < 0.3) this.shakeX = 0;
            if (Math.abs(this.shakeY) < 0.3) this.shakeY = 0;
            
            if (this.shakeIntensity < 0.5) {
                this.shakeIntensity = 0;
                this.shakeX = 0;
                this.shakeY = 0;
            }
        }
    },

    // Actualizar flash
    updateFlash() {
        if (this.flashAlpha > 0) {
            this.flashAlpha *= 0.92;
            
            if (this.flashAlpha < 0.01) {
                this.flashAlpha = 0;
                this.flashColor = null;
            }
        }
    },

    // Renderizar efectos
    render() {
        this.applyShake();
        this.renderParticles();
        this.renderFloatingTexts();
        this.renderComboBanners();
        this.renderFlash();
    },

    // Renderizar partículas
    renderParticles() {
        const container = document.getElementById('fx-container');
        if (!container) return;

        // Limpiar partículas anteriores
        container.querySelectorAll('.fx-particle').forEach(el => el.remove());

        this.particles.forEach(p => {
            const el = document.createElement('div');
            el.className = 'fx-particle';
            el.style.cssText = `
                position: absolute;
                left: ${p.x}px;
                top: ${p.y}px;
                width: ${p.size}px;
                height: ${p.size}px;
                background: ${p.color};
                border-radius: 50%;
                opacity: ${p.life};
                pointer-events: none;
                z-index: 1000;
            `;
            container.appendChild(el);
        });
    },

    // Renderizar textos flotantes
    renderFloatingTexts() {
        const container = document.getElementById('fx-container');
        if (!container) return;

        container.querySelectorAll('.fx-floating-text').forEach(el => el.remove());

        this.floatingTexts.forEach(t => {
            const el = document.createElement('div');
            el.className = 'fx-floating-text';
            el.style.cssText = `
                position: absolute;
                left: ${t.x}px;
                top: ${t.y}px;
                color: ${t.color};
                font-size: 24px;
                font-weight: bold;
                opacity: ${t.life};
                pointer-events: none;
                z-index: 1001;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            el.textContent = t.text;
            container.appendChild(el);
        });
    },

    // Renderizar banners de combo
    renderComboBanners() {
        const container = document.getElementById('fx-container');
        if (!container) return;

        container.querySelectorAll('.fx-combo-banner').forEach(el => el.remove());

        this.comboBanners.forEach(b => {
            const el = document.createElement('div');
            el.className = 'fx-combo-banner';
            const fontSize = 32 + Math.min(b.text.length, 10) * 4;
            el.style.cssText = `
                position: absolute;
                left: ${b.x}px;
                top: ${b.y}px;
                color: ${b.color};
                font-size: ${fontSize}px;
                font-weight: bold;
                opacity: ${b.life};
                transform: translate(-50%, -50%) scale(${b.scale});
                pointer-events: none;
                z-index: 1002;
                text-shadow: 0 0 20px ${b.color}, 0 4px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
                ${b.isCombo ? 'font-family: system-ui, -apple-system, sans-serif;' : ''}
            `;
            el.textContent = b.text;
            container.appendChild(el);
        });
    },

    // Renderizar flash
    renderFlash() {
        let flashEl = document.getElementById('fx-flash');
        
        if (this.flashAlpha > 0) {
            if (!flashEl) {
                flashEl = document.createElement('div');
                flashEl.id = 'fx-flash';
                flashEl.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                `;
                document.body.appendChild(flashEl);
            }
            
            flashEl.style.background = this.flashColor;
            flashEl.style.opacity = this.flashAlpha;
        } else if (flashEl) {
            flashEl.remove();
        }
    },

    // Aplicar shake al tablero del juego
    applyShake() {
        const board = document.getElementById('game-board');
        if (board && (this.shakeX !== 0 || this.shakeY !== 0)) {
            board.style.transform = `translate(${this.shakeX}px, ${this.shakeY}px)`;
        }
    },

    // Mensajes de combo
    getComboMessage(comboLevel) {
        const messages = [
            '',
            '',
            '¡DOBLE!',
            '¡TRIPLE!',
            '¡CUÁDRUPLE!',
            '¡INCREÍBLE!',
            '¡ÉPICO!',
            '¡LEGENDARIO!',
            '¡DIVINO!',
            '¡COSMICO!'
        ];
        return messages[Math.min(comboLevel, messages.length - 1)] || `¡COMBO x${comboLevel}!`;
    },

    getMatchMessage(count) {
        if (count >= 6) return '¡MEGA MATCH!';
        if (count >= 5) return '¡SUPER MATCH!';
        if (count >= 4) return '¡GRAN MATCH!';
        return '';
    }
};
