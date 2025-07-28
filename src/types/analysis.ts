// ===== src/types/analysis.ts =====

import type { CellValue } from './board'
import type { RGBColor } from './colors'

export interface DetectedBoard {
  rows: number
  cols: number
  cells: CellValue[][]
  mines: number
  numbers: number
  unrevealed: number
  colorDebug: string[][]
}

export interface AnalysisResult {
  success: boolean
  board?: DetectedBoard
  error?: string
  processingTime?: number
}

export interface ImageData {
  width: number
  height: number
  data: Uint8ClampedArray
}

export interface CellBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface CellAnalysis {
  cellType: CellValue
  avgColor: string
  confidence: number
  position: [number, number]
}

export interface ColorDebugInfo {
  position: [number, number]
  detectedType: CellValue
  colorString: string
  closestMatch: string
  distance: number
}

export interface PixelSample {
  x: number
  y: number
  color: RGBColor
}

export interface GridAnalysisOptions {
  marginPercent: number
  sampleStep: number
  colorTolerance: number
}

export interface AnalysisStats {
  totalCells: number
  detectedCells: number
  successRate: number
  averageConfidence: number
  processingTimeMs: number
}

export const DEFAULT_ANALYSIS_OPTIONS: GridAnalysisOptions = {
  marginPercent: 0.1,
  sampleStep: 1,
  colorTolerance: 50,
}
