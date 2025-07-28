<template>
  <div class="game-controls">
    <div class="controls-section">
      <h3>Grid Settings</h3>
      <div class="grid-inputs">
        <div class="input-group">
          <label for="rows">Rows:</label>
          <input 
            id="rows" 
            v-model.number="rows" 
            type="number" 
            min="5" 
            max="50" 
            class="size-input"
          />
        </div>
        <div class="input-group">
          <label for="cols">Cols:</label>
          <input 
            id="cols" 
            v-model.number="cols" 
            type="number" 
            min="5" 
            max="50" 
            class="size-input"
          />
        </div>
        <div class="input-group">
          <label for="mines">Mines:</label>
          <input 
            id="mines" 
            v-model.number="mines" 
            type="number" 
            min="1" 
            class="size-input"
          />
        </div>
        <button @click="applyCustomSize" class="btn btn-primary">Apply</button>
      </div>
    </div>

    <div class="controls-section">
      <h3>Quick Presets</h3>
      <div class="preset-cards">
        <div class="preset-card" @click="togglePresetCard('classic')" :class="{ active: activeCard === 'classic' }">
          <div class="card-header">
            <span class="card-icon">🎯</span>
            <span class="card-title">Classic</span>
            <span class="card-arrow">{{ activeCard === 'classic' ? '▼' : '▶' }}</span>
          </div>
          <div class="card-content" v-show="activeCard === 'classic'">
            <div class="preset-option" @click.stop="setPreset(9, 9, 10)">
              <span class="option-icon">🟢</span>
              <span class="option-text">Beginner</span>
              <span class="option-details">9×9 • 10 mines</span>
            </div>
            <div class="preset-option" @click.stop="setPreset(16, 16, 40)">
              <span class="option-icon">🟡</span>
              <span class="option-text">Intermediate</span>
              <span class="option-details">16×16 • 40 mines</span>
            </div>
            <div class="preset-option" @click.stop="setPreset(16, 30, 99)">
              <span class="option-icon">🔴</span>
              <span class="option-text">Expert</span>
              <span class="option-details">16×30 • 99 mines</span>
            </div>
          </div>
        </div>

        <div class="preset-card" @click="togglePresetCard('gtnh')" :class="{ active: activeCard === 'gtnh' }">
          <div class="card-header">
            <span class="card-icon">⚡</span>
            <span class="card-title">GTNH</span>
            <span class="card-arrow">{{ activeCard === 'gtnh' ? '▼' : '▶' }}</span>
          </div>
          <div class="card-content" v-show="activeCard === 'gtnh'">
            <div class="preset-option" @click.stop="setPreset(13, 13, 20)">
              <span class="option-icon">💎</span>
              <span class="option-text">Tier 1</span>
              <span class="option-details">13×13 • 20 mines</span>
            </div>
            <div class="preset-option" @click.stop="setPreset(15, 15, 30)">
              <span class="option-icon">🔥</span>
              <span class="option-text">Tier 2</span>
              <span class="option-details">15×15 • 30 mines</span>
            </div>
            <div class="preset-option" @click.stop="setPreset(17, 17, 42)">
              <span class="option-icon">⚔️</span>
              <span class="option-text">Tier 3</span>
              <span class="option-details">17×17 • 42 mines</span>
            </div>
            <div class="preset-option" @click.stop="setPreset(19, 19, 68)">
              <span class="option-icon">💀</span>
              <span class="option-text">Tier 4</span>
              <span class="option-details">19×19 • 68 mines</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <h3>Actions</h3>
      <div class="action-buttons">
        <button @click="resetBoard" class="btn btn-warning">
          Reset Board
        </button>
        <button @click="gameStore.solveMoves()" class="btn btn-success">
          Solve Moves
        </button>
        <button @click="gameStore.clearHighlights()" class="btn btn-secondary">
          Clear Highlights
        </button>
        <button @click="showBoardState" class="btn btn-info">
          Show Stats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const rows = ref(12)
const cols = ref(12)
const mines = ref(20)
const activeCard = ref<string | null>(null)

function applyCustomSize() {
  if (rows.value >= 5 && rows.value <= 50 && cols.value >= 5 && cols.value <= 50 && mines.value >= 1) {
    gameStore.setBoardSize(rows.value, cols.value)
    emit('info-update', `Board: ${rows.value}×${cols.value}, Target mines: ${mines.value}`)
  } else {
    alert('Please enter valid dimensions (5-50) and mine count (≥1)')
  }
}

function setPreset(presetRows: number, presetCols: number, presetMines: number) {
  rows.value = presetRows
  cols.value = presetCols
  mines.value = presetMines
  gameStore.setBoardSize(presetRows, presetCols)
  emit('info-update', `Preset: ${presetRows}×${presetCols} with ${presetMines} mines`)
}


function togglePresetCard(cardType: string) {
  activeCard.value = activeCard.value === cardType ? null : cardType
}

function resetBoard() {
  gameStore.resetBoard()
  gameStore.clearHighlights()
  emit('info-update', 'Board reset')
}

function showBoardState() {
  const stats = gameStore.getBoardStats()
  const totalMines = stats.mines + stats.flags
  
  const message = `
    <strong>Board State:</strong><br>
    Mines (💣): ${stats.mines} | Flags (🚩): ${stats.flags} | Numbers: ${stats.numbers} | Empty (0): ${stats.empty} | Unrevealed: ${stats.unrevealed}<br>
    <strong>Total mines marked:</strong> ${totalMines}<br>
    <em>Tip: Red squares in your image should be set as Mines (💣) or Flags (🚩) here!</em>
  `
  
  emit('info-update', message)
}

const emit = defineEmits<{
  'info-update': [message: string]
}>()
</script>

