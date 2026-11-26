<template>
  <div class="minesweeper-container">
    <div class="brush-toolbar">
      <div class="brush-header">
        <div class="brush-active-label">
          <span>Brush:</span>
          <strong class="brush-badge">{{ activeOption.longLabel }}</strong>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-sm mode-toggle-btn"
          @click="toggleInteractionMode"
        >
          {{ interactionMode === 'paint' ? '🖌️ Paint / Drag' : '🔄 Cycle Click' }}
        </button>
      </div>

      <div class="brush-slider-wrap">
        <input
          v-model.number="brushIndex"
          type="range"
          min="0"
          :max="BRUSH_OPTIONS.length - 1"
          step="1"
          class="brush-slider"
          aria-label="Cell value brush slider"
          data-testid="cell-brush-slider"
          @input="interactionMode = 'paint'"
        />
      </div>

      <div class="brush-pills">
        <button
          v-for="(opt, idx) in BRUSH_OPTIONS"
          :key="opt.testKey"
          type="button"
          class="brush-pill"
          :class="{ active: brushIndex === idx && interactionMode === 'paint' }"
          :title="opt.longLabel"
          :data-testid="`brush-pill-${opt.testKey}`"
          @click="selectBrushIndex(idx)"
        >
          {{ opt.shortLabel }}
        </button>
      </div>
    </div>

    <div class="grid" :style="gameStore.gridStyle">
      <GridCell
        v-for="cell in gameStore.boardCells"
        :key="`${cell.row}-${cell.col}`"
        :cell="cell"
        :is-highlighted="isHighlighted(cell)"
        :highlight-type="getHighlightType(cell)"
        @pointerdown="handleCellPointerDown(cell, $event)"
        @pointerenter="handleCellPointerEnter(cell)"
        @contextmenu="handleCellRightClick(cell)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import GridCell from './GridCell.vue'
import type { BoardCell, CellValue } from '@/types/board'
import { useCellToggle } from '@/composables/useCellToggle'

interface BrushOption {
  value: CellValue
  shortLabel: string
  longLabel: string
  testKey: string
}

const BRUSH_OPTIONS: BrushOption[] = [
  { value: '', shortLabel: '■', longLabel: 'Unrevealed', testKey: 'unrevealed' },
  { value: '0', shortLabel: '0', longLabel: 'Empty (0)', testKey: '0' },
  { value: '1', shortLabel: '1', longLabel: '1', testKey: '1' },
  { value: '2', shortLabel: '2', longLabel: '2', testKey: '2' },
  { value: '3', shortLabel: '3', longLabel: '3', testKey: '3' },
  { value: '4', shortLabel: '4', longLabel: '4', testKey: '4' },
  { value: '5', shortLabel: '5', longLabel: '5', testKey: '5' },
  { value: '6', shortLabel: '6', longLabel: '6', testKey: '6' },
  { value: '7', shortLabel: '7', longLabel: '7', testKey: '7' },
  { value: '8', shortLabel: '8', longLabel: '8', testKey: '8' },
  { value: 'M', shortLabel: '💣', longLabel: 'Mine', testKey: 'M' },
  { value: 'F', shortLabel: '🚩', longLabel: 'Flag', testKey: 'F' },
]

const gameStore = useGameStore()
const { toggleCell } = useCellToggle()

const brushIndex = ref(2) // Default to '1' for quick painting
const interactionMode = ref<'paint' | 'cycle'>('paint')
const isPainting = ref(false)

const activeOption = computed(() => BRUSH_OPTIONS[brushIndex.value] ?? BRUSH_OPTIONS[0])

function selectBrushIndex(idx: number) {
  brushIndex.value = idx
  interactionMode.value = 'paint'
}

function toggleInteractionMode() {
  interactionMode.value = interactionMode.value === 'paint' ? 'cycle' : 'paint'
}

function paintCell(cell: BoardCell) {
  gameStore.setCellValue(cell.row, cell.col, activeOption.value.value)
  gameStore.clearHighlights()
}

function handleCellPointerDown(cell: BoardCell, event: PointerEvent) {
  if (event.button === 2) {
    handleCellRightClick(cell)
    return
  }
  if (event.button !== 0) return

  if (interactionMode.value === 'cycle') {
    toggleCell(cell.row, cell.col)
    return
  }

  isPainting.value = true
  paintCell(cell)
}

function handleCellPointerEnter(cell: BoardCell) {
  if (isPainting.value && interactionMode.value === 'paint') {
    paintCell(cell)
  }
}

function handleCellRightClick(cell: BoardCell) {
  gameStore.setCellValue(cell.row, cell.col, '')
  gameStore.clearHighlights()
}

function stopPainting() {
  isPainting.value = false
}

onMounted(() => {
  window.addEventListener('pointerup', stopPainting)
  window.addEventListener('pointercancel', stopPainting)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', stopPainting)
  window.removeEventListener('pointercancel', stopPainting)
})

function isHighlighted(cell: BoardCell): boolean {
  const key = `${cell.row},${cell.col}`
  return gameStore.highlightedCells.has(key)
}

function getHighlightType(cell: BoardCell): 'safe' | 'mine' | undefined {
  const key = `${cell.row},${cell.col}`
  return gameStore.highlightedCells.get(key)
}
</script>
