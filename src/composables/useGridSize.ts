import { ref, computed } from 'vue'
import { useGameStore } from '@/stores'
import type { GridDimensions, PresetName } from '@/types'
import { PRESET_SIZES } from '@/types'

export function useGridSize() {
  const gameStore = useGameStore()
  const customRows = ref(gameStore.dimensions.rows)
  const customCols = ref(gameStore.dimensions.cols)
  const customMines = ref(gameStore.dimensions.mines)

  const isValidSize = computed(() => {
    return (
      customRows.value >= 5 &&
      customRows.value <= 50 &&
      customCols.value >= 5 &&
      customCols.value <= 50 &&
      customMines.value >= 1 &&
      customMines.value < customRows.value * customCols.value
    )
  })

  function applyCustomSize(): boolean {
    if (!isValidSize.value) return false

    gameStore.setBoardSize(customRows.value, customCols.value, customMines.value)
    return true
  }

  function applyPreset(presetName: PresetName): void {
    const preset = PRESET_SIZES.find((p) => p.name === presetName)
    if (!preset) return

    customRows.value = preset.rows
    customCols.value = preset.cols
    customMines.value = preset.mines

    gameStore.setBoardSize(preset.rows, preset.cols, preset.mines)
  }

  function updateRows(value: number): void {
    customRows.value = Math.max(5, Math.min(50, value))
  }

  function updateCols(value: number): void {
    customCols.value = Math.max(5, Math.min(50, value))
  }

  function updateMines(value: number): void {
    const maxMines = customRows.value * customCols.value - 1
    customMines.value = Math.max(1, Math.min(maxMines, value))
  }

  function syncWithStore(): void {
    customRows.value = gameStore.dimensions.rows
    customCols.value = gameStore.dimensions.cols
    customMines.value = gameStore.dimensions.mines
  }

  return {
    customRows,
    customCols,
    customMines,
    isValidSize,
    applyCustomSize,
    applyPreset,
    updateRows,
    updateCols,
    updateMines,
    syncWithStore,
  }
}
