// ===== src/types/solver.ts =====

import type { GridPosition } from './board'

export interface MoveResult {
  safeMoves: GridPosition[]
  mineMoves: GridPosition[]
}

export interface SolverOptions {
  includeHighlights: boolean
  debugMode: boolean
}

export interface SolverState {
  isRunning: boolean
  lastResult?: MoveResult
  processingTime?: number
}

export interface CellConstraint {
  position: GridPosition
  targetCount: number
  currentMines: number
  unrevealedCells: GridPosition[]
}

export interface SolverStats {
  totalConstraints: number
  solvedConstraints: number
  safeMoveCount: number
  mineMoveCount: number
  processingTimeMs: number
}

export type MoveType = 'safe' | 'mine'
export type HighlightType = 'safe' | 'mine' | 'none'

export const DEFAULT_SOLVER_OPTIONS: SolverOptions = {
  includeHighlights: true,
  debugMode: false,
}
