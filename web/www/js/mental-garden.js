// Mental Garden Game Module
const MentalGardenModule = {
    plants: [
        {
            id: 'sakura',
            name: 'Flor Sakura',
            emoji: '🌸',
            stages: ['🌱', '🌿', '🌸'],
            cost: 50,
            growthTime: 7 // days to fully grow
        },
        {
            id: 'sunflower',
            name: 'Girasol',
            emoji: '🌻',
            stages: ['🌱', '🌿', '🌻'],
            cost: 40,
            growthTime: 5
        },
        {
            id: 'rose',
            name: 'Rosa',
            emoji: '🌹',
            stages: ['🌱', '🌿', '🌹'],
            cost: 60,
            growthTime: 8
        },
        {
            id: 'tulip',
            name: 'Tulipán',
            emoji: '🌷',
            stages: ['🌱', '🌿', '🌷'],
            cost: 35,
            growthTime: 4
        },
        {
            id: 'cactus',
            name: 'Cactus',
            emoji: '🌵',
            stages: ['🌱', '🌿', '🌵'],
            cost: 30,
            growthTime: 6
        },
        {
            id: 'tree',
            name: 'Árbol',
            emoji: '🌳',
            stages: ['🌱', '🌿', '🌳'],
            cost: 100,
            growthTime: 14
        }
    ],

    gardenSlots: [],
    selectedSlot: null,
    selectedPlant: null,
    isPlantingMode: false,
    wateringStreak: 0,

    init() {
        this.loadGardenState();
        this.renderGarden();
        this.setupEventListeners();
        this.updateWateringStreak();
    },

    loadGardenState() {
        const saved = localStorage.getItem('mentalGardenState');
        if (saved) {
            const state = JSON.parse(saved);
            this.gardenSlots = state.slots || [];
            this.wateringStreak = state.wateringStreak || 0;
        } else {
            // Initialize empty garden (9 slots)
            this.gardenSlots = Array(9).fill(null);
        }
    },

    saveGardenState() {
        localStorage.setItem('mentalGardenState', JSON.stringify({
            slots: this.gardenSlots,
            wateringStreak: this.wateringStreak
        }));
    },

    renderGarden() {
        const grid = document.getElementById('garden-grid');
        if (!grid) return;

        grid.innerHTML = this.gardenSlots.map((slot, index) => {
            if (!slot) {
                return `
                    <div class="garden-slot" data-slot="${index}">
                        <span class="empty-slot-text">+</span>
                    </div>
                `;
            }

            const plant = this.plants.find(p => p.id === slot.plantId);
            if (!plant) return '';

            const stageIndex = Math.min(slot.stage, plant.stages.length - 1);
            const progress = Math.min(100, Math.round((slot.stage / (plant.stages.length - 1)) * 100));
            const canWater = this.canWaterToday(slot);

            const stageText = `Etapa ${slot.stage + 1}/4`;
            return `
                <div class="garden-slot occupied ${this.selectedSlot === index ? 'selected' : ''}" data-slot="${index}">
                    <div class="plant-display">${plant.stages[stageIndex]}</div>
                    ${canWater ? '<div class="plant-water-indicator">💧</div>' : ''}
                    <div class="plant-stage-text">${stageText}</div>
                </div>
            `;
        }).join('');

        // Add click listeners
        grid.querySelectorAll('.garden-slot').forEach(slot => {
            slot.addEventListener('click', () => this.handleSlotClick(parseInt(slot.dataset.slot)));
        });
    },

    setupEventListeners() {
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const plantBtn = document.getElementById('plant-btn');
        if (plantBtn) {
            plantBtn.addEventListener('click', () => this.showPlantSelection());
        }

        const waterBtn = document.getElementById('water-btn');
        if (waterBtn) {
            waterBtn.addEventListener('click', () => this.waterSelectedPlant());
        }

        // Plant selection modal
        const modalClose = document.querySelector('#plant-selection-modal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hidePlantSelection());
        }

        const modalCancel = document.querySelector('#plant-selection-modal .cancel-btn');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.hidePlantSelection());
        }

        // Plant info modal
        const infoModalClose = document.querySelector('#plant-info-modal .btn-close');
        if (infoModalClose) {
            infoModalClose.addEventListener('click', () => this.hidePlantInfo());
        }

        const infoModalCancel = document.querySelector('#plant-info-modal .cancel-btn');
        if (infoModalCancel) {
            infoModalCancel.addEventListener('click', () => this.hidePlantInfo());
        }

        const waterPlantBtn = document.querySelector('#plant-info-modal .water-plant-btn');
        if (waterPlantBtn) {
            waterPlantBtn.addEventListener('click', () => {
                this.waterSelectedPlant();
                this.hidePlantInfo();
            });
        }
    },

    handleSlotClick(slotIndex) {
        this.selectedSlot = slotIndex;
        const slot = this.gardenSlots[slotIndex];

        if (this.isPlantingMode) {
            this.plantSeed(slotIndex);
            return;
        }

        if (!slot) {
            this.updateStatus('Selecciona "Plantar Semilla" para colocar una planta aquí');
            document.getElementById('water-btn').disabled = true;
        } else {
            this.showPlantInfo(slotIndex);
            document.getElementById('water-btn').disabled = !this.canWaterToday(slot);
        }

        this.renderGarden();
    },

    showPlantSelection() {
        const modal = document.getElementById('plant-selection-modal');
        const optionsContainer = document.getElementById('plant-options');

        optionsContainer.innerHTML = this.plants.map(plant => `
            <div class="plant-option" data-plant-id="${plant.id}">
                <div class="plant-option-emoji">${plant.emoji}</div>
                <div class="plant-option-name">${plant.name}</div>
                <div class="plant-option-cost">💰 ${plant.cost} pts</div>
            </div>
        `).join('');

        // Add click listeners
        optionsContainer.querySelectorAll('.plant-option').forEach(option => {
            option.addEventListener('click', () => {
                optionsContainer.querySelectorAll('.plant-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedPlant = this.plants.find(p => p.id === option.dataset.plantId);
            });
        });

        modal.classList.remove('hidden');
    },

    hidePlantSelection() {
        document.getElementById('plant-selection-modal').classList.add('hidden');
        this.selectedPlant = null;
        this.isPlantingMode = false;
        this.renderGarden();
    },

    plantSeed(slotIndex) {
        if (!this.selectedPlant) {
            this.showToast('Selecciona una planta primero');
            return;
        }

        // Check if user has enough points
        const userPoints = this.getUserPoints();
        if (userPoints < this.selectedPlant.cost) {
            this.showToast(`No tienes suficientes puntos. Necesitas ${this.selectedPlant.cost}`);
            this.hidePlantSelection();
            return;
        }

        // Deduct points
        this.deductPoints(this.selectedPlant.cost);

        // Plant the seed
        this.gardenSlots[slotIndex] = {
            plantId: this.selectedPlant.id,
            stage: 0,
            plantedDate: new Date().toISOString(),
            lastWatered: null
        };

        this.isPlantingMode = false;
        this.selectedPlant = null;
        this.selectedSlot = null;

        this.saveGardenState();
        this.renderGarden();
        this.hidePlantSelection();
        this.animateNewPlant(slotIndex);
        this.showToast(`¡${this.selectedPlant?.name || 'Planta'} plantada! -${this.selectedPlant?.cost || 0} pts`, 'success');
    },

    showPlantInfo(slotIndex) {
        const slot = this.gardenSlots[slotIndex];
        if (!slot) return;

        const plant = this.plants.find(p => p.id === slot.plantId);
        if (!plant) return;

        const stageIndex = Math.min(slot.stage, plant.stages.length - 1);
        const progress = Math.min(100, Math.round((slot.stage / (plant.stages.length - 1)) * 100));
        const lastWatered = slot.lastWatered ? new Date(slot.lastWatered).toLocaleDateString() : 'Nunca';

        document.getElementById('plant-emoji-large').textContent = plant.stages[stageIndex];
        document.getElementById('plant-name').textContent = plant.name;
        document.getElementById('plant-stage').textContent = this.getStageName(stageIndex);
        document.getElementById('plant-progress').textContent = `${progress}%`;
        document.getElementById('plant-last-watered').textContent = lastWatered;

        document.getElementById('plant-info-modal').classList.remove('hidden');
    },

    hidePlantInfo() {
        document.getElementById('plant-info-modal').classList.add('hidden');
    },

    getStageName(stageIndex) {
        const stages = ['Semilla', 'Brote', 'Madura'];
        return stages[stageIndex] || 'Desconocido';
    },

    canWaterToday(slot) {
        if (!slot.lastWatered) return true;
        
        const lastWatered = new Date(slot.lastWatered);
        const today = new Date();
        
        return lastWatered.toDateString() !== today.toDateString();
    },

    waterSelectedPlant() {
        if (this.selectedSlot === null) {
            this.showToast('Selecciona una planta primero');
            return;
        }

        const slot = this.gardenSlots[this.selectedSlot];
        if (!slot) {
            this.showToast('No hay planta en este espacio');
            return;
        }

        if (!this.canWaterToday(slot)) {
            this.showToast('Ya regaste esta planta hoy');
            return;
        }

        // Water the plant
        slot.lastWatered = new Date().toISOString();
        
        // Grow the plant
        const plant = this.plants.find(p => p.id === slot.plantId);
        const previousStage = slot.stage;
        if (plant && slot.stage < plant.stages.length - 1) {
            slot.stage++;
            // Animate flowering if stage increased from > 0
            if (previousStage > 0) {
                this.animateFlowering(this.selectedSlot);
            }
        }

        // Update streak
        this.wateringStreak++;
        this.updateWateringStreak();

        // Award points
        const pointsEarned = 5 + (this.wateringStreak * 2);
        this.addPoints(pointsEarned);

        this.saveGardenState();
        this.renderGarden();
        this.showToast(`¡Planta regada! +${pointsEarned} pts`, 'success');

        // Check if plant fully grown
        if (slot.stage === plant.stages.length - 1) {
            setTimeout(() => {
                this.showToast(`¡${plant.name} ha florecido! 🎉`, 'success');
            }, 1000);
        }
    },

    updateWateringStreak() {
        const streakElement = document.getElementById('watering-streak');
        if (streakElement) {
            streakElement.textContent = this.wateringStreak;
        }
    },

    updateStatus(message) {
        const status = document.getElementById('garden-status-text');
        if (status) {
            status.textContent = message;
        }
    },

    getUserPoints() {
        const points = localStorage.getItem('userPoints');
        return points ? parseInt(points) : 0;
    },

    addPoints(amount) {
        const current = this.getUserPoints();
        localStorage.setItem('userPoints', current + amount);
    },

    deductPoints(amount) {
        const current = this.getUserPoints();
        localStorage.setItem('userPoints', Math.max(0, current - amount));
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        if (toast && toastMessage) {
            toast.className = 'toast';
            if (type === 'success') toast.classList.add('success');
            if (type === 'error') toast.classList.add('error');
            
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    },
    
    animateFlowering: function(slotIndex) {
        const slot = document.querySelector(`.garden-slot[data-slot="${slotIndex}"]`);
        if (!slot) return;
        
        // Create flowering circle animation
        const circle = document.createElement('div');
        circle.className = 'flowering-circle';
        slot.appendChild(circle);
        
        // Animate plant scale
        const plantDisplay = slot.querySelector('.plant-display');
        if (plantDisplay) {
            plantDisplay.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            plantDisplay.style.transform = 'scale(1.25)';
            setTimeout(() => {
                plantDisplay.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Remove circle after animation
        setTimeout(() => {
            circle.remove();
        }, 700);
    },
    
    animateWatering: function(slotIndex) {
        const slot = document.querySelector(`.garden-slot[data-slot="${slotIndex}"]`);
        if (!slot) return;
        
        // Create water overlay animation
        const waterOverlay = document.createElement('div');
        waterOverlay.className = 'water-overlay';
        slot.appendChild(waterOverlay);
        
        // Remove after animation
        setTimeout(() => {
            waterOverlay.remove();
        }, 800);
    },
    
    animateNewPlant: function(slotIndex) {
        const slot = document.querySelector(`.garden-slot[data-slot="${slotIndex}"]`);
        if (!slot) return;
        
        const plantDisplay = slot.querySelector('.plant-display');
        if (plantDisplay) {
            plantDisplay.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            plantDisplay.style.transform = 'scale(0)';
            setTimeout(() => {
                plantDisplay.style.transform = 'scale(1)';
            }, 50);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MentalGardenModule.init();
});
