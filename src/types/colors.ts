// ===== src/types/colors.ts =====

export interface ColorSettings {
  color1: string
  color2: string
  color3: string
  color4: string
  colorMine: string
  colorUnrevealed: string
  colorEmpty: string
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface ColorMatch {
  name: string
  rgb: RGBColor
  tolerance: number
}

export interface ColorDetectionResult {
  detectedType: string
  confidence: number
  analyzedColor: RGBColor
  distances: Array<{
    colorName: string
    distance: number
  }>
  success: boolean
}

export interface ColorDebugInfo {
  position: [number, number]
  colorString: string
  detectedType: string
  closestDistance: number
  closestMatch: string
  successful: boolean
}

export interface ColorTolerance {
  numbers: number
  mines: number
  unrevealed: number
  empty: number
}


export type ColorKey = keyof ColorSettings
export type CellColorType = '1' | '2' | '3' | '4' | 'M' | 'unrevealed' | 'empty'

export const DEFAULT_COLORS: ColorSettings = {
  color1: '#c29af0',
  color2: '#15f41c',
  color3: '#fc5342',
  color4: '#3300ea',
  colorMine: '#fd0a0c',
  colorUnrevealed: '#163a61',
  colorEmpty: '#0a1e31',
} as const

export const DEFAULT_TOLERANCE: ColorTolerance = {
  numbers: 50,
  mines: 50,
  unrevealed: 40,
  empty: 40,
} as const

export const COLOR_DISPLAY_NAMES: Record<ColorKey, string> = {
  color1: 'Number 1',
  color2: 'Number 2',
  color3: 'Number 3',
  color4: 'Number 4',
  colorMine: 'Mines/Flags',
  colorUnrevealed: 'Unrevealed Cells',
  colorEmpty: 'Empty Cells',
} as const


