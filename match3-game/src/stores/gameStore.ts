import { defineStore } from 'pinia'
import axios from 'axios'

export interface Tile {
  id: number
  type: number
  x: number
  y: number
  isSelected: boolean
  isMatched: boolean
  isNew?: boolean
  isFalling?: boolean
  isSpecial?: boolean
  specialType?: 'bomb' | 'row' | 'column' | 'color'
  isHint?: boolean
}

// Match interfaces for type safety
export interface HorizontalMatch {
  startX: number
  y: number
  length: number
  type: number
}

export interface VerticalMatch {
  x: number
  startY: number
  length: number
  type: number
}

export interface Matches {
  horizontal: HorizontalMatch[]
  vertical: VerticalMatch[]
}

export interface GameState {
  board: Tile[][]
  score: number
  level: number
  playerName: string
  isGameOver: boolean
  loading: boolean
  highScores: any[]
  savedGames: any[]
  hasSavedGame: boolean
  isPaused: boolean
  currentMatches: Matches
  hintTimer: number | null
  lastMoveTime: number
  showingHint: boolean
  targetScore: number
  isLevelCompleted: boolean
  isGameCompleted: boolean
  maxLevel: number
}

const API_BASE_URL = '/api';

// Add this deep clone function after the interface definitions but before the defineStore
function deepCloneBoard(board: Tile[][]): Tile[][] {
  return board.map(row => row.map(tile => ({...tile})));
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    board: [],
    score: 0,
    level: 1,
    playerName: 'Player',
    isGameOver: false,
    loading: false,
    highScores: [],
    savedGames: [],
    hasSavedGame: false,
    isPaused: false,
    currentMatches: {
      horizontal: [],
      vertical: []
    },
    hintTimer: null,
    lastMoveTime: Date.now(),
    showingHint: false,
    targetScore: 1000, // 第一关的目标分数
    isLevelCompleted: false,
    isGameCompleted: false,
    maxLevel: 5 // 游戏总共5个关卡
  }),

  actions: {
    initGame() {
      this.score = 0
      this.level = 1
      this.isGameOver = false
      this.isPaused = false
      this.isLevelCompleted = false
      this.isGameCompleted = false
      this.targetScore = 1000 // 第一关的目标分数
      this.generateBoard(8, 8)
      this.validateBoard() // Ensure all tiles are valid at game start
      this.resetHintTimer()
    },

    generateBoard(rows: number, cols: number) {
      this.board = []
      for (let y = 0; y < rows; y++) {
        const row: Tile[] = []
        for (let x = 0; x < cols; x++) {
          // 确保类型在1-6之间
          const tileType = Math.floor(Math.random() * 6) + 1
          
          row.push({
            id: y * cols + x,
            type: tileType,
            x,
            y,
            isSelected: false,
            isMatched: false
          })
        }
        this.board.push(row)
      }
      
      // Check for initial matches and regenerate if needed
      while (this.checkForMatches()) {
        this.regenerateMatches()
      }
      
      // 最终检查确保没有类型为0的方块
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (this.board[y][x].type < 1 || this.board[y][x].type > 6) {
            this.board[y][x].type = Math.floor(Math.random() * 6) + 1
          }
        }
      }
    },

    selectTile(x: number, y: number) {
      this.resetHintTimer()
      this.clearHints()

      const selectedTiles = this.getSelectedTiles()
      const selectedTile = this.board[y][x]
      
      // If the selected tile is a special tile, activate its effect
      if (selectedTile.isSpecial) {
        this.activateSpecialTile(selectedTile)
        return
      }
      
      if (selectedTiles.length === 0) {
        this.board[y][x].isSelected = true
      } else if (selectedTiles.length === 1) {
        const firstTile = selectedTiles[0]
        
        // Check if tiles are adjacent
        const isAdjacent = 
          (Math.abs(firstTile.x - x) === 1 && firstTile.y === y) || 
          (Math.abs(firstTile.y - y) === 1 && firstTile.x === x)
        
        if (isAdjacent) {
          // 预检查交换是否会形成匹配
          const tempType = firstTile.type
          this.board[firstTile.y][firstTile.x].type = selectedTile.type
          this.board[y][x].type = tempType
          
          // 检查是否形成匹配
          const hasMatch = this.checkForMatches()
          
          // 交换回来
          this.board[y][x].type = this.board[firstTile.y][firstTile.x].type
          this.board[firstTile.y][firstTile.x].type = tempType
          
          // 只有能形成匹配时才执行交换
          if (hasMatch) {
            this.board[y][x].isSelected = true
            this.swapTiles(firstTile, this.board[y][x])
          } else {
            // 不能形成匹配，取消选择
            this.board[firstTile.y][firstTile.x].isSelected = false
          }
        } else {
          // Deselect the first tile and select the new one
          this.board[firstTile.y][firstTile.x].isSelected = false
          this.board[y][x].isSelected = true
        }
      }
    },

    swapTiles(tile1: Tile, tile2: Tile) {
      this.resetHintTimer()
      this.clearHints()
      
      // Save original properties
      const tempType = tile1.type
      const tempSpecial = tile1.isSpecial
      const tempSpecialType = tile1.specialType
      
      // Swap types and special properties
      this.board[tile1.y][tile1.x].type = tile2.type
      this.board[tile1.y][tile1.x].isSpecial = tile2.isSpecial
      this.board[tile1.y][tile1.x].specialType = tile2.specialType
      
      this.board[tile2.y][tile2.x].type = tempType
      this.board[tile2.y][tile2.x].isSpecial = tempSpecial
      this.board[tile2.y][tile2.x].specialType = tempSpecialType
      
      // Deselect tiles
      this.board[tile1.y][tile1.x].isSelected = false
      this.board[tile2.y][tile2.x].isSelected = false
      
      // Validate board state
      this.validateBoard();
      
      // 前端已经检查过是否形成匹配，这里直接处理匹配
      this.checkForMatches() // 更新匹配状态
      
      // Process matches with a slight delay to show the swap animation
      setTimeout(() => {
        this.processMatches()
      }, 300)
    },

    getSelectedTiles(): Tile[] {
      const selected: Tile[] = []
      for (const row of this.board) {
        for (const tile of row) {
          if (tile.isSelected) {
            selected.push(tile)
          }
        }
      }
      return selected
    },

    checkForMatches(): boolean {
      let hasMatches = false;
      
      // Store hint status before resetting matched state
      const hintTiles = [];
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].isHint) {
            hintTiles.push({x, y, type: this.board[y][x].type});
          }
        }
      }
      
      // Reset matched state
      for (const row of this.board) {
        for (const tile of row) {
          tile.isMatched = false;
        }
      }

      // Store all matches for special tile creation
      const horizontalMatches: HorizontalMatch[] = [];
      const verticalMatches: VerticalMatch[] = [];
      
      // Check for horizontal matches
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length - 2; x++) {
          const type = this.board[y][x].type;
          if (
            type !== 0 &&
            type === this.board[y][x + 1].type &&
            type === this.board[y][x + 2].type
          ) {
            // Find length of match (could be more than 3)
            let matchLength = 3;
            let startX = x;
            
            while (x + matchLength < this.board[0].length && 
                  this.board[y][x + matchLength].type === type) {
              matchLength++;
            }
            
            // Mark all tiles in match
            for (let i = 0; i < matchLength; i++) {
              this.board[y][startX + i].isMatched = true;
            }
            
            // Add to matches list
            horizontalMatches.push({
              startX: startX,
              y: y,
              length: matchLength,
              type: type
            });
            
            hasMatches = true;
            x = startX + matchLength - 1; // Skip ahead
          }
        }
      }
      
      // Check for vertical matches
      for (let x = 0; x < this.board[0].length; x++) {
        for (let y = 0; y < this.board.length - 2; y++) {
          const type = this.board[y][x].type;
          if (
            type !== 0 &&
            type === this.board[y + 1][x].type &&
            type === this.board[y + 2][x].type
          ) {
            // Find length of match
            let matchLength = 3;
            let startY = y;
            
            while (y + matchLength < this.board.length && 
                  this.board[y + matchLength][x].type === type) {
              matchLength++;
            }
            
            // Mark all tiles in match
            for (let i = 0; i < matchLength; i++) {
              this.board[startY + i][x].isMatched = true;
            }
            
            // Add to matches list
            verticalMatches.push({
              x: x,
              startY: startY,
              length: matchLength,
              type: type
            });
            
            hasMatches = true;
            y = startY + matchLength - 1; // Skip ahead
          }
        }
      }
      
      // Remember matches for special tile creation
      this.currentMatches = {
        horizontal: horizontalMatches,
        vertical: verticalMatches
      };
      
      // Restore hint status
      for (const {x, y, type} of hintTiles) {
        if (this.board[y][x]) {
          this.board[y][x].isHint = true;
          // Also ensure the type is preserved
          if (this.board[y][x].type === 0) {
            this.board[y][x].type = type;
          }
        }
      }
      
      // Validate the board to ensure all tiles are in a good state
      this.validateBoard();
      
      return hasMatches;
    },

    processMatches() {
      // Count matches and add to score
      let matchCount = 0
      for (const row of this.board) {
        for (const tile of row) {
          if (tile.isMatched) {
            matchCount++
          }
        }
      }
      
      // Calculate score bonus based on match size
      const matchBonus = matchCount > 3 ? (matchCount - 3) * 5 : 0
      const levelBonus = this.level * 2
      const pointsEarned = matchCount * (10 + matchBonus + levelBonus)
      
      this.score += pointsEarned

      // Potentially create special tiles before removing matched tiles
      this.createSpecialTiles()
      
      // 检查是否达到关卡目标
      if (this.score >= this.targetScore && !this.isLevelCompleted) {
        if (this.level >= this.maxLevel) {
          // 通关所有关卡
          this.isGameCompleted = true
          this.isLevelCompleted = true
          this.saveScore()
          return
        } else {
          // 完成当前关卡
          this.isLevelCompleted = true
          
          // 延迟一段时间后进入下一关
          setTimeout(() => {
            this.nextLevel()
          }, 2000)
        }
      }
      
      // 原有的升级逻辑保留，但不再作为主要通关条件
      if (this.score >= this.level * 1000) {
        this.level++
      }
      
      // Remove matched tiles (set type to 0)
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          // 只清除非特殊方块
          if (this.board[y][x].isMatched && !this.board[y][x].isSpecial) {
            this.board[y][x].type = 0;
          }
        }
      }
      
      // Validate the board state to catch any issues
      this.validateBoard();
      
      // Make tiles fall down
      this.applyGravity()
      
      // Fill empty spaces with new tiles
      this.fillEmptySpaces()
      
      // Validate the board again after filling
      this.validateBoard();
      
      // Check for new matches
      if (this.checkForMatches()) {
        // If there are new matches, process them again
        setTimeout(() => {
          this.processMatches()
        }, 500)
      } else {
        // Check if there are possible moves
        if (!this.hasPossibleMoves() && !this.isLevelCompleted && !this.isGameCompleted) {
          this.isGameOver = true
          this.saveScore()
        }
      }
    },

    applyGravity() {
      let hasChanges = false;
      
      for (let x = 0; x < this.board[0].length; x++) {
        for (let y = this.board.length - 1; y > 0; y--) {
          if (this.board[y][x].type === 0) {
            // Find the first non-empty tile above
            for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
              if (this.board[aboveY][x].type !== 0) {
                // Move tile down
                this.board[y][x].type = this.board[aboveY][x].type;
                this.board[y][x].isFalling = true;
                // Also transfer special properties if any
                this.board[y][x].isSpecial = this.board[aboveY][x].isSpecial;
                this.board[y][x].specialType = this.board[aboveY][x].specialType;
                
                // Clear the tile that moved
                this.board[aboveY][x].type = 0;
                this.board[aboveY][x].isSpecial = false;
                this.board[aboveY][x].specialType = undefined;
                
                hasChanges = true;
                break;
              }
            }
          }
        }
      }
      
      // If we had changes, validate the board state
      if (hasChanges) {
        this.validateBoard();
      }
      
      // Reset falling flag after animation time
      setTimeout(() => {
        for (let y = 0; y < this.board.length; y++) {
          for (let x = 0; x < this.board[0].length; x++) {
            if (this.board[y][x].isFalling) {
              this.board[y][x].isFalling = false;
            }
          }
        }
        
        // Final validation after animation completes
        this.validateBoard();
      }, 300);
    },

    fillEmptySpaces() {
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].type === 0) {
            // 确保生成的类型在1-6之间
            const newType = Math.floor(Math.random() * 6) + 1;
            this.board[y][x].type = newType;
            this.board[y][x].isNew = true;
            
            // 确保方块不是特殊块，并重置所有特殊状态
            this.board[y][x].isSpecial = false;
            this.board[y][x].specialType = undefined;
            this.board[y][x].isMatched = false;
            this.board[y][x].isSelected = false;
            this.board[y][x].isHint = false;
          }
        }
      }
      
      // Final validation to ensure no tiles have invalid types
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].type < 1 || this.board[y][x].type > 6) {
            this.board[y][x].type = Math.floor(Math.random() * 6) + 1;
          }
        }
      }
      
      // Reset new flag after animation time
      setTimeout(() => {
        for (let y = 0; y < this.board.length; y++) {
          for (let x = 0; x < this.board[0].length; x++) {
            if (this.board[y][x].isNew) {
              this.board[y][x].isNew = false;
            }
          }
        }
      }, 300);
    },

    regenerateMatches() {
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].isMatched) {
            // 确保生成的类型在1-6之间
            this.board[y][x].type = Math.floor(Math.random() * 6) + 1
            this.board[y][x].isMatched = false
          }
        }
      }
    },

    hasPossibleMoves(): boolean {
      const rows = this.board.length
      const cols = this.board[0].length
      
      // Check horizontal moves
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols - 1; x++) {
          // Swap with right neighbor
          const temp = this.board[y][x].type
          this.board[y][x].type = this.board[y][x + 1].type
          this.board[y][x + 1].type = temp
          
          const hasMatch = this.checkForMatches()
          
          // Swap back
          this.board[y][x + 1].type = this.board[y][x].type
          this.board[y][x].type = temp
          
          if (hasMatch) {
            return true
          }
        }
      }
      
      // Check vertical moves
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols; x++) {
          // Swap with below neighbor
          const temp = this.board[y][x].type
          this.board[y][x].type = this.board[y + 1][x].type
          this.board[y + 1][x].type = temp
          
          const hasMatch = this.checkForMatches()
          
          // Swap back
          this.board[y + 1][x].type = this.board[y][x].type
          this.board[y][x].type = temp
          
          if (hasMatch) {
            return true
          }
        }
      }
      
      return false
    },

    async saveGame() {
      try {
        this.loading = true;
        const boardStateJson = JSON.stringify(this.board);
        
        const gameSave = {
          playerName: this.playerName,
          score: this.score,
          level: this.level,
          boardState: boardStateJson,
          isActive: true
        };
        
        await axios.post(`${API_BASE_URL}/saves`, gameSave);
        this.hasSavedGame = true;
        return true;
      } catch (error) {
        console.error('Error saving game:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async loadGame() {
      try {
        this.loading = true;
        const response = await axios.get(`${API_BASE_URL}/saves/load/${this.playerName}`);
        
        if (response.data) {
          const savedGame = response.data;
          this.score = savedGame.score;
          this.level = savedGame.level;
          
          // 解析游戏板状态
          const loadedBoard = JSON.parse(savedGame.boardState);
          
          // 验证和修复加载的游戏板
          for (let y = 0; y < loadedBoard.length; y++) {
            for (let x = 0; x < loadedBoard[y].length; x++) {
              const tile = loadedBoard[y][x];
              
              // 确保类型有效
              if (tile.type === undefined || tile.type === null || tile.type < 1 || tile.type > 6) {
                tile.type = Math.floor(Math.random() * 6) + 1;
              }
              
              // 更新坐标，以防保存时没有正确保存
              tile.x = x;
              tile.y = y;
              
              // 重置状态标志
              tile.isSelected = false;
              tile.isMatched = false;
              tile.isNew = false;
              tile.isFalling = false;
              
              // 如果是特殊方块，确保specialType有效
              if (tile.isSpecial && !['bomb', 'row', 'column', 'color'].includes(tile.specialType)) {
                tile.isSpecial = false;
                tile.specialType = undefined;
              }
            }
          }
          
          this.board = loadedBoard;
          this.isGameOver = false;
          this.isPaused = false;
          this.hasSavedGame = true;
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error loading game:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async checkForSavedGame() {
      try {
        const response = await axios.get(`${API_BASE_URL}/saves/player/${this.playerName}`);
        this.savedGames = response.data;
        this.hasSavedGame = this.savedGames.length > 0 && 
                           this.savedGames.some(save => save.active);
        return this.hasSavedGame;
      } catch (error) {
        console.error('Error checking for saved games:', error);
        this.hasSavedGame = false;
        return false;
      }
    },
    
    pauseGame() {
      if (this.hintTimer !== null) {
        clearTimeout(this.hintTimer as unknown as number)
        this.hintTimer = null
      }
      this.isPaused = true
    },
    
    resumeGame() {
      this.isPaused = false
      this.resetHintTimer()
    },

    async saveScore() {
      try {
        this.loading = true
        await axios.post(`${API_BASE_URL}/scores`, {
          playerName: this.playerName,
          score: this.score,
          level: this.level
        })
        await this.fetchHighScores()
      } catch (error) {
        console.error('Error saving score:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchHighScores() {
      try {
        this.loading = true
        const response = await axios.get(`${API_BASE_URL}/scores`)
        this.highScores = response.data
      } catch (error) {
        console.error('Error fetching high scores:', error)
      } finally {
        this.loading = false
      }
    },

    setPlayerName(name: string) {
      this.playerName = name
    },

    createSpecialTiles() {
      // Look for matches with length >= 4 to create special tiles
      const { horizontal, vertical } = this.currentMatches
      
      // L or T shaped matches (intersection of horizontal and vertical)
      for (const hMatch of horizontal) {
        for (const vMatch of vertical) {
          // Check if they intersect
          const intersectX = vMatch.x
          const intersectY = hMatch.y
          
          if (intersectX >= hMatch.startX && 
              intersectX < hMatch.startX + hMatch.length &&
              intersectY >= vMatch.startY && 
              intersectY < vMatch.startY + vMatch.length) {
            
            // Create a color bomb (special tile) at the intersection
            const specialTile = this.board[intersectY][intersectX]
            specialTile.isSpecial = true
            specialTile.specialType = 'color'
            specialTile.isMatched = false  // Don't remove this tile
            return  // Only create one special tile per match
          }
        }
      }
      
      // Check for horizontal matches of length 4+
      for (const match of horizontal) {
        if (match.length >= 4) {
          // Create a row-clearing special tile
          const specialX = match.startX + Math.floor(match.length / 2)
          const specialY = match.y
          
          const specialTile = this.board[specialY][specialX]
          specialTile.isSpecial = true
          specialTile.specialType = match.length >= 5 ? 'bomb' : 'row'
          specialTile.isMatched = false  // Don't remove this tile
          return  // Only create one special tile per match
        }
      }
      
      // Check for vertical matches of length 4+
      for (const match of vertical) {
        if (match.length >= 4) {
          // Create a column-clearing special tile
          const specialX = match.x
          const specialY = match.startY + Math.floor(match.length / 2)
          
          const specialTile = this.board[specialY][specialX]
          specialTile.isSpecial = true
          specialTile.specialType = match.length >= 5 ? 'bomb' : 'column'
          specialTile.isMatched = false  // Don't remove this tile
          return  // Only create one special tile per match
        }
      }
    },

    activateSpecialTile(tile: Tile) {
      const { x, y, specialType, type } = tile
      
      // Animation will be triggered by marking tiles as matched
      
      switch (specialType) {
        case 'row':
          // Clear entire row
          for (let i = 0; i < this.board[0].length; i++) {
            this.board[y][i].isMatched = true
          }
          break
          
        case 'column':
          // Clear entire column
          for (let i = 0; i < this.board.length; i++) {
            this.board[i][x].isMatched = true
          }
          break
          
        case 'bomb':
          // Clear 3x3 area around the tile
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const newY = y + dy
              const newX = x + dx
              
              if (newY >= 0 && newY < this.board.length &&
                  newX >= 0 && newX < this.board[0].length) {
                this.board[newY][newX].isMatched = true
              }
            }
          }
          break
          
        case 'color':
          // Clear all tiles of the same type
          const targetType = type
          
          for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[0].length; x++) {
              if (this.board[y][x].type === targetType) {
                this.board[y][x].isMatched = true
              }
            }
          }
          break
      }
      
      // Clear the special tile itself
      tile.isSpecial = false
      tile.specialType = undefined
      tile.isMatched = true
      
      // Process the matches
      setTimeout(() => {
        this.processMatches()
      }, 300)
    },

    resetHintTimer() {
      // Clear any existing timer
      if (this.hintTimer !== null) {
        clearTimeout(this.hintTimer as unknown as number);
        this.hintTimer = null;
      }
      
      // Clear any existing hints to prevent conflicts
      this.clearHints();
      
      // Update last move time
      this.lastMoveTime = Date.now();
      
      // 移除自动提示功能，不再设置新的定时器
    },
    
    clearHints() {
      this.showingHint = false;
      
      // Simply remove the hint flag without touching any other properties
      for (const row of this.board) {
        for (const tile of row) {
          if (tile.isHint) {
            tile.isHint = false;
          }
        }
      }
      
      // Final validation to ensure all tiles have valid types (just in case)
      this.validateBoard();
    },
    
    showHint() {
      if (this.isPaused || this.isGameOver) return
      
      // Make sure the board has valid tiles before looking for hints
      this.validateBoard();
      
      const hint = this.findPossibleMove()
      if (hint) {
        // Validate the tiles
        if (this.board[hint.y1] && this.board[hint.y1][hint.x1] && 
            this.board[hint.y2] && this.board[hint.y2][hint.x2] &&
            this.board[hint.y1][hint.x1].type >= 1 && this.board[hint.y1][hint.x1].type <= 6 && 
            this.board[hint.y2][hint.x2].type >= 1 && this.board[hint.y2][hint.x2].type <= 6) {
          
          // Simply flag the tiles as hints without modifying their types
          this.board[hint.y1][hint.x1].isHint = true;
          this.board[hint.y2][hint.x2].isHint = true;
          this.showingHint = true;
          
          // Set a timer to clear the hints
          setTimeout(() => {
            this.clearHints();
          }, 3000);
        }
      }
    },
    
    findPossibleMove() {
      const rows = this.board.length;
      const cols = this.board[0].length;
      
      // Check horizontal swaps
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols - 1; x++) {
          // Skip empty tiles
          if (this.board[y][x].type === 0 || this.board[y][x + 1].type === 0) continue;
          
          // Create a deep clone of the board to avoid side effects
          const boardClone = deepCloneBoard(this.board);
          
          // Swap types in the clone
          const temp = boardClone[y][x].type;
          boardClone[y][x].type = boardClone[y][x + 1].type;
          boardClone[y][x + 1].type = temp;
          
          // Check for matches in the cloned board
          const hasMatch = this.checkMatchesInClone(boardClone);
          
          if (hasMatch) {
            return { x1: x, y1: y, x2: x + 1, y2: y };
          }
        }
      }
      
      // Check vertical swaps
      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols; x++) {
          // Skip empty tiles
          if (this.board[y][x].type === 0 || this.board[y + 1][x].type === 0) continue;
          
          // Create a deep clone of the board to avoid side effects
          const boardClone = deepCloneBoard(this.board);
          
          // Swap types in the clone
          const temp = boardClone[y][x].type;
          boardClone[y][x].type = boardClone[y + 1][x].type;
          boardClone[y + 1][x].type = temp;
          
          // Check for matches in the cloned board
          const hasMatch = this.checkMatchesInClone(boardClone);
          
          if (hasMatch) {
            return { x1: x, y1: y, x2: x, y2: y + 1 };
          }
        }
      }
      
      return null;
    },
    
    // Add a new method to check matches in a cloned board without affecting the original
    checkMatchesInClone(boardClone: Tile[][]): boolean {
      let hasMatches = false;
      
      // Check for horizontal matches
      for (let y = 0; y < boardClone.length; y++) {
        for (let x = 0; x < boardClone[0].length - 2; x++) {
          const type = boardClone[y][x].type;
          if (
            type !== 0 &&
            type === boardClone[y][x + 1].type &&
            type === boardClone[y][x + 2].type
          ) {
            hasMatches = true;
            return hasMatches; // Return early once a match is found
          }
        }
      }
      
      // Check for vertical matches
      for (let x = 0; x < boardClone[0].length; x++) {
        for (let y = 0; y < boardClone.length - 2; y++) {
          const type = boardClone[y][x].type;
          if (
            type !== 0 &&
            type === boardClone[y + 1][x].type &&
            type === boardClone[y + 2][x].type
          ) {
            hasMatches = true;
            return hasMatches; // Return early once a match is found
          }
        }
      }
      
      return hasMatches;
    },

    validateBoard() {
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          // Check for invalid tile types
          if (!this.board[y][x].type || this.board[y][x].type < 1 || this.board[y][x].type > 6) {
            console.warn(`Fixed invalid tile type at (${x},${y}): ${this.board[y][x].type}`);
            this.board[y][x].type = Math.floor(Math.random() * 6) + 1;
          }
          
          // Ensure coordinates are correct
          this.board[y][x].x = x;
          this.board[y][x].y = y;
        }
      }
    },

    // 添加进入下一关的方法
    nextLevel() {
      this.level++
      // 每关的目标分数递增
      this.targetScore = this.level * 1000
      this.isLevelCompleted = false
      
      // 重新生成游戏板
      this.generateBoard(8, 8)
      this.validateBoard()
      this.resetHintTimer()
    }
  }
}) 