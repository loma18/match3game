<template>
  <div class="gameover-container">
    <div class="gameover-card">
      <h2>Game Over!</h2>
      
      <div class="final-score">
        <div class="score-item">
          <span class="label">Player:</span>
          <span class="value">{{ gameStore.playerName }}</span>
        </div>
        <div class="score-item">
          <span class="label">Score:</span>
          <span class="value highlight">{{ gameStore.score }}</span>
        </div>
        <div class="score-item">
          <span class="label">Level:</span>
          <span class="value">{{ gameStore.level }}</span>
        </div>
      </div>
      
      <div class="high-scores" v-if="gameStore.highScores.length > 0">
        <h3>High Scores</h3>
        <div class="scores-list">
          <div 
            class="score-row" 
            v-for="(score, index) in gameStore.highScores.slice(0, 5)" 
            :key="index"
            :class="{ 'current-player': score.playerName === gameStore.playerName && score.score === gameStore.score }"
          >
            <span class="rank">{{ index + 1 }}</span>
            <span class="name">{{ score.playerName }}</span>
            <span class="score">{{ score.score }}</span>
          </div>
        </div>
      </div>
      
      <button @click="restartGame">Play Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'

const emit = defineEmits(['restart-game'])
const gameStore = useGameStore()

const restartGame = () => {
  emit('restart-game')
}
</script>

<style scoped>
.gameover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.gameover-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  color: #ff6b6b;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.final-score {
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.score-item:last-child {
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

.high-scores {
  margin-bottom: 2rem;
}

h3 {
  color: #555;
  margin-bottom: 1rem;
}

.scores-list {
  background-color: #f7f9fc;
  border-radius: 4px;
  overflow: hidden;
}

.score-row {
  display: grid;
  grid-template-columns: 40px 1fr 80px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.score-row:last-child {
  border-bottom: none;
}

.score-row.current-player {
  background-color: #f0f7ff;
  font-weight: bold;
}

.rank {
  color: #6d63ff;
}

.name {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  font-weight: bold;
  text-align: right;
}

button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  width: 100%;
}
</style> 