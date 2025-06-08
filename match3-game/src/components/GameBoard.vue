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
      
      <div class="game-controls">
        <button class="hint-button" @click="showHint" :disabled="gameStore.showingHint">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
        <button class="pause-button" @click="pauseGame">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
      </div>
    </div>

    <!-- 添加目标分数显示 -->
    <div class="level-target">
      <div class="target-info">
        <span class="label">目标分数:</span>
        <span class="value">{{ gameStore.targetScore }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
      </div>
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
            'special': tile.isSpecial,
            'hint': tile.isHint,
            'empty': tile.type === 0,
            [`special-${tile.specialType}`]: tile.isSpecial,
            [`type-${tile.type}`]: tile.type > 0
          }"
          @mousedown="handleMouseDown(tile.x, tile.y)"
          @mouseup="handleMouseUp(tile.x, tile.y)"
          @mouseover="handleMouseOver(tile.x, tile.y)"
          @touchstart="handleTouchStart(tile.x, tile.y, $event)"
          @touchmove="handleTouchMove($event)"
        >
          <div class="tile-inner">
            <!-- Empty tile (type 0) -->
            <svg v-if="tile.type === 0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="rgba(200, 200, 200, 0.2)" />
            </svg>
            
            <!-- Regular tiles -->
            <template v-else-if="!tile.isSpecial">
              <!-- Frog - Type 1 -->
              <svg v-if="tile.type === 1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Frog body -->
                <circle cx="50" cy="55" r="40" fill="#5cb85c" />
                <!-- Eyes -->
                <circle cx="35" cy="35" r="12" fill="white" />
                <circle cx="65" cy="35" r="12" fill="white" />
                <circle cx="35" cy="35" r="6" fill="black" />
                <circle cx="65" cy="35" r="6" fill="black" />
                <!-- Mouth -->
                <path d="M35,65 Q50,75 65,65" stroke="#388e3c" stroke-width="3" fill="none" />
              </svg>
              
              <!-- Blue Bear - Type 2 -->
              <svg v-else-if="tile.type === 2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Bear face -->
                <circle cx="50" cy="50" r="40" fill="#64b5f6" />
                <!-- Ears -->
                <circle cx="25" cy="25" r="12" fill="#42a5f5" />
                <circle cx="75" cy="25" r="12" fill="#42a5f5" />
                <!-- Eyes -->
                <circle cx="35" cy="45" r="6" fill="white" />
                <circle cx="65" cy="45" r="6" fill="white" />
                <circle cx="35" cy="45" r="3" fill="black" />
                <circle cx="65" cy="45" r="3" fill="black" />
                <!-- Nose -->
                <circle cx="50" cy="60" r="8" fill="#1565c0" />
                <!-- Mouth -->
                <path d="M40,70 Q50,75 60,70" stroke="#1565c0" stroke-width="2" fill="none" />
              </svg>
              
              <!-- Red Fox - Type 3 -->
              <svg v-else-if="tile.type === 3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Fox face -->
                <polygon points="50,15 20,50 30,80 70,80 80,50" fill="#ff7043" />
                <!-- Ears -->
                <polygon points="35,25 20,10 30,35" fill="#ff7043" />
                <polygon points="65,25 80,10 70,35" fill="#ff7043" />
                <!-- Eyes -->
                <circle cx="35" cy="45" r="5" fill="white" />
                <circle cx="65" cy="45" r="5" fill="white" />
                <circle cx="35" cy="45" r="2.5" fill="black" />
                <circle cx="65" cy="45" r="2.5" fill="black" />
                <!-- Nose -->
                <circle cx="50" cy="60" r="6" fill="#d84315" />
                <!-- Mouth -->
                <path d="M40,65 Q50,70 60,65" stroke="#d84315" stroke-width="2" fill="none" />
              </svg>
              
              <!-- Yellow Chick - Type 4 -->
              <svg v-else-if="tile.type === 4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Chick body -->
                <circle cx="50" cy="55" r="40" fill="#ffeb3b" />
                <!-- Eyes -->
                <circle cx="35" cy="45" r="5" fill="black" />
                <circle cx="65" cy="45" r="5" fill="black" />
                <!-- Beak -->
                <polygon points="50,55 40,65 60,65" fill="#ff9800" />
                <!-- Hat -->
                <circle cx="50" cy="25" r="10" fill="#f44336" />
              </svg>
              
              <!-- Pink Heart - Type 5 -->
              <svg v-else-if="tile.type === 5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Heart shape -->
                <path d="M50,80 C35,65 10,50 10,35 C10,20 25,20 35,30 L50,45 L65,30 C75,20 90,20 90,35 C90,50 65,65 50,80 Z" fill="#ec407a" />
                <!-- Shine -->
                <circle cx="30" cy="35" r="5" fill="white" opacity="0.5" />
              </svg>
              
              <!-- Green Coconut - Type 6 -->
              <svg v-else-if="tile.type === 6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Coconut shape -->
                <circle cx="50" cy="50" r="40" fill="#8bc34a" />
                <!-- Texture lines -->
                <path d="M30,30 Q50,20 70,30" stroke="#689f38" stroke-width="3" fill="none" />
                <path d="M30,50 Q50,40 70,50" stroke="#689f38" stroke-width="3" fill="none" />
                <path d="M30,70 Q50,60 70,70" stroke="#689f38" stroke-width="3" fill="none" />
                <!-- Leaf -->
                <path d="M50,15 C60,5 70,10 65,20 C75,15 85,20 75,25 L50,30 Z" fill="#7cb342" />
              </svg>

              <!-- Default tile (fallback for any unexpected type) -->
              <svg v-else viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#ccc" />
                <text x="50" y="55" text-anchor="middle" fill="#666" font-size="30">?</text>
              </svg>
            </template>

            <!-- Special Tiles -->
            <template v-else>
              <!-- Row Clearing Special Tile -->
              <svg v-if="tile.specialType === 'row'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="rowGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="white" stop-opacity="1" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <!-- Base shape based on the original tile type -->
                <circle cx="50" cy="50" r="40" :fill="getTileColor(tile.type)" />
                <!-- Arrow indicators -->
                <polygon points="10,50 40,30 40,70" fill="white" />
                <polygon points="90,50 60,30 60,70" fill="white" />
                <!-- Glow effect -->
                <circle cx="50" cy="50" r="45" fill="url(#rowGlow)" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              <!-- Column Clearing Special Tile -->
              <svg v-else-if="tile.specialType === 'column'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="colGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="white" stop-opacity="1" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <!-- Base shape based on the original tile type -->
                <circle cx="50" cy="50" r="40" :fill="getTileColor(tile.type)" />
                <!-- Arrow indicators -->
                <polygon points="50,10 30,40 70,40" fill="white" />
                <polygon points="50,90 30,60 70,60" fill="white" />
                <!-- Glow effect -->
                <circle cx="50" cy="50" r="45" fill="url(#colGlow)" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              <!-- Bomb Special Tile (clears 3x3 area) -->
              <svg v-else-if="tile.specialType === 'bomb'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="bombGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="#ffeb3b" stop-opacity="1" />
                    <stop offset="100%" stop-color="rgba(255,235,59,0)" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <!-- Bomb shape -->
                <circle cx="50" cy="60" r="35" fill="#444" />
                <!-- Fuse -->
                <path d="M50,25 Q60,15 70,20" stroke="#7b5d3f" stroke-width="4" fill="none" />
                <!-- Fuse spark -->
                <circle cx="70" cy="20" r="6" fill="#ffeb3b">
                  <animate attributeName="r" values="4;8;4" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <!-- Bomb highlight -->
                <circle cx="40" cy="50" r="10" fill="white" opacity="0.3" />
                <!-- Glow effect -->
                <circle cx="50" cy="50" r="48" fill="url(#bombGlow)" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.4;0.7" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>

              <!-- Color Bomb Special Tile (clears all of same color) -->
              <svg v-else-if="tile.specialType === 'color'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="rainbowGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="white" stop-opacity="1" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <!-- Star shape for color bomb -->
                <path d="M50,10 L61,39 L92,39 L67,57 L77,86 L50,68 L23,86 L33,57 L8,39 L39,39 Z" :fill="getTileColor(tile.type)">
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
                </path>
                <!-- Center glow -->
                <circle cx="50" cy="50" r="15" fill="white" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <!-- Outer glow -->
                <circle cx="50" cy="50" r="48" fill="url(#rainbowGlow)" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </template>
          </div>

          <!-- Explosion effect for special tiles -->
          <div v-if="tile.isMatched && tile.isSpecial" class="explosion-effect"></div>

          <!-- 为提示块添加闪烁效果 -->
          <div v-if="tile.isHint" class="hint-effect"></div>
        </div>
      </template>
    </div>

    <!-- 关卡完成提示 -->
    <div class="level-completed" v-if="gameStore.isLevelCompleted && !gameStore.isGameCompleted">
      <div class="level-completed-content">
        <h2>恭喜!</h2>
        <p>你完成了第 {{ gameStore.level }} 关!</p>
        <p>即将进入下一关...</p>
      </div>
    </div>

    <!-- 游戏通关提示 -->
    <div class="game-completed" v-if="gameStore.isGameCompleted">
      <div class="game-completed-content">
        <h2>恭喜通关!</h2>
        <p>你已经完成了所有 {{ gameStore.maxLevel }} 个关卡!</p>
        <p>最终得分: {{ gameStore.score }}</p>
        <button @click="restartGame" class="restart-button">重新开始</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import { computed, ref } from 'vue'

const gameStore = useGameStore()

const boardRows = computed(() => gameStore.board.length)
const boardCols = computed(() => gameStore.board[0]?.length || 0)

// 计算进度百分比
const progressPercentage = computed(() => {
  const percentage = (gameStore.score / gameStore.targetScore) * 100
  return Math.min(percentage, 100)
})

const isDragging = ref(false)
const startTile = ref({ x: -1, y: -1 })
const lastTouchedTile = ref({ x: -1, y: -1 })

const pauseGame = () => {
  gameStore.pauseGame()
}

const showHint = () => {
  gameStore.clearHints()
  gameStore.showHint()
}

const restartGame = () => {
  gameStore.initGame()
}

// Helper function to get tile color based on type
const getTileColor = (type: number) => {
  switch (type) {
    case 0: return '#cccccc' // 空方块颜色
    case 1: return '#5cb85c' // Frog green
    case 2: return '#64b5f6' // Bear blue
    case 3: return '#ff7043' // Fox orange
    case 4: return '#ffeb3b' // Chick yellow
    case 5: return '#ec407a' // Heart pink
    case 6: return '#8bc34a' // Coconut light green
    default: return '#cccccc'
  }
}

// Mouse events
const handleMouseDown = (x: number, y: number) => {
  if (gameStore.isGameOver) return
  
  // If there are any hints, clear them first
  if (gameStore.showingHint) {
    gameStore.clearHints()
  }
  
  // Ensure the tile has a valid type
  if (!gameStore.board[y][x].type || gameStore.board[y][x].type < 1 || gameStore.board[y][x].type > 6) {
    console.warn(`Fixed invalid tile type at (${x},${y}) during mouse down`);
    gameStore.validateBoard();
    return; // Don't proceed with invalid tiles
  }
  
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
    // Ensure both tiles have valid types
    if (!gameStore.board[startTile.value.y][startTile.value.x].type || 
        !gameStore.board[y][x].type ||
        gameStore.board[startTile.value.y][startTile.value.x].type < 1 ||
        gameStore.board[y][x].type < 1) {
      console.warn(`Invalid tile types during mouse over`);
      gameStore.validateBoard();
      isDragging.value = false;
      startTile.value = { x: -1, y: -1 };
      return;
    }
    
    // Get references to the actual tiles
    const firstTile = gameStore.board[startTile.value.y][startTile.value.x];
    const secondTile = gameStore.board[y][x];
    
    // Create a cloned board for checking matches without affecting the real board
    const boardClone = JSON.parse(JSON.stringify(gameStore.board));
    
    // Swap types in the clone
    const tempType = boardClone[firstTile.y][firstTile.x].type;
    boardClone[firstTile.y][firstTile.x].type = boardClone[secondTile.y][secondTile.x].type;
    boardClone[secondTile.y][secondTile.x].type = tempType;
    
    // Check for matches in the cloned board
    const hasMatch = gameStore.checkMatchesInClone(boardClone);
    
    // 只有能形成匹配时才执行交换
    if (hasMatch) {
      gameStore.swapTiles(firstTile, secondTile)
      
      // End dragging
      isDragging.value = false
      startTile.value = { x: -1, y: -1 }
    }
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
  
  // If there are any hints, clear them first
  if (gameStore.showingHint) {
    gameStore.clearHints()
  }
  
  // Ensure the tile has a valid type
  if (!gameStore.board[y][x].type || gameStore.board[y][x].type < 1 || gameStore.board[y][x].type > 6) {
    console.warn(`Fixed invalid tile type at (${x},${y}) during touch start`);
    gameStore.validateBoard();
    return; // Don't proceed with invalid tiles
  }
  
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
        // Ensure both tiles have valid types
        if (!gameStore.board[startTile.value.y][startTile.value.x].type || 
            !gameStore.board[y][x].type ||
            gameStore.board[startTile.value.y][startTile.value.x].type < 1 ||
            gameStore.board[y][x].type < 1) {
          console.warn(`Invalid tile types during touch move`);
          gameStore.validateBoard();
          isDragging.value = false;
          startTile.value = { x: -1, y: -1 };
          return;
        }
        
        // Get references to the actual tiles
        const firstTile = gameStore.board[startTile.value.y][startTile.value.x];
        const secondTile = gameStore.board[y][x];
        
        // Create a cloned board for checking matches without affecting the real board
        const boardClone = JSON.parse(JSON.stringify(gameStore.board));
        
        // Swap types in the clone
        const tempType = boardClone[firstTile.y][firstTile.x].type;
        boardClone[firstTile.y][firstTile.x].type = boardClone[secondTile.y][secondTile.x].type;
        boardClone[secondTile.y][secondTile.x].type = tempType;
        
        // Check for matches in the cloned board
        const hasMatch = gameStore.checkMatchesInClone(boardClone);
        
        // Only execute swap if it forms a match
        if (hasMatch) {
          gameStore.swapTiles(firstTile, secondTile)
          
          // End dragging
          isDragging.value = false
          startTile.value = { x: -1, y: -1 }
        }
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
  gap: 1rem;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

/* 添加关卡目标样式 */
.level-target {
  width: 100%;
  max-width: 500px;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  box-sizing: border-box;
}

.target-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #6d63ff, #ad63ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 关卡完成提示样式 */
.level-completed, .game-completed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.5s ease;
}

.level-completed-content, .game-completed-content {
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 50px rgba(109, 99, 255, 0.3);
  max-width: 90%;
  animation: popIn 0.5s ease;
}

.level-completed h2, .game-completed h2 {
  color: #6d63ff;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.level-completed p, .game-completed p {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.restart-button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.restart-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(109, 99, 255, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-info {
  display: flex;
  gap: 0.8rem;
  font-size: 1rem;
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  color: white;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(109, 99, 255, 0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.game-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
  z-index: -1;
  border-radius: inherit;
}

.game-controls {
  display: flex;
  gap: 1rem;
}

.pause-button, .hint-button {
  background: linear-gradient(135deg, #6d63ff, #ad63ff);
  border: none;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(109, 99, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pause-button::after, .hint-button::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pause-button:hover, .hint-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(109, 99, 255, 0.3);
}

.pause-button:hover::after, .hint-button:hover::after {
  opacity: 0.5;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.hint-button:disabled {
  background: linear-gradient(135deg, #b5b5b5, #cccccc);
  cursor: not-allowed;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  transform: none;
}

.hint-button:disabled::after {
  display: none;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.value {
  color: white;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
}

.game-board {
  display: grid;
  gap: 6px;
  background: linear-gradient(135deg, #e0e6f2, #d5daea);
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1), 
              inset 0 -2px 5px rgba(0, 0, 0, 0.05),
              inset 0 2px 5px rgba(255, 255, 255, 0.4);
  width: min(80vw, 450px);
  height: min(80vw, 450px);
  min-width: 280px;
  min-height: 280px;
  max-width: 95%;
  aspect-ratio: 1 / 1;
  touch-action: none;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto;
  position: relative;
}

.game-board::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 15%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 15%);
  pointer-events: none;
  z-index: 1;
}

.tile {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  user-select: none; /* Prevent text selection */
  touch-action: none; /* Prevent browser handling of touch events */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 60%);
  pointer-events: none;
}

.tile-inner {
  width: 85%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.3s ease, 
              box-shadow 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  z-index: 1;
}

.tile:hover .tile-inner {
  transform: scale(0.92);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
  animation: tileHover 1s infinite alternate ease-in-out;
}

@keyframes tileHover {
  0% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
  }
  100% {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.5);
  }
}

.tile:active .tile-inner {
  transform: scale(0.85);
}

.tile.selected .tile-inner {
  transform: scale(0.85);
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.7),
              0 4px 15px rgba(0, 0, 0, 0.3);
  animation: pulse-select 1.5s infinite alternate;
}

.tile.matched .tile-inner {
  animation: explode 0.6s ease forwards;
}

.tile.falling .tile-inner {
  animation: fall 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tile.new .tile-inner {
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Type colors with enhanced gradients */
.type-1 {
  background: linear-gradient(135deg, #81c784, #4caf50);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.type-2 {
  background: linear-gradient(135deg, #90caf9, #42a5f5);
  box-shadow: 0 5px 15px rgba(66, 165, 245, 0.3);
}

.type-3 {
  background: linear-gradient(135deg, #ffab91, #ff7043);
  box-shadow: 0 5px 15px rgba(255, 112, 67, 0.3);
}

.type-4 {
  background: linear-gradient(135deg, #fff176, #ffeb3b);
  box-shadow: 0 5px 15px rgba(255, 235, 59, 0.3);
}

.type-5 {
  background: linear-gradient(135deg, #f48fb1, #ec407a);
  box-shadow: 0 5px 15px rgba(236, 64, 122, 0.3);
}

.type-6 {
  background: linear-gradient(135deg, #aed581, #8bc34a);
  box-shadow: 0 5px 15px rgba(139, 195, 74, 0.3);
}

/* Special Tile Styles */
.tile.special {
  z-index: 2;
}

.tile.special::before {
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), transparent 70%);
}

.tile.special .tile-inner {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
  animation: glow-pulse 1.5s infinite alternate;
}

.tile.special-bomb .tile-inner {
  box-shadow: 0 0 20px rgba(255, 235, 59, 0.8);
}

.tile.special-color .tile-inner {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  animation: rainbow-pulse 2s infinite alternate;
}

/* Explosion Effect */
.explosion-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300%;
  height: 300%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 220, 100, 0.8) 20%, rgba(255, 150, 50, 0.6) 40%, rgba(255, 50, 50, 0.4) 60%, transparent 80%);
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  animation: explosion 0.8s ease-out forwards;
}

.tile.special-bomb .explosion-effect {
  width: 500%;
  height: 500%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 220, 100, 0.8) 15%, rgba(255, 150, 50, 0.6) 30%, rgba(255, 50, 50, 0.5) 45%, rgba(100, 50, 255, 0.4) 60%, transparent 80%);
  animation: big-explosion 1s ease-out forwards;
}

.tile.special-color .explosion-effect {
  width: 800%;
  height: 800%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 100, 255, 0.7) 20%, rgba(100, 100, 255, 0.6) 40%, rgba(100, 255, 100, 0.5) 60%, rgba(255, 255, 100, 0.4) 80%, transparent 90%);
  animation: color-explosion 1.2s ease-out forwards;
}

@keyframes pulse-select {
  0% {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.7),
                0 4px 15px rgba(0, 0, 0, 0.3);
    transform: scale(0.85) rotate(0deg);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.9),
                0 4px 20px rgba(0, 0, 0, 0.4);
    transform: scale(0.85) rotate(3deg);
  }
}

@keyframes explode {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  20% {
    transform: scale(1.2);
    opacity: 0.9;
  }
  40% {
    transform: scale(1.1);
    opacity: 0.8;
    box-shadow: 0 0 30px currentColor, 0 0 50px currentColor;
  }
  100% {
    transform: scale(0);
    opacity: 0;
    box-shadow: 0 0 100px currentColor, 0 0 100px currentColor;
  }
}

@keyframes fall {
  0% {
    transform: translateY(-150%) scale(0.8) rotate(-10deg);
    opacity: 0.7;
  }
  60% {
    transform: translateY(10%) scale(1.1) rotate(5deg);
  }
  80% {
    transform: translateY(-5%) scale(0.95) rotate(-2deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0);
    opacity: 1;
  }
}

@keyframes pop-in {
  0% {
    transform: scale(0) rotate(15deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(-5deg);
    opacity: 1;
  }
  80% {
    transform: scale(0.9) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes glow-pulse {
  0% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
}

@keyframes rainbow-pulse {
  0% {
    box-shadow: 0 0 15px rgba(255, 100, 100, 0.8);
    transform: rotate(-3deg) scale(0.98);
  }
  33% {
    box-shadow: 0 0 20px rgba(100, 255, 100, 0.8);
    transform: rotate(0deg) scale(1);
  }
  66% {
    box-shadow: 0 0 15px rgba(100, 100, 255, 0.8);
    transform: rotate(3deg) scale(1.02);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 100, 0.8);
    transform: rotate(0deg) scale(1);
  }
}

@keyframes explosion {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes big-explosion {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes color-explosion {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }
  40% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* 提示效果样式 */
.tile.hint {
  z-index: 3;
  animation: hint-zoom 1.2s infinite alternate ease-in-out;
}

.hint-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
  pointer-events: none;
  z-index: 5;
  animation: hint-glow 1.5s infinite alternate;
}

@keyframes hint-zoom {
  0% {
    transform: scale(0.92) rotate(-1deg);
  }
  100% {
    transform: scale(1.08) rotate(1deg);
  }
}

@keyframes hint-glow {
  0% {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3);
  }
}

.tile.empty {
  background: rgba(200, 200, 200, 0.1);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.tile.empty .tile-inner {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .game-container {
    padding: 0;
  }
  
  .game-header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    width: 100%;
    max-width: 100%;
  }
  
  .game-info {
    flex-direction: row;
    gap: 0.4rem;
    width: 100%;
    font-size: 0.9rem;
    padding: 0.5rem;
    justify-content: space-around;
  }
  
  .info-item {
    gap: 0.3rem;
  }
  
  .game-controls {
    width: 100%;
    justify-content: center;
    gap: 0.8rem;
  }
  
  .game-board {
    gap: 4px;
    padding: 6px;
    width: min(85vw, 380px);
    height: min(85vw, 380px);
    min-width: 250px;
    min-height: 250px;
  }
  
  .tile {
    border-radius: 8px;
  }
  
  .tile-inner {
    width: 90%;
    height: 90%;
  }
}

@media (max-width: 480px) {
  .game-board {
    width: min(90vw, 350px);
    height: min(90vw, 350px);
    min-width: 220px;
    min-height: 220px;
    gap: 3px;
    padding: 5px;
  }
}

@media (max-width: 380px) {
  .game-container {
    padding: 0;
    gap: 0.5rem;
  }
  
  .game-info {
    gap: 0.2rem;
    font-size: 0.75rem;
    padding: 0.4rem 0.5rem;
  }
  
  .info-item {
    gap: 0.2rem;
  }
  
  .pause-button, .hint-button {
    width: 36px;
    height: 36px;
  }
  
  .pause-button svg, .hint-button svg {
    width: 18px;
    height: 18px;
  }
  
  .game-board {
    gap: 2px;
    padding: 4px;
    width: min(98vw, 320px);
    height: min(98vw, 320px);
    min-width: 200px;
    min-height: 200px;
  }
}

@media (max-height: 600px) {
  .game-container {
    gap: 0.3rem;
  }
  
  .game-header {
    padding: 0;
  }
  
  .game-info {
    font-size: 0.75rem;
    padding: 0.3rem;
  }
  
  .game-board {
    gap: 2px;
    padding: 3px;
    width: min(90vw, 300px);
    height: min(90vw, 300px);
    min-width: 200px;
    min-height: 200px;
  }
}

@media (max-height: 500px) {
  .game-container {
    gap: 0.2rem;
  }
  
  .game-header {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .game-info {
    font-size: 0.7rem;
    padding: 0.3rem;
    max-width: 60%;
  }
  
  .pause-button, .hint-button {
    width: 32px;
    height: 32px;
  }
  
  .pause-button svg, .hint-button svg {
    width: 16px;
    height: 16px;
  }
  
  .game-board {
    gap: 2px;
    padding: 3px;
    width: min(98vw, 280px);
    height: min(98vw, 280px);
    min-width: 180px;
    min-height: 180px;
  }
}
</style> 