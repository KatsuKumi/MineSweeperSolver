import { useColorStore } from '@/stores'
import { DEFAULT_TOLERANCE } from '@/types/colors'
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
    const dr = color1.r - color2.r
    const dg = color1.g - color2.g
    const db = color1.b - color2.b
    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  function getTargetColors(): ColorMatch[] {
    const settings = colorStore.settings
    return [
      { name: '1', rgb: hexToRgb(settings.color1), tolerance: DEFAULT_TOLERANCE.numbers },
      { name: '2', rgb: hexToRgb(settings.color2), tolerance: DEFAULT_TOLERANCE.numbers },
      { name: '3', rgb: hexToRgb(settings.color3), tolerance: DEFAULT_TOLERANCE.numbers },
      { name: '4', rgb: hexToRgb(settings.color4), tolerance: DEFAULT_TOLERANCE.numbers },
      { name: 'M', rgb: hexToRgb(settings.colorMine), tolerance: DEFAULT_TOLERANCE.mines },
    ]
  }

  function medianColor(pixels: RGBColor[]): RGBColor {
    const rs = pixels.map((p) => p.r).sort((a, b) => a - b)
    const gs = pixels.map((p) => p.g).sort((a, b) => a - b)
    const bs = pixels.map((p) => p.b).sort((a, b) => a - b)
    const mid = Math.floor(pixels.length / 2)
    return { r: rs[mid], g: gs[mid], b: bs[mid] }
  }

  function classifyCellPixels(pixels: RGBColor[]): { cellType: CellValue; debugInfo: string } {
    if (pixels.length === 0) {
      return { cellType: '', debugInfo: 'rgb(0,0,0) [no samples]' }
    }

    const targetColors = getTargetColors()
    const unrevealedRgb = hexToRgb(colorStore.settings.colorUnrevealed)
    const emptyRgb = hexToRgb(colorStore.settings.colorEmpty)

    const scores = new Map<string, { score: number; count: number; bestRgb: RGBColor; bestDist: number }>()
    for (const target of targetColors) {
      scores.set(target.name, { score: 0, count: 0, bestRgb: target.rgb, bestDist: Infinity })
    }

    for (const pixel of pixels) {
      const bgDistance = Math.min(
        calculateDistance(pixel, unrevealedRgb),
        calculateDistance(pixel, emptyRgb),
      )
      // Skip pixels that blend closely into tile backgrounds
      if (bgDistance < 55) continue

      let bestMatch: ColorMatch | null = null
      let bestDistance = Infinity

      for (const color of targetColors) {
        const distance = calculateDistance(pixel, color.rgb)
        if (distance < bestDistance) {
          bestDistance = distance
          bestMatch = color
        }
      }

      if (bestMatch && bestDistance <= bestMatch.tolerance) {
        const entry = scores.get(bestMatch.name)!
        entry.score += Math.max(0.1, 1 - bestDistance / (bestMatch.tolerance + 10))
        entry.count++
        if (bestDistance < entry.bestDist) {
          entry.bestDist = bestDistance
          entry.bestRgb = pixel
        }
      }
    }

    const minMatchPixels = pixels.length >= 25 ? 2 : 1
    let winnerName: string | null = null
    let winnerScore = 0

    for (const [name, entry] of scores.entries()) {
      if (entry.count >= minMatchPixels && entry.score > winnerScore) {
        winnerScore = entry.score
        winnerName = name
      }
    }

    if (winnerName) {
      const best = scores.get(winnerName)!
      return {
        cellType: winnerName as CellValue,
        debugInfo: `rgb(${best.bestRgb.r},${best.bestRgb.g},${best.bestRgb.b}) [found ${winnerName}, n=${best.count}]`,
      }
    }

    const medColor = medianColor(pixels)
    const unrevealedDistance = calculateDistance(medColor, unrevealedRgb)
    const emptyDistance = calculateDistance(medColor, emptyRgb)

    if (
      unrevealedDistance <= emptyDistance &&
      unrevealedDistance <= DEFAULT_TOLERANCE.unrevealed
    ) {
      return {
        cellType: '',
        debugInfo: `rgb(${medColor.r},${medColor.g},${medColor.b}) [unrevealed]`,
      }
    }

    if (emptyDistance <= DEFAULT_TOLERANCE.empty) {
      return {
        cellType: '0',
        debugInfo: `rgb(${medColor.r},${medColor.g},${medColor.b}) [empty]`,
      }
    }

    return {
      cellType: '',
      debugInfo: `rgb(${medColor.r},${medColor.g},${medColor.b}) [unknown]`,
    }
  }

  function analyzeCell(
    imageData: Uint8ClampedArray,
    width: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): { cellType: CellValue; debugInfo: string } {
    const marginX = Math.floor((right - left) * 0.14)
    const marginY = Math.floor((bottom - top) * 0.14)
    const height = Math.floor(imageData.length / (width * 4))

    const pixels: RGBColor[] = []
    for (let y = top + marginY; y < bottom - marginY; y += 1) {
      if (y < 0 || y >= height) continue
      for (let x = left + marginX; x < right - marginX; x += 1) {
        if (x < 0 || x >= width) continue
        const i = (y * width + x) * 4
        pixels.push({
          r: imageData[i],
          g: imageData[i + 1],
          b: imageData[i + 2],
        })
      }
    }

    return classifyCellPixels(pixels)
  }

  return {
    hexToRgb,
    calculateDistance,
    getTargetColors,
    classifyCellPixels,
    analyzeCell,
  }
}
