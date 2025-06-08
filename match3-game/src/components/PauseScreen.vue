<template>
  <div class="pause-container">
    <div class="pause-card">
      <h2>Game Paused</h2>
      
      <div class="game-stats">
        <div class="stat-item">
          <span class="label">Player:</span>
          <span class="value">{{ gameStore.playerName }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Score:</span>
          <span class="value highlight">{{ gameStore.score }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Level:</span>
          <span class="value">{{ gameStore.level }}</span>
        </div>
      </div>
      
      <div class="button-group">
        <button @click="resumeGame" class="primary">Resume Game</button>
        <button @click="saveAndQuit" class="secondary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save & Quit' }}
        </button>
      </div>
      
      <div v-if="saveSuccess" class="save-success">
        Game saved successfully!
      </div>
      
      <div v-if="saveError" class="save-error">
        Failed to save game. Please try again.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref(false)

const resumeGame = () => {
  gameStore.resumeGame()
}

const saveAndQuit = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = false
  
  try {
    const success = await gameStore.saveGame()
    if (success) {
      saveSuccess.value = true
      // Reload the page after a short delay to return to welcome screen
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      saveError.value = true
    }
  } catch (error) {
    console.error('Error saving game:', error)
    saveError.value = true
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pause-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.pause-card {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(109, 99, 255, 0.15);
  text-align: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.pause-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(173, 99, 255, 0.2), rgba(109, 99, 255, 0.1));
  border-radius: 50%;
  z-index: 0;
}

.pause-card::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(109, 99, 255, 0.1), rgba(173, 99, 255, 0.2));
  border-radius: 50%;
  z-index: 0;
}

h2 {
  color: #6d63ff;
  margin-bottom: 1.2rem;
  font-size: 1.8rem;
  text-shadow: 0 2px 10px rgba(109, 99, 255, 0.2);
  position: relative;
  z-index: 1;
}

.game-stats {
  background: linear-gradient(135deg, #f0f7ff, #e6f0ff);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05),
              inset 0 -2px 5px rgba(0, 0, 0, 0.03),
              inset 0 2px 5px rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  color: #333;
  font-weight: 600;
}

.value.highlight {
  color: #6d63ff;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 5px rgba(109, 99, 255, 0.3);
}

.button-group {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
}

button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(109, 99, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-sizing: border-box;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.6s ease;
}

button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(109, 99, 255, 0.3);
}

button:hover::before {
  left: 100%;
}

button:active {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(109, 99, 255, 0.2);
}

button.primary {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
}

button.secondary {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}

button.danger {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
}

.save-success {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #e7f7e7, #d5f5d5);
  color: #2c7a2c;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(44, 122, 44, 0.1);
  animation: fade-in 0.5s ease;
  position: relative;
  z-index: 1;
}

.save-error {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ffebeb, #ffe0e0);
  color: #c53030;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(197, 48, 48, 0.1);
  animation: fade-in 0.5s ease;
  position: relative;
  z-index: 1;
}

@keyframes slide-in {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .pause-card {
    padding: 1.2rem;
    border-radius: 16px;
    width: 95%;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .game-stats {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-item {
    font-size: 1.1rem;
  }
  
  .value.highlight {
    font-size: 1.5rem;
  }
  
  .button-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .pause-card {
    width: 98%;
  }
}

@media (max-width: 380px) {
  .pause-container {
    padding: 0;
  }
  
  .pause-card {
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  .game-stats {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .stat-item {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .value.highlight {
    font-size: 1.3rem;
  }
  
  .button-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .save-success, .save-error {
    margin-top: 0.8rem;
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}

@media (max-height: 600px) {
  .pause-card {
    padding: 1rem;
    width: 98%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  .game-stats {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .stat-item {
    margin-bottom: 0.6rem;
    font-size: 1rem;
  }
  
  .value.highlight {
    font-size: 1.3rem;
  }
  
  .button-group {
    margin-bottom: 0.8rem;
  }
}

@media (max-height: 500px) {
  .pause-card {
    padding: 0.8rem;
    width: 100%;
  }
  
  h2 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }
  
  .game-stats {
    padding: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .stat-item {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  .value.highlight {
    font-size: 1.1rem;
  }
  
  .button-group {
    gap: 0.4rem;
    margin-bottom: 0.6rem;
  }
  
  button {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .save-success, .save-error {
    margin-top: 0.6rem;
    padding: 0.6rem;
    font-size: 0.8rem;
  }
}

@media screen and (max-height: 400px) and (orientation: landscape) {
  .pause-card {
    padding: 0.5rem;
    max-height: 90vh;
    overflow-y: auto;
    width: 100%;
  }
  
  h2 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  .game-stats {
    padding: 0.5rem;
    margin-bottom: 0.8rem;
  }
  
  .stat-item {
    font-size: 0.7rem;
    margin-bottom: 0.3rem;
  }
  
  .value.highlight {
    font-size: 0.9rem;
  }
  
  .button-group {
    flex-direction: row;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
  }
  
  button {
    padding: 0.4rem;
    font-size: 0.7rem;
  }
  
  .save-success, .save-error {
    margin-top: 0.5rem;
    padding: 0.5rem;
    font-size: 0.7rem;
  }
}
</style> 