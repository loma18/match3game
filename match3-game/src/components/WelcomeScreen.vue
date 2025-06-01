<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <h2>Welcome to Match-3 Game!</h2>
      <p>Match 3 or more tiles of the same color to score points</p>
      
      <div class="form-group">
        <label for="playerName">Your Name:</label>
        <input 
          type="text" 
          id="playerName" 
          v-model="playerName" 
          placeholder="Enter your name"
          maxlength="20"
          @keyup.enter="checkNameAndProceed"
        />
      </div>
      
      <div v-if="hasSavedGame" class="saved-game-info">
        <h3>You have a saved game</h3>
        <p>Would you like to continue your previous game?</p>
        <div class="button-group">
          <button @click="loadSavedGame" class="primary">Continue Game</button>
          <button @click="startNewGame" class="secondary">Start New Game</button>
        </div>
      </div>
      
      <button v-else @click="checkNameAndProceed" :disabled="!isValidName">Start Game</button>
      
      <div class="high-scores" v-if="gameStore.highScores.length > 0">
        <h3>High Scores</h3>
        <div class="scores-list">
          <div class="score-item" v-for="(score, index) in gameStore.highScores.slice(0, 5)" :key="index">
            <span class="rank">{{ index + 1 }}</span>
            <span class="name">{{ score.playerName }}</span>
            <span class="score">{{ score.score }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'

const emit = defineEmits(['start-game'])
const gameStore = useGameStore()
const playerName = ref('')
const hasSavedGame = ref(false)
const isChecking = ref(false)

const isValidName = computed(() => {
  return playerName.value.trim().length > 0
})

const checkNameAndProceed = async () => {
  if (!isValidName.value) return;
  
  // Check if player has a saved game
  gameStore.setPlayerName(playerName.value);
  isChecking.value = true;
  hasSavedGame.value = await gameStore.checkForSavedGame();
  isChecking.value = false;
  
  if (!hasSavedGame.value) {
    startNewGame();
  }
}

const startNewGame = () => {
  if (isValidName.value) {
    emit('start-game', playerName.value);
  }
}

const loadSavedGame = async () => {
  if (isValidName.value) {
    const success = await gameStore.loadGame();
    if (success) {
      emit('start-game', playerName.value, true);
    } else {
      // If load fails, start a new game
      startNewGame();
    }
  }
}

watch(playerName, async (newName) => {
  if (newName.trim().length > 0 && !isChecking.value) {
    gameStore.setPlayerName(newName);
    hasSavedGame.value = await gameStore.checkForSavedGame();
  }
}, { debounce: 500 });
</script>

<style scoped>
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.welcome-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  color: #6d63ff;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #6d63ff;
}

button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  width: 100%;
}

.saved-game-info {
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid #d0e1fd;
}

.saved-game-info h3 {
  color: #3a66db;
  margin-bottom: 0.5rem;
}

.saved-game-info p {
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.button-group button {
  flex: 1;
  margin-top: 0;
}

button.primary {
  background-color: #6d63ff;
}

button.secondary {
  background-color: #8f8f8f;
}

.high-scores {
  margin: 2rem 0;
  text-align: left;
}

h3 {
  color: #555;
  margin-bottom: 1rem;
  text-align: center;
}

.scores-list {
  background-color: #f7f9fc;
  border-radius: 4px;
  overflow: hidden;
}

.score-item {
  display: grid;
  grid-template-columns: 40px 1fr 80px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.score-item:last-child {
  border-bottom: none;
}

.rank {
  font-weight: bold;
  color: #6d63ff;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  font-weight: bold;
  text-align: right;
}
</style> 