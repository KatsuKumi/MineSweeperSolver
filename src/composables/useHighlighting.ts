import { computed } from 'vue'
import { useGameStore } from '@/stores'
import type { GridPosition } from '@/types'

export function useHighlighting() {
  const gameStore = useGameStore()

  const highlightedPositions = computed(() => {
    const positions: { safe: GridPosition[]; mine: GridPosition[] } = {
      safe: [],
      mine: [],
    }

    gameStore.highlightedCells.forEach((type, key) => {
      const [row, col] = key.split(',').map(Number)
      positions[type].push([row, col])
    })

    return positions
  })

  const totalHighlights = computed(() => {
    return gameStore.highlightedCells.size
  })

  function clearAllHighlights(): void {
    gameStore.clearHighlights()
  }

  function highlightSafeMoves(positions: GridPosition[]): void {
    positions.forEach(([row, col]) => {
      gameStore.highlightCell(row, col, 'safe')
    })
  }

  function highlightMineMoves(positions: GridPosition[]): void {
    positions.forEach(([row, col]) => {
      gameStore.highlightCell(row, col, 'mine')
    })
  }

  function toggleHighlight(row: number, col: number, type: 'safe' | 'mine'): void {
    if (gameStore.isHighlighted(row, col)) {
      const currentType = gameStore.getHighlightType(row, col)
      if (currentType === type) {
        // Remove highlight if same type
        const key = `${row},${col}`
        gameStore.highlightedCells.delete(key)
      } else {
        // Change type
        gameStore.highlightCell(row, col, type)
      }
    } else {
      // Add highlight
      gameStore.highlightCell(row, col, type)
    }
  }

  function isPositionHighlighted(row: number, col: number): boolean {
    return gameStore.isHighlighted(row, col)
  }

  function getHighlightType(row: number, col: number): 'safe' | 'mine' | undefined {
    return gameStore.getHighlightType(row, col)
  }

  return {
    highlightedPositions,
    totalHighlights,
    clearAllHighlights,
    highlightSafeMoves,
    highlightMineMoves,
    toggleHighlight,
    isPositionHighlighted,
    getHighlightType,
  }
}
