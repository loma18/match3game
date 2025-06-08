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
      <GameOverScreen v-if="gameStore.isGameOver && !gameStore.isGameCompleted" @restart-game="restartGame" />
      <PauseScreen v-if="!showWelcome && !gameStore.isGameOver && gameStore.isPaused && !gameStore.isGameCompleted" />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f7f9fc, #edf1f7);
  color: #333;
  min-height: 100vh;
  overflow: hidden;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 10% 10%, rgba(255, 100, 255, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 90% 20%, rgba(100, 100, 255, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(100, 255, 100, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 100, 0.05) 0%, transparent 30%);
  z-index: -2;
  animation: backgroundShift 20s infinite alternate ease-in-out;
}

@keyframes backgroundShift {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

/* 添加动态气泡元素 */
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(109, 99, 255, 0.1) 0%, transparent 8%),
    radial-gradient(circle at 70% 20%, rgba(255, 99, 132, 0.1) 0%, transparent 10%),
    radial-gradient(circle at 40% 70%, rgba(99, 255, 132, 0.1) 0%, transparent 12%),
    radial-gradient(circle at 80% 60%, rgba(255, 206, 86, 0.1) 0%, transparent 9%);
  background-size: 200% 200%;
  z-index: -1;
  animation: bubbleFloat 15s infinite alternate ease-in-out;
}

@keyframes bubbleFloat {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

#app {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  max-width: 1200px;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

header {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  padding: 0.8rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(109, 99, 255, 0.2);
  position: relative;
  z-index: 10;
  width: 100%;
  overflow: hidden;
}

header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
  background-size: cover;
  z-index: -1;
}

/* 添加动画光效 */
header::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: rotate(45deg);
  animation: headerShine 6s infinite linear;
  z-index: 0;
}

@keyframes headerShine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 0;
  width: 100%;
  max-width: 100vw;
}

main::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(109, 99, 255, 0.05), transparent 70%);
  z-index: -1;
  animation: pulseGlow 8s infinite alternate ease-in-out;
}

@keyframes pulseGlow {
  0% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

footer {
  background: linear-gradient(135deg, #333, #444);
  color: white;
  padding: 1.2rem;
  text-align: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-content {
  font-size: 0.9rem;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(109, 99, 255, 0.15);
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  transition: all 0.5s ease;
  opacity: 0;
}

button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(109, 99, 255, 0.25);
}

button:hover::after {
  animation: buttonShine 1.5s forwards;
}

@keyframes buttonShine {
  0% {
    opacity: 0;
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    opacity: 1;
    transform: translateX(100%) rotate(45deg);
  }
}

button:active {
  transform: translateY(0);
  box-shadow: 0 5px 15px rgba(109, 99, 255, 0.15);
}

button:disabled {
  background: linear-gradient(135deg, #b5b5b5, #cccccc);
  cursor: not-allowed;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  transform: none;
}

@media (max-width: 768px) {
  header {
    padding: 0.6rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  main {
    padding: 0;
  }
  
  button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 500px) {
  #app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0;
  }
  
  main {
    padding: 0;
  }
}

@media (max-width: 380px) {
  header {
    padding: 0.4rem;
  }
  
  h1 {
    font-size: 1.3rem;
  }
  
  main {
    padding: 0;
  }
  
  button {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-height: 600px) {
  header {
    padding: 0.4rem;
  }
  
  h1 {
    font-size: 1.2rem;
  }
  
  main {
    padding: 0;
  }
}

@media (max-height: 500px) {
  header {
    padding: 0.3rem;
  }
  
  h1 {
    font-size: 1.1rem;
  }
  
  main {
    padding: 0;
  }
}

@media screen and (max-height: 400px) and (orientation: landscape) {
  .app-container {
    height: 100%;
  }
  
  header {
    padding: 0.2rem;
  }
  
  h1 {
    font-size: 1rem;
  }
  
  main {
    padding: 0;
  }
}
</style>
