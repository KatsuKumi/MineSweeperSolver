// ===== src/types/index.ts =====

import type { BoardCell, GridPosition, GridDimensions } from './board'
import type { MoveResult } from './solver'

// Board types
export type {
  CellValue,
  BoardCell,
  GridPosition,
  BoardGrid,
  GridDimensions,
  CellNeighbors,
  BoardState,
} from './board'

// Color types
export type {
  ColorSettings,
  RGBColor,
  ColorMatch,
  ColorDetectionResult,
  ColorDebugInfo,
  ColorTolerance,
  ColorKey,
  CellColorType,
} from './colors'

// Analysis types
export type {
  DetectedBoard,
  AnalysisResult,
  ImageData,
  CellBounds,
  CellAnalysis,
  PixelSample,
  GridAnalysisOptions,
  AnalysisStats,
} from './analysis'

// Solver types
export type {
  MoveResult,
  SolverOptions,
  SolverState,
  CellConstraint,
  SolverStats,
  MoveType,
  HighlightType,
} from './solver'

// Event types for components
export interface CellClickEvent {
  cell: BoardCell
  position: GridPosition
  originalEvent: MouseEvent
}

export interface SolveCompleteEvent {
  moves: MoveResult
  processingTime: number
}

// Simple app config
export interface AppConfig {
  defaultGridSize: GridDimensions
  colorTolerance: number
  maxImageSize: number
}

// Preset configurations
export interface PresetConfig {
  name: string
  dimensions: GridDimensions
  description: string
}

// Constants
export const PRESET_SIZES = [
  { name: 'Beginner', rows: 9, cols: 9, mines: 10 },
  { name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  { name: 'Expert', rows: 30, cols: 16, mines: 99 },
  { name: 'GTNH Small', rows: 13, cols: 13, mines: 20 },
  { name: 'GTNH Medium', rows: 15, cols: 15, mines: 30 },
  { name: 'GTNH Large', rows: 17, cols: 17, mines: 42 },
  { name: 'GTNH Extra Large', rows: 19, cols: 19, mines: 68 },
] as const

export type PresetName = (typeof PRESET_SIZES)[number]['name']
