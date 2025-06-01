<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import GameBoard from './components/GameBoard.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import PauseScreen from './components/PauseScreen.vue'

const gameStore = useGameStore()
const showWelcome = ref(true)

onMounted(() => {
  gameStore.fetchHighScores()
})

const startGame = (playerName: string, isLoadedGame = false) => {
  gameStore.setPlayerName(playerName)
  if (!isLoadedGame) {
    gameStore.initGame()
  }
  showWelcome.value = false
}

const restartGame = () => {
  showWelcome.value = true
}
</script>

<template>
  <div class="app-container">
    <header>
      <h1>消消乐游戏</h1>
    </header>
    
    <main>
      <GameBoard v-if="!showWelcome && !gameStore.isGameOver && !gameStore.isPaused" />
      <WelcomeScreen v-if="showWelcome" @start-game="startGame" />
      <GameOverScreen v-if="gameStore.isGameOver" @restart-game="restartGame" />
      <PauseScreen v-if="!showWelcome && !gameStore.isGameOver && gameStore.isPaused" />
    </main>
    
    <footer>
      <div class="footer-content">
        <p>Vue 3 + Pinia + Spring Boot</p>
      </div>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f7f9fc;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
}

header {
  background-color: #6d63ff;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  font-weight: 700;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

footer {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

.footer-content {
  font-size: 0.9rem;
  opacity: 0.8;
}

button {
  background-color: #6d63ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #5a52cc;
}

button:disabled {
  background-color: #b5b5b5;
  cursor: not-allowed;
}
</style>
