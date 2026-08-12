// Traffic Light Component - Wellness Mental Web App
// Semáforo visual animado para resultados de evaluación según criterios HU-03

const TrafficLight = {
    /**
     * Mostrar semáforo de riesgo animado
     * @param {string} riskLevel - 'bajo', 'medio', 'alto'
     * @param {string} containerId - ID del contenedor donde mostrar el semáforo
     */
    show(riskLevel, containerId = 'traffic-light-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[TRAFFIC LIGHT] Container not found:', containerId);
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Colores según nivel de riesgo
        const colors = {
            bajo: { primary: '#28a745', secondary: '#20c997', emoji: '🟢' },
            medio: { primary: '#ffc107', secondary: '#fd7e14', emoji: '🟡' },
            alto: { primary: '#dc3545', secondary: '#c82333', emoji: '🔴' }
        };
        
        const color = colors[riskLevel.toLowerCase()] || colors.bajo;
        
        // Crear estructura del semáforo
        const trafficLight = document.createElement('div');
        trafficLight.className = 'traffic-light';
        trafficLight.innerHTML = `
            <div class="traffic-light-housing">
                <div class="light red-light"></div>
                <div class="light yellow-light"></div>
                <div class="light green-light"></div>
            </div>
            <div class="traffic-light-result">
                <div class="result-emoji">${color.emoji}</div>
                <div class="result-text">${riskLevel.toUpperCase()}</div>
                <div class="result-subtitle">Nivel de Riesgo</div>
            </div>
        `;
        
        container.appendChild(trafficLight);
        
        // Animar según nivel de riesgo
        this.animate(riskLevel.toLowerCase());
        
        console.log('[TRAFFIC LIGHT] Semáforo mostrado:', riskLevel);
    },
    
    /**
     * Animar el semáforo según el nivel de riesgo
     */
    animate(riskLevel) {
        const redLight = document.querySelector('.red-light');
        const yellowLight = document.querySelector('.yellow-light');
        const greenLight = document.querySelector('.green-light');
        
        // Resetear luces
        if (redLight) redLight.classList.remove('active');
        if (yellowLight) yellowLight.classList.remove('active');
        if (greenLight) greenLight.classList.remove('active');
        
        // Activar luz correspondiente con animación
        setTimeout(() => {
            switch (riskLevel) {
                case 'alto':
                    if (redLight) redLight.classList.add('active');
                    break;
                case 'medio':
                    if (yellowLight) yellowLight.classList.add('active');
                    break;
                case 'bajo':
                    if (greenLight) greenLight.classList.add('active');
                    break;
            }
        }, 300);
    },
    
    /**
     * Ocultar el semáforo
     */
    hide(containerId = 'traffic-light-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    },
    
    /**
     * Crear contenedor de semáforo si no existe
     */
    createContainer(containerId = 'traffic-light-container') {
        if (!document.getElementById(containerId)) {
            const container = document.createElement('div');
            container.id = containerId;
            container.className = 'traffic-light-container';
            document.body.appendChild(container);
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrafficLight;
}