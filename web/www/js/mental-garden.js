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
        },
        {
            id: 'orchid',
            name: 'Orquídea',
            emoji: '🌺',
            stages: ['🌱', '🌿', '🌺'],
            cost: 80,
            growthTime: 10
        },
        {
            id: 'lavender',
            name: 'Lavanda',
            emoji: '💜',
            stages: ['🌱', '🌿', '💜'],
            cost: 70,
            growthTime: 9
        },
        {
            id: 'bamboo',
            name: 'Bambú',
            emoji: '🎋',
            stages: ['🌱', '🎋', '🎋'],
            cost: 120,
            growthTime: 12
        },
        {
            id: 'palm',
            name: 'Palmera',
            emoji: '🌴',
            stages: ['🌱', '🌿', '🌴'],
            cost: 150,
            growthTime: 15
        },
        {
            id: 'lotus',
            name: 'Loto',
            emoji: '🪷',
            stages: ['🌱', '🌿', '🪷'],
            cost: 200,
            growthTime: 18
        },
        {
            id: 'cherry_blossom',
            name: 'Cerezo en Flor',
            emoji: '🌸',
            stages: ['🌱', '🌿', '🌸'],
            cost: 250,
            growthTime: 20
        },
        {
            id: 'hibiscus',
            name: 'Hibisco',
            emoji: '🌺',
            stages: ['🌱', '🌿', '🌺'],
            cost: 180,
            growthTime: 16
        },
        {
            id: 'sunflower_giant',
            name: 'Girasol Gigante',
            emoji: '🌻',
            stages: ['🌱', '🌿', '🌻'],
            cost: 300,
            growthTime: 22
        },
        {
            id: 'magic_tree',
            name: 'Árbol Mágico',
            emoji: '🌳',
            stages: ['🌱', '🌿', '🌳', '✨'],
            cost: 500,
            growthTime: 30
        },
        {
            id: 'crystal_flower',
            name: 'Flor de Cristal',
            emoji: '💎',
            stages: ['🌱', '💎', '💎'],
            cost: 750,
            growthTime: 35
        },
        {
            id: 'golden_tree',
            name: 'Árbol Dorado',
            emoji: '🌳',
            stages: ['🌱', '🌿', '🌳', '🌟'],
            cost: 1000,
            growthTime: 45
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
        this.updateUserPoints();
        
        // Refresh points periodically to sync with games
        setInterval(() => {
            this.updateUserPoints();
        }, 2000);
    },

    loadGardenState() {
        const saved = localStorage.getItem('mentalGardenState');
        if (saved) {
            const state = JSON.parse(saved);
            this.gardenSlots = state.slots || [];
            this.wateringStreak = state.wateringStreak || 0;
            
            // Ensure we always have 16 slots
            while (this.gardenSlots.length < 16) {
                this.gardenSlots.push(null);
            }
        } else {
            // Initialize empty garden (16 slots - 4x4 grid)
            this.gardenSlots = Array(16).fill(null);
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
        if (!grid) {
            console.log('Grid element not found');
            return;
        }

        console.log('Rendering garden with slots:', this.gardenSlots);

        grid.innerHTML = this.gardenSlots.map((slot, index) => {
            if (!slot) {
                return `
                    <div class="garden-slot" data-slot="${index}">
                        <span class="empty-slot-text">+</span>
                    </div>
                `;
            }

            const plant = this.plants.find(p => p.id === slot.plantId);
            if (!plant) {
                console.log('Plant not found for ID:', slot.plantId);
                return '';
            }

            const stageIndex = Math.min(slot.stage, plant.stages.length - 1);
            const progress = Math.min(100, Math.round((slot.stage / (plant.stages.length - 1)) * 100));
            const canWater = this.canWaterToday(slot);

            const stageText = `Etapa ${slot.stage + 1}/${plant.stages.length}`;
            console.log(`Rendering slot ${index}: plant ${plant.name}, stage ${stageIndex}, emoji ${plant.stages[stageIndex]}`);
            
            return `
                <div class="garden-slot occupied ${this.selectedSlot === index ? 'selected' : ''}" data-slot="${index}">
                    <div class="plant-display">${plant.stages[stageIndex]}</div>
                    ${canWater ? '<div class="plant-water-indicator">💧</div>' : ''}
                    <div class="plant-stage-text">${stageText}</div>
                </div>
            `;
        }).join('');

        console.log('Grid HTML after render:', grid.innerHTML);

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
        console.log('Slot clicked:', slotIndex, 'Planting mode:', this.isPlantingMode, 'Selected plant:', this.selectedPlant);
        
        this.selectedSlot = slotIndex;
        const slot = this.gardenSlots[slotIndex];

        if (this.isPlantingMode && this.selectedPlant) {
            console.log('Planting seed in slot:', slotIndex);
            this.plantSeed(slotIndex);
            return;
        }

        if (!slot) {
            this.updateStatus('Selecciona "Plantar Semilla" para colocar una planta aquí');
            document.getElementById('water-btn').disabled = true;
            // If in planting mode but no plant selected, show plant selection
            if (this.isPlantingMode) {
                this.showPlantSelection();
            }
        } else {
            this.showPlantInfo(slotIndex);
            document.getElementById('water-btn').disabled = !this.canWaterToday(slot);
        }

        this.renderGarden();
    },

    showPlantSelection() {
        const modal = document.getElementById('plant-selection-modal');
        const optionsContainer = document.getElementById('plant-options');
        const confirmBtn = document.querySelector('.confirm-plant-btn');
        const userPoints = this.getUserPoints();

        optionsContainer.innerHTML = this.plants.map(plant => {
            const canAfford = userPoints >= plant.cost;
            return `
            <div class="plant-option ${!canAfford ? 'disabled' : ''}" data-plant-id="${plant.id}">
                <div class="plant-option-emoji">${plant.emoji}</div>
                <div class="plant-option-name">${plant.name}</div>
                <div class="plant-option-cost">${canAfford ? '💰' : '🔒'} ${plant.cost} pts</div>
            </div>
        `}).join('');

        // Reset selection
        this.selectedPlant = null;
        confirmBtn.disabled = true;

        // Add click listeners
        optionsContainer.querySelectorAll('.plant-option').forEach(option => {
            if (!option.classList.contains('disabled')) {
                option.addEventListener('click', () => {
                    optionsContainer.querySelectorAll('.plant-option').forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    this.selectedPlant = this.plants.find(p => p.id === option.dataset.plantId);
                    confirmBtn.disabled = false;
                });
            }
        });

        // Add confirm button listener
        confirmBtn.onclick = () => {
            if (this.selectedPlant) {
                console.log('Plant confirmed for planting:', this.selectedPlant.name);
                this.isPlantingMode = true;
                // Store the selected plant before hiding modal
                const plantToPlant = this.selectedPlant;
                this.hidePlantSelectionWithoutReset();
                this.selectedPlant = plantToPlant;
                this.updateStatus('Selecciona un espacio vacío para plantar');
            }
        };

        modal.classList.remove('hidden');
    },

    hidePlantSelection() {
        document.getElementById('plant-selection-modal').classList.add('hidden');
        this.selectedPlant = null;
        this.isPlantingMode = false;
        this.renderGarden();
    },

    hidePlantSelectionWithoutReset() {
        document.getElementById('plant-selection-modal').classList.add('hidden');
        this.renderGarden();
    },

    plantSeed(slotIndex) {
        console.log('plantSeed called with slotIndex:', slotIndex);
        console.log('selectedPlant:', this.selectedPlant);
        console.log('isPlantingMode:', this.isPlantingMode);
        
        if (!this.selectedPlant) {
            this.showToast('Selecciona una planta primero');
            this.isPlantingMode = false;
            return;
        }

        // Check if user has enough points
        const userPoints = this.getUserPoints();
        console.log('User points:', userPoints, 'Plant cost:', this.selectedPlant.cost);
        
        if (userPoints < this.selectedPlant.cost) {
            this.showToast(`No tienes suficientes puntos. Necesitas ${this.selectedPlant.cost}`);
            this.isPlantingMode = false;
            this.selectedPlant = null;
            return;
        }

        // Deduct points
        this.deductPoints(this.selectedPlant.cost);
        console.log('Points deducted. New balance:', this.getUserPoints());

        // Store plant info for toast message
        const plantName = this.selectedPlant.name;
        const plantCost = this.selectedPlant.cost;

        // Plant the seed
        this.gardenSlots[slotIndex] = {
            plantId: this.selectedPlant.id,
            stage: 0,
            plantedDate: new Date().toISOString(),
            lastWatered: null
        };
        
        console.log('Plant added to slot:', slotIndex, 'Plant data:', this.gardenSlots[slotIndex]);
        console.log('Full garden slots:', this.gardenSlots);

        this.isPlantingMode = false;
        this.selectedPlant = null;
        this.selectedSlot = null;

        this.saveGardenState();
        console.log('Garden state saved');
        
        this.renderGarden();
        console.log('Garden rendered');
        
        this.updateUserPoints();
        
        // Check if plant appears in DOM
        setTimeout(() => {
            const slotElement = document.querySelector(`.garden-slot[data-slot="${slotIndex}"]`);
            console.log('Slot element after render:', slotElement);
            if (slotElement) {
                console.log('Slot HTML:', slotElement.innerHTML);
            }
        }, 50);
        
        // Delay animation to ensure DOM is updated
        setTimeout(() => {
            this.animateNewPlant(slotIndex);
        }, 100);
        
        this.showToast(`¡${plantName} plantada! -${plantCost} pts`, 'success');
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
        this.updateUserPoints();
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

    updateUserPoints() {
        const pointsElement = document.getElementById('user-points');
        if (pointsElement) {
            pointsElement.textContent = this.getUserPoints();
        }
    },

    updateStatus(message) {
        const status = document.getElementById('garden-status-text');
        if (status) {
            status.textContent = message;
        }
    },

    getUserPoints() {
        const stats = localStorage.getItem('user_gamification_stats');
        if (stats) {
            const parsed = JSON.parse(stats);
            return parsed.points || 0;
        }
        // Initialize with default points if not exists
        const defaultStats = { level: 'Principiante', points: 100, ranking: '--', progress: 0 };
        localStorage.setItem('user_gamification_stats', JSON.stringify(defaultStats));
        return 100;
    },

    addPoints(amount) {
        const stats = localStorage.getItem('user_gamification_stats');
        let currentStats = { level: 'Principiante', points: 0, ranking: '--', progress: 0 };
        
        if (stats) {
            currentStats = JSON.parse(stats);
        }
        
        currentStats.points += amount;
        localStorage.setItem('user_gamification_stats', JSON.stringify(currentStats));
    },

    deductPoints(amount) {
        const stats = localStorage.getItem('user_gamification_stats');
        let currentStats = { level: 'Principiante', points: 0, ranking: '--', progress: 0 };
        
        if (stats) {
            currentStats = JSON.parse(stats);
        }
        
        console.log('Before deduction - Points:', currentStats.points, 'Amount to deduct:', amount);
        currentStats.points = Math.max(0, currentStats.points - amount);
        console.log('After deduction - Points:', currentStats.points);
        localStorage.setItem('user_gamification_stats', JSON.stringify(currentStats));
        console.log('Points saved to localStorage');
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
        if (!slot) {
            console.log('Slot not found for animation:', slotIndex);
            return;
        }
        
        // Add animation class to the slot
        slot.classList.add('grow-animation');
        
        // Remove animation class after it completes
        setTimeout(() => {
            slot.classList.remove('grow-animation');
        }, 500);
        
        console.log('Plant animation triggered for slot:', slotIndex);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MentalGardenModule.init();
});
