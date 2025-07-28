// ===== src/types/board.ts =====

export type CellValue = '' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'M' | 'F'

export interface BoardCell {
  value: CellValue
  row: number
  col: number
  isHighlighted?: boolean
  highlightType?: 'safe' | 'mine'
}

export type GridPosition = [number, number]
export type BoardGrid = BoardCell[][]

export interface GridDimensions {
  rows: number
  cols: number
  mines: number
}

export interface CellNeighbors {
  position: GridPosition
  neighbors: GridPosition[]
  neighborCells: BoardCell[]
}

export interface BoardState {
  grid: BoardGrid
  dimensions: GridDimensions
  totalCells: number
  revealedCells: number
  flaggedCells: number
}

export const VALID_CELL_VALUES: readonly CellValue[] = [
  '',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  'M',
  'F',
] as const

export const DEFAULT_DIMENSIONS: GridDimensions = {
  rows: 12,
  cols: 12,
  mines: 20,
}
