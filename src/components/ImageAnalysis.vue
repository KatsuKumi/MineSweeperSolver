<template>
  <div class="image-analysis">
    <div class="section-header">
      <h3>Image Analysis</h3>
    </div>

    <div class="upload-section">
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        @change="handleImageUpload" 
        class="file-input"
      />
      <button @click="fileInput?.click()" class="btn btn-primary">
        Upload Image
      </button>
      <button 
        v-if="uploadedImage" 
        @click="analyzeImage" 
        class="btn btn-success"
      >
        Analyze Image
      </button>
    </div>

    <div v-if="showPreview" class="image-preview" ref="imagePreview">
      <canvas ref="previewCanvas" class="preview-canvas"></canvas>
      <div class="image-info">
        <small>{{ imageInfo }}</small>
      </div>
    </div>

    <canvas ref="analysisCanvas" class="analysis-canvas" style="display: none;"></canvas>

    <div v-if="analysisResult" class="analysis-result">
      <div class="result-info">
        <strong>Image Analysis Complete!</strong><br>
        Analyzed {{ analysisResult.rows }}×{{ analysisResult.cols }} grid<br>
        Found: {{ analysisResult.mines }} mines, {{ analysisResult.numbers }} numbers, {{ analysisResult.unrevealed }} unrevealed<br>
      </div>
      <div class="result-actions">
        <button @click="applyDetectedBoard" class="btn btn-success">
          📋 Apply to Board
        </button>
        <button @click="showColorDebug" class="btn btn-warning">
          🎨 Show Colors
        </button>
      </div>
    </div>

    <div v-if="analysisError" class="analysis-error">
      <strong>Analysis failed.</strong><br>
      Make sure your image shows the complete minesweeper grid.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useImageAnalysis } from '@/composables/useImageAnalysis'
import { useGameStore } from '@/stores/gameStore'
import { useColorStore } from '@/stores/colorStore'

const gameStore = useGameStore()
const colorStore = useColorStore()
const { analyzeImageWithGrid } = useImageAnalysis()

const fileInput = ref<HTMLInputElement>()
const previewCanvas = ref<HTMLCanvasElement>()
const analysisCanvas = ref<HTMLCanvasElement>()
const imagePreview = ref<HTMLElement>()

const uploadedImage = ref<HTMLImageElement | null>(null)
const showPreview = ref(false)
const imageInfo = ref('')
const analysisResult = ref<any>(null)
const analysisError = ref(false)

const emit = defineEmits<{
  'info-update': [message: string]
}>()

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = function(e) {
    const img = new Image()
    img.onload = function() {
      uploadedImage.value = img
      showImagePreview(img)
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function showImagePreview(img: HTMLImageElement) {
  showPreview.value = true
  nextTick(() => {
    if (!previewCanvas.value) return
    
    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const maxSize = 400
    const scale = Math.min(maxSize / img.width, maxSize / img.height)
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    imageInfo.value = `Uploaded: ${img.width}×${img.height}px - Click "Analyze Image" to detect the board`
  })
}

function analyzeImage() {
  if (!uploadedImage.value || !analysisCanvas.value) return
  
  const img = uploadedImage.value
  const canvas = analysisCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  const targetRows = gameStore.rows
  const targetCols = gameStore.cols
  
  const result = analyzeImageWithGrid(data, canvas.width, canvas.height, targetRows, targetCols)
  
  if (result) {
    analysisResult.value = result
    analysisError.value = false
  } else {
    analysisResult.value = null
    analysisError.value = true
  }
}

function applyDetectedBoard() {
  if (!analysisResult.value) return
  
  gameStore.setBoardSize(analysisResult.value.rows, analysisResult.value.cols)
  
  for (let r = 0; r < analysisResult.value.rows && r < gameStore.rows; r++) {
    for (let c = 0; c < analysisResult.value.cols && c < gameStore.cols; c++) {
      if (analysisResult.value.cells[r] && analysisResult.value.cells[r][c] !== undefined) {
        gameStore.setCellValue(r, c, analysisResult.value.cells[r][c])
      }
    }
  }
  
  emit('info-update', `
    <strong>Board applied from image!</strong><br>
    You may need to manually adjust some cells for accuracy.<br>
    <em>Tip: Click cells to cycle through types if needed.</em>
  `)
}

function showColorDebug() {
  if (!analysisResult.value || !analysisResult.value.colorDebug) {
    emit('info-update', '<strong>No color debug data available. Analyze an image first!</strong>')
    return
  }
  
  const colorSettings = colorStore.settings
  let debugHtml = '<strong>Color Debug - First 20 cells:</strong><br><div style="font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto;">'
  
  let cellCount = 0
  for (let r = 0; r < analysisResult.value.rows && cellCount < 20; r++) {
    for (let c = 0; c < analysisResult.value.cols && cellCount < 20; c++) {
      const cell = analysisResult.value.cells[r][c]
      const color = analysisResult.value.colorDebug[r][c]
      const cellDisplay = cell === '' ? 'UNREVEALED' : cell
      
      debugHtml += `(${r},${c}): Detected=${cellDisplay} | ${color}<br>`
      cellCount++
    }
  }
  
  debugHtml += '</div>'
  emit('info-update', debugHtml)
}
</script>

