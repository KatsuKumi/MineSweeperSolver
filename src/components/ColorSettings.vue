<template>
  <div class="color-settings">
    <div class="section-header">
      <h3>Color Settings</h3>
      <button @click="togglePanel" class="btn btn-secondary">
        {{ showPanel ? 'Hide' : 'Show' }} Colors
      </button>
    </div>

    <div v-if="showPanel" class="color-panel">
      <div class="color-grid">
        <div class="color-input-group">
          <label for="color1">Number 1:</label>
          <input 
            id="color1" 
            v-model="localColors.color1" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="color2">Number 2:</label>
          <input 
            id="color2" 
            v-model="localColors.color2" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="color3">Number 3:</label>
          <input 
            id="color3" 
            v-model="localColors.color3" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="color4">Number 4:</label>
          <input 
            id="color4" 
            v-model="localColors.color4" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="colorMine">Mine:</label>
          <input 
            id="colorMine" 
            v-model="localColors.colorMine" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="colorUnrevealed">Unrevealed:</label>
          <input 
            id="colorUnrevealed" 
            v-model="localColors.colorUnrevealed" 
            type="color" 
            class="color-input"
          />
        </div>
        <div class="color-input-group">
          <label for="colorEmpty">Empty:</label>
          <input 
            id="colorEmpty" 
            v-model="localColors.colorEmpty" 
            type="color" 
            class="color-input"
          />
        </div>
      </div>


      <div class="color-actions">
        <button @click="updateColors" class="btn btn-success">
          Update Colors
        </button>
        <button @click="resetColors" class="btn btn-warning">
          Reset to Defaults
        </button>
        <button @click="saveColors" class="btn btn-info">
          Save Colors
        </button>
        <button @click="loadColors" class="btn btn-secondary">
          Load Colors
        </button>
      </div>

      <div v-if="statusMessage" class="status-message" v-html="statusMessage"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useColorStore } from '@/stores/colorStore'

const colorStore = useColorStore()

const showPanel = ref(false)
const statusMessage = ref('')

const localColors = reactive({
  color1: colorStore.settings.color1,
  color2: colorStore.settings.color2,
  color3: colorStore.settings.color3,
  color4: colorStore.settings.color4,
  colorMine: colorStore.settings.colorMine,
  colorUnrevealed: colorStore.settings.colorUnrevealed,
  colorEmpty: colorStore.settings.colorEmpty,
})

watch(() => colorStore.settings, (newSettings) => {
  Object.assign(localColors, newSettings)
}, { deep: true })

function togglePanel() {
  showPanel.value = !showPanel.value
}

function updateColors() {
  Object.assign(colorStore.settings, localColors)
  showStatus('<span style="color: #4caf50;">✓ Colors updated</span>')
}

function resetColors() {
  colorStore.resetColors()
  showStatus('<span style="color: #4caf50;">✓ Reset to defaults</span>')
}

function saveColors() {
  colorStore.downloadColorFile()
  showStatus('<span style="color: #4caf50;">✓ Colors saved to file</span>')
}

async function loadColors() {
  const success = await colorStore.loadColorFile()
  if (success) {
    showStatus('<span style="color: #4caf50;">✓ Colors loaded from file</span>')
  } else {
    showStatus('<span style="color: #f44336;">✗ Invalid color file</span>')
  }
}


function showStatus(message: string) {
  statusMessage.value = message
  setTimeout(() => {
    statusMessage.value = ''
  }, 2000)
}
</script>

