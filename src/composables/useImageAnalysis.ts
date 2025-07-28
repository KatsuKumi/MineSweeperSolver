import { useAnalysisStore, useColorStore, useGameStore } from '@/stores'
import { useColorDetection } from './useColorDetection'
import type { DetectedBoard, CellValue } from '@/types'

export function useImageAnalysis() {
  const analysisStore = useAnalysisStore()
  const colorStore = useColorStore()
  const gameStore = useGameStore()
  const { analyzeCell } = useColorDetection()

  function analyzeImageWithGrid(
    imageData: Uint8ClampedArray,
    width: number,
    height: number,
    targetRows: number,
    targetCols: number,
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

    const cellWidth = width / targetCols
    const cellHeight = height / targetRows

    for (let row = 0; row < targetRows; row++) {
      result.cells[row] = []
      result.colorDebug[row] = []

      for (let col = 0; col < targetCols; col++) {
        const cellLeft = Math.floor(col * cellWidth)
        const cellTop = Math.floor(row * cellHeight)
        const cellRight = Math.floor((col + 1) * cellWidth)
        const cellBottom = Math.floor((row + 1) * cellHeight)

        const analysis = analyzeCell(imageData, width, cellLeft, cellTop, cellRight, cellBottom)

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
