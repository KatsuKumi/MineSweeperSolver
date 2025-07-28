<script setup lang="ts">
import { ref } from 'vue'
import GameControls from './components/GameControls.vue'
import ColorSettings from './components/ColorSettings.vue'
import ImageAnalysis from './components/ImageAnalysis.vue'
import GameInfo from './components/GameInfo.vue'
import MinesweeperGrid from './components/grid/MinesweeperGrid.vue'
import Legend from './components/Legend.vue'

const infoMessage = ref('Welcome to Minesweeper Solver! Set up your grid and start playing.')

function updateInfo(message: string) {
  infoMessage.value = message
}
</script>

<template>
  <div class="app">
    <main>
      <div class="game-container">
        <div class="controls-panel">
          <div class="app-header">
            <h1>🚩 Minesweeper Solver</h1>
            <p>Upload an image or manually create a minesweeper board to find optimal moves</p>
          </div>
          <GameControls @info-update="updateInfo" />
          <ColorSettings />
        </div>
        
        <div class="game-panel">
          <MinesweeperGrid />
          <GameInfo :info-message="infoMessage" />
        </div>

        <div class="right-controls-panel">
          <ImageAnalysis @info-update="updateInfo" />
          <Legend />
        </div>
      </div>
    </main>
  </div>
</template>

