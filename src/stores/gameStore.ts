// ===== src/stores/gameStore.ts =====

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BoardGrid, BoardCell, GridDimensions, GridPosition, CellValue } from '@/types'

export const useGameStore = defineStore('game', () => {
  // State
  const board = ref<BoardGrid>([])
  const dimensions = ref<GridDimensions>({ rows: 12, cols: 12, mines: 20 })
  const highlightedCells = ref<Map<string, 'safe' | 'mine'>>(new Map())

  // Getters
  const boardCells = computed(() => board.value.flat())
  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${dimensions.value.cols}, 40px)`,
  }))

  const totalCells = computed(() => dimensions.value.rows * dimensions.value.cols)
  const revealedCells = computed(() => boardCells.value.filter((cell) => cell.value !== '').length)

  // Actions
  function initializeBoard() {
    board.value = []
    highlightedCells.value.clear()

    for (let r = 0; r < dimensions.value.rows; r++) {
      const row: BoardCell[] = []
      for (let c = 0; c < dimensions.value.cols; c++) {
        row.push({
          value: '',
          row: r,
          col: c,
        })
      }
      board.value.push(row)
    }
  }

  function updateCell(row: number, col: number, value: CellValue) {
    if (board.value[row]?.[col]) {
      board.value[row][col].value = value
    }
  }

  function setBoardSize(rows: number, cols: number, mines?: number) {
    dimensions.value = {
      rows,
      cols,
      mines: mines ?? dimensions.value.mines,
    }
    initializeBoard()
  }

  function clearHighlights() {
    highlightedCells.value.clear()
  }

  function highlightCell(row: number, col: number, type: 'safe' | 'mine') {
    const key = `${row},${col}`
    highlightedCells.value.set(key, type)
  }

  function isHighlighted(row: number, col: number): boolean {
    const key = `${row},${col}`
    return highlightedCells.value.has(key)
  }

  function getHighlightType(row: number, col: number): 'safe' | 'mine' | undefined {
    const key = `${row},${col}`
    return highlightedCells.value.get(key)
  }

  function getCell(row: number, col: number): BoardCell | undefined {
    return board.value[row]?.[col]
  }

  function resetBoard() {
    initializeBoard()
  }

  function applyBoard(newBoard: CellValue[][]) {
    if (
      newBoard.length !== dimensions.value.rows ||
      newBoard[0]?.length !== dimensions.value.cols
    ) {
      setBoardSize(newBoard.length, newBoard[0]?.length || 0)
    }

    for (let r = 0; r < newBoard.length; r++) {
      for (let c = 0; c < newBoard[r].length; c++) {
        updateCell(r, c, newBoard[r][c])
      }
    }
  }

  function getCellValue(row: number, col: number): CellValue {
    return board.value[row]?.[col]?.value || ''
  }

  function setCellValue(row: number, col: number, value: CellValue) {
    updateCell(row, col, value)
  }

  function getBoardStats() {
    let mines = 0
    let flags = 0
    let numbers = 0
    let empty = 0
    let unrevealed = 0

    for (let r = 0; r < dimensions.value.rows; r++) {
      for (let c = 0; c < dimensions.value.cols; c++) {
        const value = getCellValue(r, c)
        if (value === 'M') mines++
        else if (value === 'F') flags++
        else if (value === '0') empty++
        else if (!isNaN(Number(value)) && value !== '' && value !== '0') numbers++
        else if (value === '') unrevealed++
      }
    }

    return { mines, flags, numbers, empty, unrevealed }
  }

  function solveMoves() {
    clearHighlights()
    
    const requiredMines = findRequiredMines()
    for (const [r, c] of requiredMines) {
      highlightCell(r, c, 'mine')
    }
    
    const safeMoves = findSafeMovesWithHighlights(requiredMines)
    for (const [r, c] of safeMoves) {
      highlightCell(r, c, 'safe')
    }
  }

  function getNeighbors(r: number, c: number): [number, number][] {
    const neighbors: [number, number][] = []
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < dimensions.value.rows && nc >= 0 && nc < dimensions.value.cols) {
          neighbors.push([nr, nc])
        }
      }
    }
    return neighbors
  }

  function findRequiredMines(): [number, number][] {
    const mineMoves: [number, number][] = []
    
    for (let r = 0; r < dimensions.value.rows; r++) {
      for (let c = 0; c < dimensions.value.cols; c++) {
        const value = getCellValue(r, c)
        if (!isNaN(Number(value)) && value !== '' && value !== '0') {
          const targetCount = parseInt(value)
          const neighbors = getNeighbors(r, c)
          
          let mineCount = 0
          let unrevealedCells: [number, number][] = []
          
          for (const [nr, nc] of neighbors) {
            const neighborValue = getCellValue(nr, nc)
            if (neighborValue === 'M' || neighborValue === 'F') {
              mineCount++
            } else if (neighborValue === '') {
              unrevealedCells.push([nr, nc])
            }
          }
          
          if (mineCount + unrevealedCells.length === targetCount && unrevealedCells.length > 0) {
            for (const [nr, nc] of unrevealedCells) {
              mineMoves.push([nr, nc])
            }
          }
        }
      }
    }
    
    return [...new Set(mineMoves.map(m => m.join(',')))].map(m => m.split(',').map(Number) as [number, number])
  }

  function findSafeMovesWithHighlights(highlightedMines: [number, number][]): [number, number][] {
    const safeMoves: [number, number][] = []
    
    for (let r = 0; r < dimensions.value.rows; r++) {
      for (let c = 0; c < dimensions.value.cols; c++) {
        const value = getCellValue(r, c)
        if (!isNaN(Number(value)) && value !== '' && value !== '0') {
          const targetCount = parseInt(value)
          const neighbors = getNeighbors(r, c)
          
          let mineCount = 0
          let unrevealedCells: [number, number][] = []
          
          for (const [nr, nc] of neighbors) {
            const neighborValue = getCellValue(nr, nc)
            if (neighborValue === 'M' || neighborValue === 'F') {
              mineCount++
            } else if (isHighlightedMine(nr, nc, highlightedMines)) {
              mineCount++
            } else if (neighborValue === '') {
              unrevealedCells.push([nr, nc])
            }
          }
          
          if (mineCount === targetCount && unrevealedCells.length > 0) {
            for (const [nr, nc] of unrevealedCells) {
              if (!isHighlightedMine(nr, nc, highlightedMines)) {
                safeMoves.push([nr, nc])
              }
            }
          }
        }
      }
    }
    
    return [...new Set(safeMoves.map(m => m.join(',')))].map(m => m.split(',').map(Number) as [number, number])
  }

  function isHighlightedMine(r: number, c: number, highlightedMines: [number, number][]): boolean {
    return highlightedMines.some(([mr, mc]) => mr === r && mc === c)
  }

  // Initialize the board on store creation
  initializeBoard()

  return {
    // State
    board,
    dimensions,
    highlightedCells,
    // Getters
    boardCells,
    gridStyle,
    totalCells,
    revealedCells,
    rows: computed(() => dimensions.value.rows),
    cols: computed(() => dimensions.value.cols),
    // Actions
    initializeBoard,
    updateCell,
    setBoardSize,
    clearHighlights,
    highlightCell,
    isHighlighted,
    getHighlightType,
    getCell,
    resetBoard,
    applyBoard,
    getCellValue,
    setCellValue,
    getBoardStats,
    solveMoves,
  }
})
