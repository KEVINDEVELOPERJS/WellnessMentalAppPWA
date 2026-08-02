// Exercises Controller
class ExercisesController {
    constructor(dbManager) {
        this.db = dbManager;
        this.currentExercise = null;
        this.isRunning = false;
        this.isPaused = false;
        this.cycleCount = 0;
        this.totalSeconds = 0;
        this.timerInterval = null;
        this.breathingInterval = null;
        this.audioContext = null;
        this.voiceEnabled = true;
    }
    
    async getExercises() {
        try {
            const exercises = await this.db.getAll(DB_CONFIG.tables.exercises);
            return exercises;
        } catch (error) {
            console.error('Error getting exercises:', error);
            return [];
        }
    }
    
    async startExercise(exerciseId) {
        try {
            this.currentExercise = await this.db.get(DB_CONFIG.tables.exercises, exerciseId);
            this.cycleCount = 0;
            this.totalSeconds = 0;
            this.isRunning = false;
            this.isPaused = false;
            
            return { success: true, exercise: this.currentExercise };
        } catch (error) {
            console.error('Error starting exercise:', error);
            return { success: false, error: 'Error al iniciar ejercicio' };
        }
    }
    
    startBreathingCycle() {
        const type = this.currentExercise.tipo;
        let phases;
        
        if (type === '4-7-8') {
            phases = [
                { name: 'Inhala', duration: 4, action: 'inhale' },
                { name: 'Mantén', duration: 7, action: 'hold' },
                { name: 'Exhala', duration: 8, action: 'exhale' }
            ];
        } else if (type === 'caja') {
            phases = [
                { name: 'Inhala', duration: 4, action: 'inhale' },
                { name: 'Mantén', duration: 4, action: 'hold' },
                { name: 'Exhala', duration: 4, action: 'exhale' },
                { name: 'Mantén', duration: 4, action: 'hold' }
            ];
        } else if (type === 'coherente') {
            phases = [
                { name: 'Inhala', duration: 5, action: 'inhale' },
                { name: 'Exhala', duration: 5, action: 'exhale' }
            ];
        } else {
            phases = [
                { name: 'Inhala', duration: 4, action: 'inhale' },
                { name: 'Exhala', duration: 4, action: 'exhale' }
            ];
        }
        
        this.runBreathingPhases(phases);
    }
    
    runBreathingPhases(phases) {
        let currentPhaseIndex = 0;
        
        const runPhase = () => {
            if (!this.isRunning || this.isPaused) return;
            
            const phase = phases[currentPhaseIndex];
            this.updateBreathingUI(phase);
            
            let count = phase.duration;
            this.updateCountdown(count);
            
            const countdownInterval = setInterval(() => {
                if (!this.isRunning || this.isPaused) {
                    clearInterval(countdownInterval);
                    return;
                }
                
                count--;
                this.updateCountdown(count);
                
                if (count <= 0) {
                    clearInterval(countdownInterval);
                    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
                    
                    if (currentPhaseIndex === 0) {
                        this.cycleCount++;
                        this.updateCycleCount();
                    }
                    
                    runPhase();
                }
            }, 1000);
        };
        
        runPhase();
    }
    
    updateBreathingUI(phase) {
        const circle = document.querySelector('.circle-inner');
        const phaseText = document.getElementById('breathing-phase');
        
        // Remove all phase classes
        circle.classList.remove('inhale', 'hold', 'exhale');
        
        // Add current phase class
        circle.classList.add(phase.action);
        phaseText.textContent = phase.name;
        
        // Play voice guidance
        this.playVoiceGuidance(phase.name);
    }
    
    updateCountdown(count) {
        document.getElementById('breathing-count').textContent = count;
    }
    
    updateCycleCount() {
        document.getElementById('cycle-count').textContent = this.cycleCount;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.totalSeconds++;
                this.updateTimerDisplay();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.totalSeconds / 60);
        const seconds = this.totalSeconds % 60;
        document.getElementById('timer-seconds').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('total-time').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    async saveProgress(userId) {
        try {
            const progress = {
                userId,
                exerciseId: this.currentExercise.id,
                fecha: Utils.now(),
                duracionReal: this.totalSeconds,
                completado: 1,
                satisfaccion: 5,
                rachaDias: 1
            };
            
            await this.db.add(DB_CONFIG.tables.progress, progress);
            
            // Add points
            await this.addPoints(userId);
            
            return { success: true };
        } catch (error) {
            console.error('Error saving progress:', error);
            return { success: false };
        }
    }
    
    async addPoints(userId) {
        try {
            const pointsData = await this.db.get(DB_CONFIG.tables.points, userId);
            if (pointsData) {
                const pointsEarned = 25;
                pointsData.puntosTotales += pointsEarned;
                pointsData.xpNivelActual += pointsEarned;
                pointsData.fechaActualizacion = Utils.now();
                
                // Check for level up
                const xpNeeded = pointsData.nivel * 100;
                if (pointsData.xpNivelActual >= xpNeeded) {
                    pointsData.nivel++;
                    pointsData.xpNivelActual = pointsData.xpNivelActual - xpNeeded;
                }
                
                await this.db.update(DB_CONFIG.tables.points, pointsData);
                
                // Also update gamification stats for games dashboard
                const storedStats = localStorage.getItem('user_gamification_stats');
                if (storedStats) {
                    const stats = JSON.parse(storedStats);
                    stats.points += pointsEarned;
                    localStorage.setItem('user_gamification_stats', JSON.stringify(stats));
                } else {
                    localStorage.setItem('user_gamification_stats', JSON.stringify({
                        level: 'Principiante',
                        points: pointsEarned,
                        ranking: '--',
                        progress: 0
                    }));
                }
            }
        } catch (error) {
            console.error('Error adding points:', error);
        }
    }
    
    reset() {
        this.currentExercise = null;
        this.isRunning = false;
        this.isPaused = false;
        this.cycleCount = 0;
        this.totalSeconds = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
            this.voiceEnabled = false;
        }
    }
    
    playVoiceGuidance(phaseName) {
        if (!this.voiceEnabled) return;
        
        console.log('Playing audio for phase:', phaseName);
        
        // Use actual audio files for inhalation, exhalation, and hold
        const audioFiles = {
            'Inhala': 'audio/INHALA.m4a',
            'Exhala': 'audio/EXHALA.m4a',
            'Mantén': 'audio/MANTEN.mp4'
        };
        
        const audioFile = audioFiles[phaseName];
        if (audioFile) {
            try {
                const audio = new Audio(audioFile);
                audio.volume = 0.7;
                audio.currentTime = 0;
                
                audio.addEventListener('error', (e) => {
                    console.error('Audio error:', e);
                    this.playFallbackSound(phaseName);
                });
                
                audio.addEventListener('canplaythrough', () => {
                    console.log('Audio ready to play:', audioFile);
                });
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => console.log('Audio playing successfully'))
                        .catch(e => {
                            console.error('Audio play failed:', e);
                            this.playFallbackSound(phaseName);
                        });
                }
            } catch (e) {
                console.error('Audio creation failed:', e);
                this.playFallbackSound(phaseName);
            }
        } else {
            // Fallback to oscillator for other phases
            this.playFallbackSound(phaseName);
        }
    }
    
    playFallbackSound(phaseName) {
        // Fallback to oscillator for all phases
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio not supported');
                return;
            }
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set frequency based on phase (soothing tones)
        const frequencies = {
            'Inhala': 392, // G4 - gentle
            'Mantén': 440, // A4 - steady
            'Exhala': 349.23 // F4 - releasing
        };
        
        oscillator.frequency.value = frequencies[phaseName] || 392;
        oscillator.type = 'sine';
        
        // Create a gentle envelope for voice-like effect
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1); // Soft attack
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.3); // Slight decay
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6); // Gentle release
        
        oscillator.start(now);
        oscillator.stop(now + 0.6);
    }
}

// Initialize Exercises Controller
let exercisesController;

// UI Functions
async function loadExercisesList() {
    const exercises = await exercisesController.getExercises();
    const listContainer = document.querySelector('.exercises-list');
    
    listContainer.innerHTML = '';
    
    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.exerciseId = exercise.id;
        
        const difficultyClass = `difficulty-${exercise.dificultad}`;
        
        card.innerHTML = `
            <div class="exercise-card-header">
                <div class="exercise-icon">🧘</div>
                <div class="exercise-info">
                    <h3>${exercise.titulo}</h3>
                    <p>${exercise.descripcion}</p>
                </div>
            </div>
            <div class="exercise-details">
                <p>⏱️ ${Math.floor(exercise.duracionSeg / 60)} minutos</p>
                <span class="difficulty-badge ${difficultyClass}">${exercise.dificultad}</span>
            </div>
        `;
        
        card.addEventListener('click', () => startExercise(exercise.id));
        listContainer.appendChild(card);
    });
}

async function startExercise(exerciseId) {
    Utils.showLoading();
    
    const result = await exercisesController.startExercise(exerciseId);
    
    Utils.hideLoading();
    
    if (result.success) {
        document.getElementById('exercise-title').textContent = result.exercise.titulo;
        document.getElementById('exercise-description').textContent = result.exercise.descripcion;
        
        // Reset UI
        document.getElementById('cycle-count').textContent = '0';
        document.getElementById('total-time').textContent = '0:00';
        document.getElementById('timer-seconds').textContent = '0:00';
        document.getElementById('breathing-phase').textContent = 'Preparado';
        document.getElementById('breathing-count').textContent = '3';
        document.querySelector('.circle-inner').classList.remove('inhale', 'hold', 'exhale');
        
        // Reset buttons
        document.getElementById('start-exercise').classList.remove('hidden');
        document.getElementById('pause-exercise').classList.add('hidden');
        document.getElementById('resume-exercise').classList.add('hidden');
        document.getElementById('stop-exercise').classList.add('hidden');
        
        Utils.showScreen('exercise-screen');
    } else {
        Utils.showToast(result.error, 'error');
    }
}

function beginExercise() {
    exercisesController.isRunning = true;
    exercisesController.isPaused = false;
    
    // Update buttons
    document.getElementById('start-exercise').classList.add('hidden');
    document.getElementById('pause-exercise').classList.remove('hidden');
    document.getElementById('stop-exercise').classList.remove('hidden');
    
    // Start breathing cycle
    exercisesController.startBreathingCycle();
    
    // Start timer
    exercisesController.startTimer();
}

function pauseExercise() {
    exercisesController.pause();
    
    document.getElementById('pause-exercise').classList.add('hidden');
    document.getElementById('resume-exercise').classList.remove('hidden');
}

function resumeExercise() {
    exercisesController.resume();
    
    document.getElementById('resume-exercise').classList.add('hidden');
    document.getElementById('pause-exercise').classList.remove('hidden');
    
    // Restart breathing cycle
    exercisesController.startBreathingCycle();
}

async function stopExercise() {
    exercisesController.stop();
    
    const userId = parseInt(localStorage.getItem('userId'));
    await exercisesController.saveProgress(userId);
    
    // Show completion screen
    document.getElementById('final-cycles').textContent = exercisesController.cycleCount;
    
    const minutes = Math.floor(exercisesController.totalSeconds / 60);
    const seconds = exercisesController.totalSeconds % 60;
    document.getElementById('final-time').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('final-points').textContent = '+25';
    
    Utils.showScreen('exercise-complete-screen');
    Utils.showToast('¡Ejercicio completado!', 'success');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize exercises controller when app is ready
    const initInterval = setInterval(() => {
        if (dbManager && authController) {
            exercisesController = new ExercisesController(dbManager);
            exercisesController.initAudio();
            loadExercisesList();
            clearInterval(initInterval);
        }
    }, 100);
    
    // Back to dashboard
    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Back to list
    document.getElementById('back-to-list').addEventListener('click', () => {
        if (exercisesController.isRunning) {
            if (confirm('¿Estás seguro de que quieres cancelar? Se perderá el progreso.')) {
                exercisesController.stop();
                exercisesController.reset();
                Utils.showScreen('exercises-list-screen');
            }
        } else {
            Utils.showScreen('exercises-list-screen');
        }
    });
    
    // Start exercise
    document.getElementById('start-exercise').addEventListener('click', beginExercise);
    
    // Pause exercise
    document.getElementById('pause-exercise').addEventListener('click', pauseExercise);
    
    // Resume exercise
    document.getElementById('resume-exercise').addEventListener('click', resumeExercise);
    
    // Stop exercise
    document.getElementById('stop-exercise').addEventListener('click', stopExercise);
    
    // Repeat exercise
    document.getElementById('repeat-exercise').addEventListener('click', () => {
        const exerciseId = exercisesController.currentExercise.id;
        exercisesController.reset();
        startExercise(exerciseId);
    });
    
    // Back to dashboard from complete screen
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
