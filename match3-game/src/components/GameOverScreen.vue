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
        <div class="score-item">
          <span class="label">目标分数:</span>
          <span class="value">{{ gameStore.targetScore }}</span>
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
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.gameover-card {
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

.gameover-card::before {
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

.gameover-card::after {
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
  color: #ff4757;
  margin-bottom: 1.2rem;
  font-size: 1.8rem;
  text-shadow: 0 2px 10px rgba(255, 71, 87, 0.2);
  position: relative;
  z-index: 1;
}

.final-score {
  background: linear-gradient(135deg, #f0f7ff, #e6f0ff);
  border-radius: 16px;
  padding: 1.2rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.score-item:last-child {
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

.high-scores {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

h3 {
  color: #555;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.scores-list {
  max-height: 200px;
  overflow-y: auto;
}

.score-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
}

.score-row:last-child {
  border-bottom: none;
}

.score-row.current-player {
  background: linear-gradient(135deg, #edf6ff, #e4f2ff);
  font-weight: bold;
  box-shadow: inset 0 0 15px rgba(109, 99, 255, 0.15);
}

.score-row:hover {
  background-color: #f5f9ff;
  transform: translateX(5px);
}

.rank {
  color: #6d63ff;
  font-weight: 700;
}

.name {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.score {
  font-weight: 700;
  text-align: right;
  color: #555;
}

button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
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

@media (max-width: 768px) {
  .gameover-card {
    padding: 1.2rem;
    border-radius: 16px;
    width: 95%;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .final-score {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .score-item {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
  
  .value.highlight {
    font-size: 1.5rem;
  }
  
  .high-scores {
    margin-bottom: 1.2rem;
  }
  
  h3 {
    font-size: 1.1rem;
  }
  
  .scores-list {
    max-height: 150px;
  }
  
  .score-row {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .gameover-card {
    width: 98%;
  }
}

@media (max-width: 380px) {
  .gameover-container {
    padding: 0;
  }
  
  .gameover-card {
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  .final-score {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .score-item {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .value.highlight {
    font-size: 1.3rem;
  }
  
  .high-scores {
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1rem;
  }
  
  .scores-list {
    max-height: 130px;
  }
  
  .score-row {
    padding: 0.4rem;
    font-size: 0.75rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-height: 600px) {
  .gameover-card {
    padding: 1rem;
    width: 98%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  .final-score {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .score-item {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .value.highlight {
    font-size: 1.3rem;
  }
  
  .high-scores {
    margin-bottom: 0.8rem;
  }
  
  .scores-list {
    max-height: 120px;
  }
}

@media (max-height: 500px) {
  .gameover-card {
    padding: 0.8rem;
    width: 100%;
  }
  
  h2 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }
  
  .final-score {
    padding: 0.6rem;
    margin-bottom: 0.6rem;
  }
  
  .score-item {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
  
  .value.highlight {
    font-size: 1.1rem;
  }
  
  .high-scores {
    margin-bottom: 0.6rem;
  }
  
  h3 {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .scores-list {
    max-height: 100px;
  }
  
  .score-row {
    padding: 0.3rem;
    font-size: 0.7rem;
  }
  
  button {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

@media screen and (max-height: 400px) and (orientation: landscape) {
  .gameover-card {
    padding: 0.5rem;
    max-height: 90vh;
    overflow-y: auto;
    width: 100%;
  }
  
  h2 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  .final-score {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .score-item {
    font-size: 0.7rem;
    margin-bottom: 0.2rem;
  }
  
  .value.highlight {
    font-size: 0.9rem;
  }
  
  .high-scores {
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
  
  .scores-list {
    max-height: 80px;
  }
  
  button {
    padding: 0.4rem;
    font-size: 0.7rem;
  }
}
</style> 