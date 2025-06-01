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
}

const API_BASE_URL = '/api';

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
    isPaused: false
  }),

  actions: {
    initGame() {
      this.score = 0
      this.level = 1
      this.isGameOver = false
      this.isPaused = false
      this.generateBoard(8, 8)
    },

    generateBoard(rows: number, cols: number) {
      this.board = []
      for (let y = 0; y < rows; y++) {
        const row: Tile[] = []
        for (let x = 0; x < cols; x++) {
          row.push({
            id: y * cols + x,
            type: Math.floor(Math.random() * 6) + 1,
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
    },

    selectTile(x: number, y: number) {
      const selectedTiles = this.getSelectedTiles()
      
      if (selectedTiles.length === 0) {
        this.board[y][x].isSelected = true
      } else if (selectedTiles.length === 1) {
        const firstTile = selectedTiles[0]
        
        // Check if tiles are adjacent
        const isAdjacent = 
          (Math.abs(firstTile.x - x) === 1 && firstTile.y === y) || 
          (Math.abs(firstTile.y - y) === 1 && firstTile.x === x)
        
        if (isAdjacent) {
          this.board[y][x].isSelected = true
          this.swapTiles(firstTile, this.board[y][x])
        } else {
          // Deselect the first tile and select the new one
          this.board[firstTile.y][firstTile.x].isSelected = false
          this.board[y][x].isSelected = true
        }
      }
    },

    swapTiles(tile1: Tile, tile2: Tile) {
      // Save original positions
      const tempType = tile1.type
      
      // Swap types
      this.board[tile1.y][tile1.x].type = tile2.type
      this.board[tile2.y][tile2.x].type = tempType
      
      // Deselect tiles
      this.board[tile1.y][tile1.x].isSelected = false
      this.board[tile2.y][tile2.x].isSelected = false
      
      // Check for matches after swap
      if (!this.checkForMatches()) {
        // If no matches, swap back
        this.board[tile1.y][tile1.x].type = tempType
        this.board[tile2.y][tile2.x].type = this.board[tile1.y][tile1.x].type
      } else {
        // Process matches with a slight delay to show the swap animation
        setTimeout(() => {
          this.processMatches()
        }, 300)
      }
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
      let hasMatches = false
      
      // Reset matched state
      for (const row of this.board) {
        for (const tile of row) {
          tile.isMatched = false
        }
      }
      
      // Check for horizontal matches
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length - 2; x++) {
          const type = this.board[y][x].type
          if (
            type !== 0 &&
            type === this.board[y][x + 1].type &&
            type === this.board[y][x + 2].type
          ) {
            this.board[y][x].isMatched = true
            this.board[y][x + 1].isMatched = true
            this.board[y][x + 2].isMatched = true
            hasMatches = true
          }
        }
      }
      
      // Check for vertical matches
      for (let y = 0; y < this.board.length - 2; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          const type = this.board[y][x].type
          if (
            type !== 0 &&
            type === this.board[y + 1][x].type &&
            type === this.board[y + 2][x].type
          ) {
            this.board[y][x].isMatched = true
            this.board[y + 1][x].isMatched = true
            this.board[y + 2][x].isMatched = true
            hasMatches = true
          }
        }
      }
      
      return hasMatches
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
      
      // Level up every 1000 points
      if (this.score >= this.level * 1000) {
        this.level++
      }
      
      // Remove matched tiles (set type to 0)
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].isMatched) {
            this.board[y][x].type = 0
          }
        }
      }
      
      // Make tiles fall down
      this.applyGravity()
      
      // Fill empty spaces with new tiles
      this.fillEmptySpaces()
      
      // Check for new matches
      if (this.checkForMatches()) {
        // If there are new matches, process them again
        setTimeout(() => {
          this.processMatches()
        }, 500)
      } else {
        // Check if there are possible moves
        if (!this.hasPossibleMoves()) {
          this.isGameOver = true
          this.saveScore()
        }
      }
    },

    applyGravity() {
      for (let x = 0; x < this.board[0].length; x++) {
        for (let y = this.board.length - 1; y > 0; y--) {
          if (this.board[y][x].type === 0) {
            // Find the first non-empty tile above
            for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
              if (this.board[aboveY][x].type !== 0) {
                // Move tile down
                this.board[y][x].type = this.board[aboveY][x].type
                this.board[y][x].isFalling = true
                this.board[aboveY][x].type = 0
                break
              }
            }
          }
        }
      }
      
      // Reset falling flag after animation time
      setTimeout(() => {
        for (let y = 0; y < this.board.length; y++) {
          for (let x = 0; x < this.board[0].length; x++) {
            if (this.board[y][x].isFalling) {
              this.board[y][x].isFalling = false
            }
          }
        }
      }, 300);
    },

    fillEmptySpaces() {
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].type === 0) {
            this.board[y][x].type = Math.floor(Math.random() * 6) + 1
            this.board[y][x].isNew = true
          }
        }
      }
      
      // Reset new flag after animation time
      setTimeout(() => {
        for (let y = 0; y < this.board.length; y++) {
          for (let x = 0; x < this.board[0].length; x++) {
            if (this.board[y][x].isNew) {
              this.board[y][x].isNew = false
            }
          }
        }
      }, 300);
    },

    regenerateMatches() {
      for (let y = 0; y < this.board.length; y++) {
        for (let x = 0; x < this.board[0].length; x++) {
          if (this.board[y][x].isMatched) {
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
          this.board = JSON.parse(savedGame.boardState);
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
      this.isPaused = true;
    },
    
    resumeGame() {
      this.isPaused = false;
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
    }
  }
}) 