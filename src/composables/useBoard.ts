import { computed } from 'vue'
import { useGameStore } from '@/stores'
import type { CellValue, GridPosition } from '@/types'

export function useBoard() {
  const gameStore = useGameStore()

  const neighbors = computed(() => (r: number, c: number): GridPosition[] => {
    const result: GridPosition[] = []
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr
        const nc = c + dc
        if (
          nr >= 0 &&
          nr < gameStore.dimensions.rows &&
          nc >= 0 &&
          nc < gameStore.dimensions.cols
        ) {
          result.push([nr, nc])
        }
      }
    }
    return result
  })

  function toggleCell(row: number, col: number) {
    const cell = gameStore.getCell(row, col)
    if (!cell) return

    let newValue: CellValue
    const current = cell.value

    if (current === '') {
      newValue = '0'
    } else if (current === '0') {
      newValue = '1'
    } else if (!isNaN(Number(current)) && Number(current) < 8) {
      newValue = (Number(current) + 1).toString() as CellValue
    } else if (current === '8') {
      newValue = 'M'
    } else if (current === 'M') {
      newValue = 'F'
    } else {
      newValue = ''
    }

    gameStore.updateCell(row, col, newValue)
    gameStore.clearHighlights()
  }

  function getNeighborCells(row: number, col: number) {
    return neighbors
      .value(row, col)
      .map(([r, c]) => gameStore.getCell(r, c))
      .filter(Boolean)
  }

  return {
    neighbors,
    toggleCell,
    getNeighborCells,
  }
}
