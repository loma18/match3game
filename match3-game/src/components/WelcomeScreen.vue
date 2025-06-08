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
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.welcome-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(109, 99, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(173, 99, 255, 0.1) 0%, transparent 30%);
  animation: welcomeGlow 10s infinite alternate ease-in-out;
  z-index: -1;
}

@keyframes welcomeGlow {
  0% {
    background-position: 0% 0%;
    opacity: 0.5;
  }
  100% {
    background-position: 100% 100%;
    opacity: 1;
  }
}

.welcome-card {
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
  animation: cardAppear 0.6s ease-out;
  transform-origin: center;
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(173, 99, 255, 0.2), rgba(109, 99, 255, 0.1));
  border-radius: 50%;
  z-index: 0;
  animation: bubbleFloat 15s infinite alternate ease-in-out;
}

.welcome-card::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(109, 99, 255, 0.1), rgba(173, 99, 255, 0.2));
  border-radius: 50%;
  z-index: 0;
  animation: bubbleFloat 20s infinite alternate-reverse ease-in-out;
}

@keyframes bubbleFloat {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(10px, -10px) scale(1.1);
  }
  100% {
    transform: translate(-10px, 10px) scale(0.9);
  }
}

h2 {
  color: #6d63ff;
  margin-bottom: 1.2rem;
  font-size: 1.8rem;
  text-shadow: 0 2px 10px rgba(109, 99, 255, 0.2);
  position: relative;
  z-index: 1;
  animation: titleGlow 3s infinite alternate;
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 2px 10px rgba(109, 99, 255, 0.2);
  }
  100% {
    text-shadow: 0 2px 20px rgba(109, 99, 255, 0.4), 0 0 40px rgba(109, 99, 255, 0.1);
  }
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 2rem;
  text-align: left;
  position: relative;
  z-index: 1;
  animation: fadeIn 1.2s ease-out;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
  text-align: left;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e6f2;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #6d63ff;
  box-shadow: 0 0 0 3px rgba(109, 99, 255, 0.2);
  animation: inputPulse 1.5s infinite alternate;
}

@keyframes inputPulse {
  0% {
    box-shadow: 0 0 0 3px rgba(109, 99, 255, 0.2);
  }
  100% {
    box-shadow: 0 0 0 5px rgba(109, 99, 255, 0.3);
  }
}

.saved-game-info {
  background: linear-gradient(135deg, #f0f7ff, #e6f0ff);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(109, 99, 255, 0.2);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05),
              inset 0 -2px 5px rgba(0, 0, 0, 0.03),
              inset 0 2px 5px rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  animation: fadeIn 1.4s ease-out, infoGlow 3s infinite alternate;
}

@keyframes infoGlow {
  0% {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05),
                inset 0 -2px 5px rgba(0, 0, 0, 0.03),
                inset 0 2px 5px rgba(255, 255, 255, 0.5);
  }
  100% {
    box-shadow: 0 8px 25px rgba(58, 102, 219, 0.1),
                inset 0 -2px 5px rgba(0, 0, 0, 0.03),
                inset 0 2px 5px rgba(255, 255, 255, 0.5),
                0 0 15px rgba(58, 102, 219, 0.1);
  }
}

.saved-game-info h3 {
  color: #3a66db;
  margin-bottom: 0.7rem;
  font-size: 1.3rem;
}

.saved-game-info p {
  margin-bottom: 1.2rem;
  color: #555;
}

.button-group {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 1.6s ease-out;
}

button {
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(109, 99, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin-top: 1rem;
  animation: fadeIn 1.8s ease-out;
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
  animation: buttonShine 1.5s forwards;
}

@keyframes buttonShine {
  0% {
    left: -100%;
    opacity: 0.5;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

button:active {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(109, 99, 255, 0.2);
}

button:disabled {
  background: linear-gradient(135deg, #b5b5b5, #cccccc);
  cursor: not-allowed;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  transform: none;
}

button.primary {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
}

button.secondary {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}

.high-scores {
  margin: 1.5rem 0;
  position: relative;
  z-index: 1;
  animation: fadeIn 2s ease-out;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: #6d63ff;
  position: relative;
  display: inline-block;
}

h3::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #6d63ff, transparent);
  animation: lineGrow 2s infinite alternate;
}

@keyframes lineGrow {
  0% {
    width: 30%;
    opacity: 0.5;
  }
  100% {
    width: 70%;
    opacity: 1;
  }
}

.scores-list {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.score-item {
  padding: 0.6rem;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.score-item:last-child {
  border-bottom: none;
}

.score-item:hover {
  background: rgba(109, 99, 255, 0.05);
  transform: translateX(5px);
}

.rank {
  font-weight: bold;
  color: #6d63ff;
  width: 20px;
}

.name {
  flex: 1;
  text-align: left;
  padding: 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 1.2rem;
    border-radius: 16px;
    width: 95%;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  input {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
  
  .saved-game-info {
    padding: 1.2rem;
    margin: 1.5rem 0;
  }
  
  .button-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.8rem;
    font-size: 1rem;
  }
  
  .high-scores {
    margin: 1rem 0;
  }
  
  h3 {
    font-size: 1.1rem;
  }
  
  .scores-list {
    max-height: 150px;
  }
  
  .score-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .welcome-card {
    width: 98%;
  }
}

@media (max-width: 380px) {
  .welcome-container {
    padding: 0;
  }
  
  .welcome-card {
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  p {
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
  }
  
  .form-group {
    margin-bottom: 1.2rem;
  }
  
  input {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .saved-game-info {
    padding: 1rem;
    margin: 1.2rem 0;
  }
  
  button {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}

@media (max-height: 600px) {
  .welcome-card {
    padding: 1rem;
    width: 98%;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .button-group {
    margin-bottom: 0.8rem;
  }
  
  .high-scores {
    margin: 0.8rem 0;
  }
  
  .scores-list {
    max-height: 120px;
  }
}

@media (max-height: 500px) {
  .welcome-card {
    padding: 0.8rem;
    width: 100%;
  }
  
  h2 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }
  
  p {
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .form-group {
    margin-bottom: 0.8rem;
  }
  
  label {
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
  }
  
  input {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
  
  button {
    padding: 0.5rem;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  
  .high-scores {
    margin: 0.6rem 0;
  }
  
  h3 {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .scores-list {
    max-height: 100px;
  }
  
  .score-item {
    padding: 0.4rem;
    font-size: 0.7rem;
  }
}

@media screen and (max-height: 400px) and (orientation: landscape) {
  .welcome-card {
    padding: 0.5rem;
    max-height: 90vh;
    overflow-y: auto;
    width: 100%;
  }
  
  h2 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  p {
    font-size: 0.7rem;
    margin-bottom: 0.6rem;
  }
  
  .form-group {
    margin-bottom: 0.6rem;
  }
  
  label {
    margin-bottom: 0.2rem;
    font-size: 0.7rem;
  }
  
  input {
    padding: 0.3rem;
    font-size: 0.7rem;
  }
  
  button {
    padding: 0.4rem;
    font-size: 0.7rem;
    margin-top: 0.4rem;
  }
}
</style> 