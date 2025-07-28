import { computed } from 'vue'
import { useGameStore } from '@/stores'
import { useBoard } from './useBoard'
import type { MoveResult, GridPosition } from '@/types'

export function useSolver() {
  const gameStore = useGameStore()
  const { neighbors } = useBoard()

  function findRequiredMines(): GridPosition[] {
    const mineMoves: GridPosition[] = []

    for (let r = 0; r < gameStore.dimensions.rows; r++) {
      for (let c = 0; c < gameStore.dimensions.cols; c++) {
        const cell = gameStore.getCell(r, c)
        if (!cell || !cell.value || isNaN(Number(cell.value))) continue

        const targetCount = Number(cell.value)
        const neighborPositions = neighbors.value(r, c)

        let mineCount = 0
        const unrevealedCells: GridPosition[] = []

        for (const [nr, nc] of neighborPositions) {
          const neighbor = gameStore.getCell(nr, nc)
          if (!neighbor) continue

          if (neighbor.value === 'M' || neighbor.value === 'F') {
            mineCount++
          } else if (neighbor.value === '') {
            unrevealedCells.push([nr, nc])
          }
        }

        if (mineCount + unrevealedCells.length === targetCount && unrevealedCells.length > 0) {
          mineMoves.push(...unrevealedCells)
        }
      }
    }

    return [...new Set(mineMoves.map((m) => m.join(',')))].map(
      (m) => m.split(',').map(Number) as GridPosition,
    )
  }

  function findSafeMovesWithHighlights(highlightedMines: GridPosition[]): GridPosition[] {
    const safeMoves: GridPosition[] = []

    for (let r = 0; r < gameStore.dimensions.rows; r++) {
      for (let c = 0; c < gameStore.dimensions.cols; c++) {
        const cell = gameStore.getCell(r, c)
        if (!cell || !cell.value || isNaN(Number(cell.value))) continue

        const targetCount = Number(cell.value)
        const neighborPositions = neighbors.value(r, c)

        let mineCount = 0
        const unrevealedCells: GridPosition[] = []

        for (const [nr, nc] of neighborPositions) {
          const neighbor = gameStore.getCell(nr, nc)
          if (!neighbor) continue

          if (neighbor.value === 'M' || neighbor.value === 'F') {
            mineCount++
          } else if (isHighlightedMine(nr, nc, highlightedMines)) {
            mineCount++
          } else if (neighbor.value === '') {
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

    return [...new Set(safeMoves.map((m) => m.join(',')))].map(
      (m) => m.split(',').map(Number) as GridPosition,
    )
  }

  function isHighlightedMine(r: number, c: number, highlightedMines: GridPosition[]): boolean {
    return highlightedMines.some(([mr, mc]) => mr === r && mc === c)
  }

  function solve(): MoveResult {
    gameStore.clearHighlights()

    const requiredMines = findRequiredMines()
    const safeMoves = findSafeMovesWithHighlights(requiredMines)

    requiredMines.forEach(([r, c]) => {
      gameStore.highlightCell(r, c, 'mine')
    })

    safeMoves.forEach(([r, c]) => {
      gameStore.highlightCell(r, c, 'safe')
    })

    return { safeMoves, mineMoves: requiredMines }
  }

  return {
    findRequiredMines,
    findSafeMovesWithHighlights,
    solve,
  }
}
