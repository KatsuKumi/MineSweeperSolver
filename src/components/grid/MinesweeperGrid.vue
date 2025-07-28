<template>
  <div class="minesweeper-container">
    <div class="grid" :style="gameStore.gridStyle">
      <GridCell
        v-for="cell in gameStore.boardCells"
        :key="`${cell.row}-${cell.col}`"
        :cell="cell"
        :is-highlighted="isHighlighted(cell)"
        :highlight-type="getHighlightType(cell)"
        @click="handleCellClick(cell)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import GridCell from './GridCell.vue'
import type { BoardCell } from '@/types/board'
import { useCellToggle } from '@/composables/useCellToggle'

const gameStore = useGameStore()
const { toggleCell } = useCellToggle()

function handleCellClick(cell: BoardCell) {
  toggleCell(cell.row, cell.col)
}

function isHighlighted(cell: BoardCell): boolean {
  const key = `${cell.row},${cell.col}`
  return gameStore.highlightedCells.has(key)
}

function getHighlightType(cell: BoardCell): 'safe' | 'mine' | undefined {
  const key = `${cell.row},${cell.col}`
  return gameStore.highlightedCells.get(key)
}
</script>

