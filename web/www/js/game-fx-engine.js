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

    // Crear explosión de partículas
    spawnParticleBurst(x, y, color, count = 20, spread = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = (2 + Math.random() * 4) * spread;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 4 + Math.random() * 8,
                color
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

    // Crear banner de combo
    spawnComboBanner(x, y, text, comboLevel) {
        const colors = ['#FFC107', '#FF9800', '#F44336', '#E91E63', '#9C27B0'];
        const color = colors[Math.min(comboLevel - 2, colors.length - 1)];
        
        this.comboBanners.push({
            x, y,
            text,
            color,
            life: 1,
            scale: 1
        });
        this.ensureRunning();
    },

    // Trigger shake effect - desactivado para evitar zoom
    triggerShake(intensity) {
        // No hacer nada para evitar efectos de zoom
        return;
    },

    // Trigger flash effect - desactivado para evitar zoom
    triggerFlash(color, alpha = 0.3) {
        // No hacer nada para evitar efectos de zoom
        return;
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
            t.life -= 0.03;
            // Sin scale para evitar zoom

            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    },

    // Actualizar banners de combo
    updateComboBanners() {
        for (let i = this.comboBanners.length - 1; i >= 0; i--) {
            const b = this.comboBanners[i];
            
            // Sin animación de zoom - mantener escala constante
            b.scale = 1;
            
            b.life -= 0.02;
            
            if (b.life <= 0) {
                this.comboBanners.splice(i, 1);
            }
        }
    },

    // Actualizar shake
    updateShake() {
        if (this.shakeIntensity > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9;
            
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
            el.style.cssText = `
                position: absolute;
                left: ${b.x}px;
                top: ${b.y}px;
                color: ${b.color};
                font-size: 32px;
                font-weight: bold;
                opacity: ${b.life};
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 1002;
                text-shadow: 0 0 20px ${b.color}, 0 4px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
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

    // Aplicar shake a un elemento
    applyShake(element) {
        if (!element) return;
        element.style.transform = `translate(${this.shakeX}px, ${this.shakeY}px)`;
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
