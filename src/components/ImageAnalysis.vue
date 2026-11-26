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
      <canvas
        ref="previewCanvas"
        class="preview-canvas preview-canvas--interactive"
        @pointerdown="handleCanvasPointerDown"
        @pointermove="handleCanvasPointerMove"
        @pointerup="handleCanvasPointerUp"
        @pointercancel="handleCanvasPointerUp"
      ></canvas>
      <div class="corner-actions">
        <button type="button" @click="resetAutoCorners" class="btn btn-secondary btn-sm">
          Auto Corners
        </button>
        <button type="button" @click="resetFullImageCorners" class="btn btn-secondary btn-sm">
          Full Image
        </button>
      </div>
      <div class="image-info">
        <small>{{ imageInfo }}</small>
      </div>
    </div>

    <canvas ref="analysisCanvas" class="analysis-canvas" style="display: none;"></canvas>

    <div v-if="analysisResult" class="analysis-result">
      <div class="result-info">
        <strong>Image Analysis Complete!</strong><br />
        Analyzed {{ analysisResult.rows }}×{{ analysisResult.cols }} grid<br />
        Found: {{ analysisResult.mines }} mines, {{ analysisResult.numbers }} numbers,
        {{ analysisResult.unrevealed }} unrevealed<br />
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
      <strong>Analysis failed.</strong><br />
      Make sure your image shows the complete minesweeper grid.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useImageAnalysis } from '@/composables/useImageAnalysis'
import { useGameStore } from '@/stores/gameStore'
import { useColorStore } from '@/stores/colorStore'
import {
  computeHomography,
  detectBoardQuad,
  fullImageQuad,
  projectPoint,
  type BoardQuad,
  type Point2D,
} from '@/utils/perspective'
import type { DetectedBoard } from '@/types'

type CornerKey = keyof BoardQuad

const CORNER_KEYS: CornerKey[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft']
const CORNER_LABELS: Record<CornerKey, string> = {
  topLeft: 'TL',
  topRight: 'TR',
  bottomRight: 'BR',
  bottomLeft: 'BL',
}

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
const analysisResult = ref<DetectedBoard | null>(null)
const analysisError = ref(false)
const boardQuad = ref<BoardQuad | null>(null)
const draggingCorner = ref<CornerKey | null>(null)
const previewScale = ref(1)

const emit = defineEmits<{
  'info-update': [message: string]
}>()

function getFullImageData(): { data: Uint8ClampedArray; width: number; height: number } | null {
  if (!uploadedImage.value || !analysisCanvas.value) return null
  const img = uploadedImage.value
  const canvas = analysisCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  if (canvas.width !== img.width || canvas.height !== img.height) {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
  } else {
    ctx.drawImage(img, 0, 0)
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { data: imageData.data, width: canvas.width, height: canvas.height }
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = function (e) {
    const img = new Image()
    img.onload = function () {
      uploadedImage.value = img
      showPreview.value = true
      nextTick(() => {
        const frame = getFullImageData()
        if (frame) {
          boardQuad.value = detectBoardQuad(
            frame.data,
            frame.width,
            frame.height,
            colorStore.settings.colorUnrevealed,
            colorStore.settings.colorEmpty,
          )
        } else {
          boardQuad.value = fullImageQuad(img.width, img.height)
        }
        drawPreview()
        imageInfo.value = `Uploaded: ${img.width}×${img.height}px — drag corners if needed`
        analyzeImage()
      })
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function drawPreview() {
  if (!uploadedImage.value || !previewCanvas.value) return

  const img = uploadedImage.value
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const maxSize = 340
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
  previewScale.value = scale
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const quad = boardQuad.value
  if (!quad) return

  const scaledCorners: [Point2D, Point2D, Point2D, Point2D] = [
    { x: quad.topLeft.x * scale, y: quad.topLeft.y * scale },
    { x: quad.topRight.x * scale, y: quad.topRight.y * scale },
    { x: quad.bottomRight.x * scale, y: quad.bottomRight.y * scale },
    { x: quad.bottomLeft.x * scale, y: quad.bottomLeft.y * scale },
  ]

  const H = computeHomography(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    scaledCorners,
  )

  const rows = gameStore.rows
  const cols = gameStore.cols

  // Draw projected grid lines
  ctx.save()
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)'
  ctx.lineWidth = 1
  for (let r = 1; r < rows; r++) {
    const v = r / rows
    const start = projectPoint(H, 0, v)
    const end = projectPoint(H, 1, v)
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }
  for (let c = 1; c < cols; c++) {
    const u = c / cols
    const start = projectPoint(H, u, 0)
    const end = projectPoint(H, u, 1)
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }

  // Outer quad boundary
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(scaledCorners[0].x, scaledCorners[0].y)
  for (let i = 1; i < 4; i++) {
    ctx.lineTo(scaledCorners[i].x, scaledCorners[i].y)
  }
  ctx.closePath()
  ctx.stroke()

  // Corner handles
  CORNER_KEYS.forEach((key, idx) => {
    const pt = scaledCorners[idx]
    const active = draggingCorner.value === key
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, active ? 9 : 7, 0, Math.PI * 2)
    ctx.fillStyle = active ? '#a78bfa' : '#38bdf8'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    ctx.font = 'bold 9px sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(CORNER_LABELS[key], pt.x, pt.y - 13)
  })
  ctx.restore()
}

function canvasPointFromEvent(event: PointerEvent): Point2D | null {
  const canvas = previewCanvas.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

function handleCanvasPointerDown(event: PointerEvent) {
  if (!boardQuad.value || !previewCanvas.value) return
  const pt = canvasPointFromEvent(event)
  if (!pt) return

  const scale = previewScale.value
  let nearest: CornerKey | null = null
  let bestDist = 20

  for (const key of CORNER_KEYS) {
    const corner = boardQuad.value[key]
    const dist = Math.hypot(corner.x * scale - pt.x, corner.y * scale - pt.y)
    if (dist <= bestDist) {
      bestDist = dist
      nearest = key
    }
  }

  if (nearest) {
    draggingCorner.value = nearest
    previewCanvas.value.setPointerCapture(event.pointerId)
    drawPreview()
  }
}

function handleCanvasPointerMove(event: PointerEvent) {
  if (!draggingCorner.value || !boardQuad.value || !uploadedImage.value) return
  const pt = canvasPointFromEvent(event)
  if (!pt) return

  const scale = previewScale.value || 1
  const imgX = Math.max(0, Math.min(uploadedImage.value.width, pt.x / scale))
  const imgY = Math.max(0, Math.min(uploadedImage.value.height, pt.y / scale))

  boardQuad.value = {
    ...boardQuad.value,
    [draggingCorner.value]: { x: imgX, y: imgY },
  }
  drawPreview()
}

function handleCanvasPointerUp(event: PointerEvent) {
  if (!draggingCorner.value) return
  draggingCorner.value = null
  if (previewCanvas.value?.hasPointerCapture(event.pointerId)) {
    previewCanvas.value.releasePointerCapture(event.pointerId)
  }
  drawPreview()
  analyzeImage()
}

function resetAutoCorners() {
  const frame = getFullImageData()
  if (!frame) return
  boardQuad.value = detectBoardQuad(
    frame.data,
    frame.width,
    frame.height,
    colorStore.settings.colorUnrevealed,
    colorStore.settings.colorEmpty,
  )
  drawPreview()
  analyzeImage()
}

function resetFullImageCorners() {
  if (!uploadedImage.value) return
  boardQuad.value = fullImageQuad(uploadedImage.value.width, uploadedImage.value.height)
  drawPreview()
  analyzeImage()
}

function analyzeImage() {
  const frame = getFullImageData()
  if (!frame) return

  const targetRows = gameStore.rows
  const targetCols = gameStore.cols
  const quad = boardQuad.value ?? fullImageQuad(frame.width, frame.height)

  const result = analyzeImageWithGrid(
    frame.data,
    frame.width,
    frame.height,
    targetRows,
    targetCols,
    quad,
  )

  if (result) {
    analysisResult.value = result
    analysisError.value = false
  } else {
    analysisResult.value = null
    analysisError.value = true
  }
}

watch(
  () => [gameStore.rows, gameStore.cols],
  () => {
    if (uploadedImage.value) {
      drawPreview()
      if (analysisResult.value) {
        analyzeImage()
      }
    }
  },
)

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

  emit(
    'info-update',
    `
    <strong>Board applied from image!</strong><br>
    Use the brush slider above the grid to touch up any cells by clicking or dragging.
  `,
  )
}

function showColorDebug() {
  if (!analysisResult.value || !analysisResult.value.colorDebug) {
    emit('info-update', '<strong>No color debug data available. Analyze an image first!</strong>')
    return
  }

  let debugHtml =
    '<strong>Color Debug - First 20 cells:</strong><br><div style="font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto;">'

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
