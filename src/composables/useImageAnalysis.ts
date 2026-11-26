import { useAnalysisStore, useColorStore, useGameStore } from '@/stores'
import { useColorDetection } from './useColorDetection'
import {
  computeHomography,
  detectBoardQuad,
  projectPoint,
  type BoardQuad,
} from '@/utils/perspective'
import type { DetectedBoard, RGBColor } from '@/types'

export function useImageAnalysis() {
  const analysisStore = useAnalysisStore()
  const colorStore = useColorStore()
  const gameStore = useGameStore()
  const { classifyCellPixels } = useColorDetection()

  function analyzeImageWithGrid(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    targetRows: number,
    targetCols: number,
    quad?: BoardQuad,
  ): DetectedBoard {
    const result: DetectedBoard = {
      rows: targetRows,
      cols: targetCols,
      cells: [],
      mines: 0,
      numbers: 0,
      unrevealed: 0,
      colorDebug: [],
    }

    const activeQuad =
      quad ??
      detectBoardQuad(
        imageData,
        width,
        height,
        colorStore.settings.colorUnrevealed,
        colorStore.settings.colorEmpty,
      )

    const H = computeHomography(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      [activeQuad.topLeft, activeQuad.topRight, activeQuad.bottomRight, activeQuad.bottomLeft],
    )

    const approxCellW = Math.abs(activeQuad.topRight.x - activeQuad.topLeft.x) / targetCols
    const approxCellH = Math.abs(activeQuad.bottomLeft.y - activeQuad.topLeft.y) / targetRows
    const samplesPerAxis = Math.max(10, Math.min(18, Math.round(Math.min(approxCellW, approxCellH) * 0.45)))

    const margin = 0.14
    const span = 1 - margin * 2

    for (let row = 0; row < targetRows; row++) {
      result.cells[row] = []
      result.colorDebug[row] = []

      for (let col = 0; col < targetCols; col++) {
        const pixels: RGBColor[] = []

        for (let sy = 0; sy < samplesPerAxis; sy++) {
          const v = (row + margin + ((sy + 0.5) / samplesPerAxis) * span) / targetRows
          for (let sx = 0; sx < samplesPerAxis; sx++) {
            const u = (col + margin + ((sx + 0.5) / samplesPerAxis) * span) / targetCols
            const pt = projectPoint(H, u, v)
            const px = Math.max(0, Math.min(width - 1, Math.round(pt.x)))
            const py = Math.max(0, Math.min(height - 1, Math.round(pt.y)))
            const i = (py * width + px) * 4
            pixels.push({
              r: imageData[i],
              g: imageData[i + 1],
              b: imageData[i + 2],
            })
          }
        }

        const analysis = classifyCellPixels(pixels)
        result.cells[row][col] = analysis.cellType
        result.colorDebug[row][col] = analysis.debugInfo

        if (analysis.cellType === 'M') result.mines++
        else if (
          !isNaN(Number(analysis.cellType)) &&
          analysis.cellType !== '' &&
          analysis.cellType !== '0'
        ) {
          result.numbers++
        } else if (analysis.cellType === '') {
          result.unrevealed++
        }
      }
    }

    return result
  }

  async function analyzeUploadedImage(): Promise<void> {
    if (!analysisStore.uploadedImage) {
      analysisStore.setStatusMessage('No image uploaded')
      return
    }

    analysisStore.setAnalyzing(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Cannot get canvas context')

      const img = analysisStore.uploadedImage
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const detectedBoard = analyzeImageWithGrid(
        imageData.data,
        canvas.width,
        canvas.height,
        gameStore.dimensions.rows,
        gameStore.dimensions.cols,
      )

      analysisStore.setResult({
        success: true,
        board: detectedBoard,
        processingTime: Date.now(),
      })
    } catch (error) {
      analysisStore.setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      })
    }
  }

  function applyDetectedBoard(): void {
    const detectedBoard = analysisStore.getDetectedBoard()
    if (!detectedBoard) return

    gameStore.setBoardSize(detectedBoard.rows, detectedBoard.cols)
    gameStore.applyBoard(detectedBoard.cells)
    analysisStore.setStatusMessage('Board applied from image analysis')
  }

  return {
    analyzeImageWithGrid,
    analyzeUploadedImage,
    applyDetectedBoard,
  }
}
