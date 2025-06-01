<template>
  <div class="game-container">
    <div class="game-header">
      <div class="game-info">
        <div class="info-item">
          <span class="label">Player:</span>
          <span class="value">{{ gameStore.playerName }}</span>
        </div>
        <div class="info-item">
          <span class="label">Score:</span>
          <span class="value">{{ gameStore.score }}</span>
        </div>
        <div class="info-item">
          <span class="label">Level:</span>
          <span class="value">{{ gameStore.level }}</span>
        </div>
      </div>
      
      <button class="pause-button" @click="pauseGame">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
    </div>

    <div 
      class="game-board" 
      :style="{ 
        gridTemplateColumns: `repeat(${boardCols}, 1fr)`,
        gridTemplateRows: `repeat(${boardRows}, 1fr)`
      }"
      @mouseleave="handleMouseLeave"
      @touchend="handleTouchEnd"
    >
      <template v-for="row in gameStore.board">
        <div 
          v-for="tile in row"
          :key="tile.id"
          class="tile"
          :class="{ 
            'selected': tile.isSelected, 
            'matched': tile.isMatched,
            'falling': tile.isFalling,
            'new': tile.isNew,
            [`type-${tile.type}`]: true
          }"
          @mousedown="handleMouseDown(tile.x, tile.y)"
          @mouseup="handleMouseUp(tile.x, tile.y)"
          @mouseover="handleMouseOver(tile.x, tile.y)"
          @touchstart="handleTouchStart(tile.x, tile.y, $event)"
          @touchmove="handleTouchMove($event)"
        >
          <div class="tile-inner"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { computed, ref } from 'vue'

const gameStore = useGameStore()

const boardRows = computed(() => gameStore.board.length)
const boardCols = computed(() => gameStore.board[0]?.length || 0)

const isDragging = ref(false)
const startTile = ref({ x: -1, y: -1 })
const lastTouchedTile = ref({ x: -1, y: -1 })

const pauseGame = () => {
  gameStore.pauseGame()
}

// Mouse events
const handleMouseDown = (x: number, y: number) => {
  if (gameStore.isGameOver) return
  
  isDragging.value = true
  startTile.value = { x, y }
}

const handleMouseOver = (x: number, y: number) => {
  if (!isDragging.value || gameStore.isGameOver) return
  
  // Only process if it's adjacent to start tile
  const isAdjacent = 
    (Math.abs(startTile.value.x - x) === 1 && startTile.value.y === y) || 
    (Math.abs(startTile.value.y - y) === 1 && startTile.value.x === x)
  
  if (isAdjacent) {
    // Swap tiles
    const firstTile = gameStore.board[startTile.value.y][startTile.value.x]
    const secondTile = gameStore.board[y][x]
    gameStore.swapTiles(firstTile, secondTile)
    
    // End dragging
    isDragging.value = false
    startTile.value = { x: -1, y: -1 }
  }
}

const handleMouseUp = (x: number, y: number) => {
  if (!isDragging.value || gameStore.isGameOver) return
  
  // If it's the same tile as we started on, select it (original click behavior)
  if (x === startTile.value.x && y === startTile.value.y) {
    gameStore.selectTile(x, y)
  } else {
    // Handle as mouseOver (for drag completion)
    handleMouseOver(x, y)
  }
  
  isDragging.value = false
  startTile.value = { x: -1, y: -1 }
}

const handleMouseLeave = () => {
  isDragging.value = false
  startTile.value = { x: -1, y: -1 }
}

// Touch events
const handleTouchStart = (x: number, y: number, event: TouchEvent) => {
  if (gameStore.isGameOver) return
  
  event.preventDefault() // Prevent scrolling
  isDragging.value = true
  startTile.value = { x, y }
  lastTouchedTile.value = { x, y }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || gameStore.isGameOver) return
  
  event.preventDefault() // Prevent scrolling
  
  // Get touch position
  const touch = event.touches[0]
  const board = event.currentTarget as HTMLElement
  const rect = board.getBoundingClientRect()
  
  // Calculate the tile under the touch point
  const tileWidth = rect.width / boardCols.value
  const tileHeight = rect.height / boardRows.value
  
  const x = Math.floor((touch.clientX - rect.left) / tileWidth)
  const y = Math.floor((touch.clientY - rect.top) / tileHeight)
  
  // Make sure we're within bounds
  if (x >= 0 && x < boardCols.value && y >= 0 && y < boardRows.value) {
    // Only process if it's different from the last tile we processed
    if (x !== lastTouchedTile.value.x || y !== lastTouchedTile.value.y) {
      lastTouchedTile.value = { x, y }
      
      // Only process if it's adjacent to start tile
      const isAdjacent = 
        (Math.abs(startTile.value.x - x) === 1 && startTile.value.y === y) || 
        (Math.abs(startTile.value.y - y) === 1 && startTile.value.x === x)
      
      if (isAdjacent) {
        // Swap tiles
        const firstTile = gameStore.board[startTile.value.y][startTile.value.x]
        const secondTile = gameStore.board[y][x]
        gameStore.swapTiles(firstTile, secondTile)
        
        // End dragging
        isDragging.value = false
        startTile.value = { x: -1, y: -1 }
      }
    }
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  startTile.value = { x: -1, y: -1 }
}

// For backward compatibility
const handleTileClick = (x: number, y: number) => {
  if (!gameStore.isGameOver) {
    gameStore.selectTile(x, y)
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.game-info {
  display: flex;
  gap: 2rem;
  font-size: 1.2rem;
  background-color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pause-button {
  background-color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #6d63ff;
  transition: all 0.3s ease;
}

.pause-button:hover {
  background-color: #f0f0ff;
  transform: scale(1.05);
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: bold;
  color: #555;
}

.value {
  color: #6d63ff;
  font-weight: bold;
}

.game-board {
  display: grid;
  gap: 8px;
  background-color: #e0e6f2;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  aspect-ratio: 1 / 1;
  touch-action: none; /* Prevent browser handling of touch events */
}

.tile {
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  user-select: none; /* Prevent text selection */
  touch-action: none; /* Prevent browser handling of touch events */
}

.tile-inner {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: currentColor;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.tile:hover .tile-inner {
  transform: scale(0.92);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

.tile:active .tile-inner {
  transform: scale(0.85);
}

.tile.selected .tile-inner {
  transform: scale(0.85);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
}

.tile.matched .tile-inner {
  animation: pulse 0.5s infinite alternate;
}

.tile.falling .tile-inner {
  animation: fall 0.3s ease-in-out;
}

.tile.new .tile-inner {
  animation: pop-in 0.3s ease-out;
}

.type-1 {
  background-color: #ff6b6b;
}

.type-2 {
  background-color: #4ecdc4;
}

.type-3 {
  background-color: #ffd166;
}

.type-4 {
  background-color: #6b76ff;
}

.type-5 {
  background-color: #9d65c9;
}

.type-6 {
  background-color: #5cb85c;
}

@keyframes pulse {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes fall {
  0% {
    transform: translateY(-100%) scale(0.8);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .game-info {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .game-board {
    gap: 4px;
    padding: 8px;
  }
}
</style> 