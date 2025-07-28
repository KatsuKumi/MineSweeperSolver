<template>
  <div class="action-buttons-panel">
    <div class="action-buttons">
      <button @click="gameStore.solveMoves()" class="btn btn-success">
        🧩 Solve
      </button>
      <button @click="showBoardState" class="btn btn-info">
        📊 Stats
      </button>
      <button @click="gameStore.clearHighlights()" class="btn btn-secondary">
        🧹 Clear
      </button>
      <button @click="resetBoard" class="btn btn-warning">
        🔄 Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const emit = defineEmits<{
  'info-update': [message: string]
}>()

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
</script>

<style scoped>
.action-buttons-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
  width: fit-content;
  align-self: center;
}

.action-buttons {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-sm);
  }
}
</style>