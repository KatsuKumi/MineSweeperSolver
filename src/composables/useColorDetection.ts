import { useColorStore } from '@/stores'
import type { RGBColor, ColorMatch, CellValue } from '@/types'

export function useColorDetection() {
  const colorStore = useColorStore()

  function hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  function calculateDistance(color1: RGBColor, color2: RGBColor): number {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2),
    )
  }

  function getTargetColors(): ColorMatch[] {
    const settings = colorStore.settings
    return [
      { name: '1', rgb: hexToRgb(settings.color1), tolerance: 50 },
      { name: '2', rgb: hexToRgb(settings.color2), tolerance: 50 },
      { name: '3', rgb: hexToRgb(settings.color3), tolerance: 50 },
      { name: '4', rgb: hexToRgb(settings.color4), tolerance: 50 },
      { name: 'M', rgb: hexToRgb(settings.colorMine), tolerance: 50 },
    ]
  }

  function analyzeCell(
    imageData: Uint8ClampedArray,
    width: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): { cellType: CellValue; debugInfo: string } {
    const targetColors = getTargetColors()
    const marginX = Math.floor((right - left) * 0.1)
    const marginY = Math.floor((bottom - top) * 0.1)

    // Check for number/mine colors first
    for (let y = top + marginY; y < bottom - marginY; y += 1) {
      for (let x = left + marginX; x < right - marginX; x += 1) {
        if (x >= 0 && x < width && y >= 0) {
          const i = (y * width + x) * 4
          const pixelColor: RGBColor = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
          }

          for (const color of targetColors) {
            const distance = calculateDistance(pixelColor, color.rgb)
            if (distance <= color.tolerance) {
              return {
                cellType: color.name as CellValue,
                debugInfo: `rgb(${pixelColor.r},${pixelColor.g},${pixelColor.b}) [found ${color.name}]`,
              }
            }
          }
        }
      }
    }

    // Sample average color for background detection
    let r = 0,
      g = 0,
      b = 0,
      samples = 0
    for (let y = top + marginY; y < bottom - marginY; y += 2) {
      for (let x = left + marginX; x < right - marginX; x += 2) {
        if (x >= 0 && x < width && y >= 0) {
          const i = (y * width + x) * 4
          r += imageData[i]
          g += imageData[i + 1]
          b += imageData[i + 2]
          samples++
        }
      }
    }

    if (samples === 0) return { cellType: '', debugInfo: 'rgb(0,0,0) [no samples]' }

    const avgColor: RGBColor = {
      r: Math.round(r / samples),
      g: Math.round(g / samples),
      b: Math.round(b / samples),
    }

    // Check unrevealed color
    const unrevealedRgb = hexToRgb(colorStore.settings.colorUnrevealed)
    const unrevealedDistance = calculateDistance(avgColor, unrevealedRgb)
    if (unrevealedDistance <= 40) {
      return {
        cellType: '',
        debugInfo: `rgb(${avgColor.r},${avgColor.g},${avgColor.b}) [unrevealed]`,
      }
    }

    // Check empty color
    const emptyRgb = hexToRgb(colorStore.settings.colorEmpty)
    const emptyDistance = calculateDistance(avgColor, emptyRgb)
    if (emptyDistance <= 40) {
      return { cellType: '0', debugInfo: `rgb(${avgColor.r},${avgColor.g},${avgColor.b}) [empty]` }
    }

    return { cellType: '', debugInfo: `rgb(${avgColor.r},${avgColor.g},${avgColor.b}) [unknown]` }
  }

  return {
    hexToRgb,
    calculateDistance,
    getTargetColors,
    analyzeCell,
  }
}
