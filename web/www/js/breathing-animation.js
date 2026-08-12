// Breathing Animation - Wellness Mental Web App
// Animación visual sincronizada para ejercicios de respiración según criterios HU-04

const BreathingAnimation = {
    /**
     * Iniciar animación de respiración
     * @param {string} containerId - ID del contenedor
     * @param {object} phases - Fases de respiración [{name, duration, action}]
     * @param {function} onPhaseChange - Callback cuando cambia de fase
     */
    start(containerId, phases, onPhaseChange) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[BREATHING] Container not found:', containerId);
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Crear estructura de animación
        const animationContainer = document.createElement('div');
        animationContainer.className = 'breathing-animation-container';
        animationContainer.innerHTML = `
            <div class="breathing-circle" id="breathing-circle">
                <div class="breathing-inner-circle"></div>
                <div class="breathing-text" id="breathing-text">Inhala</div>
                <div class="breathing-timer" id="breathing-timer">4</div>
            </div>
            <div class="breathing-instruction" id="breathing-instruction">
                Sigue el ritmo del círculo
            </div>
        `;
        
        container.appendChild(animationContainer);
        
        // Iniciar ciclo de fases
        this.runPhases(phases, onPhaseChange);
        
        console.log('[BREATHING] Animación iniciada');
    },
    
    /**
     * Ejecutar fases de respiración con animación
     */
    runPhases(phases, onPhaseChange) {
        let currentPhaseIndex = 0;
        
        const runPhase = () => {
            if (currentPhaseIndex >= phases.length) {
                currentPhaseIndex = 0; // Reiniciar ciclo
            }
            
            const phase = phases[currentPhaseIndex];
            this.animatePhase(phase);
            
            if (onPhaseChange) {
                onPhaseChange(phase);
            }
            
            // Timer para el contador
            let timeLeft = phase.duration;
            const timerElement = document.getElementById('breathing-timer');
            if (timerElement) {
                timerElement.textContent = timeLeft;
                
                const timerInterval = setInterval(() => {
                    timeLeft--;
                    if (timerElement) {
                        timerElement.textContent = timeLeft;
                    }
                    
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                    }
                }, 1000);
            }
            
            // Pasar a siguiente fase
            currentPhaseIndex++;
            setTimeout(runPhase, phase.duration * 1000);
        };
        
        runPhase();
    },
    
    /**
     * Animar fase específica
     */
    animatePhase(phase) {
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        const instruction = document.getElementById('breathing-instruction');
        
        if (!circle || !text) return;
        
        // Resetear animaciones
        circle.classList.remove('inhale', 'hold', 'exhale');
        
        // Configurar según fase
        switch (phase.action) {
            case 'inhale':
                circle.classList.add('inhale');
                text.textContent = phase.name;
                if (instruction) instruction.textContent = 'Inhala profundamente';
                break;
            case 'hold':
                circle.classList.add('hold');
                text.textContent = phase.name;
                if (instruction) instruction.textContent = 'Mantén el aire';
                break;
            case 'exhale':
                circle.classList.add('exhale');
                text.textContent = phase.name;
                if (instruction) instruction.textContent = 'Exhala lentamente';
                break;
        }
    },
    
    /**
     * Detener animación
     */
    stop(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
        console.log('[BREATHING] Animación detenida');
    },
    
    /**
     * Crear contenedor si no existe
     */
    createContainer(containerId) {
        if (!document.getElementById(containerId)) {
            const container = document.createElement('div');
            container.id = containerId;
            container.className = 'breathing-animation-wrapper';
            document.body.appendChild(container);
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BreathingAnimation;
}