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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
}

.pause-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h2 {
  color: #6d63ff;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.game-stats {
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #555;
}

.value {
  color: #333;
}

.value.highlight {
  color: #6d63ff;
  font-size: 1.4rem;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.button-group button {
  flex: 1;
  padding: 0.75rem 0;
  font-size: 1.1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button.primary {
  background-color: #6d63ff;
  color: white;
}

button.primary:hover {
  background-color: #5a52cc;
}

button.secondary {
  background-color: #8f8f8f;
  color: white;
}

button.secondary:hover {
  background-color: #777;
}

button:disabled {
  background-color: #b5b5b5;
  cursor: not-allowed;
}

.save-success {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #e7f7e7;
  color: #2c7a2c;
  border-radius: 4px;
  font-weight: bold;
}

.save-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebeb;
  color: #c53030;
  border-radius: 4px;
  font-weight: bold;
}
</style> 