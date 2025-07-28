import { useGameStore } from '@/stores/gameStore'
import type { CellValue } from '@/types'

export function useCellToggle() {
  const gameStore = useGameStore()

  function toggleCell(row: number, col: number) {
    const current = gameStore.getCellValue(row, col)
    
    if (current === '') {
      gameStore.setCellValue(row, col, '0')
    } else if (current === '0') {
      gameStore.setCellValue(row, col, '1')
    } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(current)) {
      const num = parseInt(current)
      if (num < 8) {
        gameStore.setCellValue(row, col, (num + 1).toString() as CellValue)
      } else {
        gameStore.setCellValue(row, col, 'M')
      }
    } else if (current === 'M') {
      gameStore.setCellValue(row, col, 'F')
    } else if (current === 'F') {
      gameStore.setCellValue(row, col, '')
    }
    
    gameStore.clearHighlights()
  }

  return {
    toggleCell
  }
}