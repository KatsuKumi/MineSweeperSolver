import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useColorDetection } from '@/composables/useColorDetection'

function makeCellImage(
  width: number,
  height: number,
  bg: [number, number, number],
  fgRects: Array<{
    x0: number
    y0: number
    x1: number
    y1: number
    color: [number, number, number]
  }> = [],
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      let [r, g, b] = bg
      for (const rect of fgRects) {
        if (x >= rect.x0 && x < rect.x1 && y >= rect.y0 && y < rect.y1) {
          ;[r, g, b] = rect.color
        }
      }
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}

describe('useColorDetection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('detects GTNH/Minecraft number 1 pixels accurately', () => {
    const { analyzeCell } = useColorDetection()
    const data = makeCellImage(40, 40, [3, 25, 40], [
      { x0: 16, y0: 10, x1: 24, y1: 30, color: [102, 95, 255] },
    ])

    const res = analyzeCell(data, 40, 0, 0, 40, 40)
    expect(res.cellType).toBe('1')
  })

  it('detects GTNH/Minecraft number 4 pixels accurately', () => {
    const { analyzeCell } = useColorDetection()
    const data = makeCellImage(40, 40, [3, 25, 40], [
      { x0: 12, y0: 10, x1: 28, y1: 30, color: [0, 39, 255] },
    ])

    const res = analyzeCell(data, 40, 0, 0, 40, 40)
    expect(res.cellType).toBe('4')
  })

  it('does not misclassify 1 as 4 when anti-aliased edge pixels appear earlier in scan order', () => {
    const { analyzeCell } = useColorDetection()
    const data = makeCellImage(40, 40, [3, 25, 40], [
      // Single dim bluish anti-aliased pixel near top-left of glyph
      { x0: 14, y0: 10, x1: 15, y1: 11, color: [42, 48, 160] },
      // Main body of "1"
      { x0: 16, y0: 12, x1: 24, y1: 30, color: [102, 95, 255] },
    ])

    const res = analyzeCell(data, 40, 0, 0, 40, 40)
    expect(res.cellType).toBe('1')
  })

  it('distinguishes 3 from red flag/mine pixels', () => {
    const { analyzeCell } = useColorDetection()
    const threeData = makeCellImage(40, 40, [3, 25, 40], [
      { x0: 14, y0: 10, x1: 26, y1: 30, color: [235, 62, 65] },
    ])
    const flagData = makeCellImage(40, 40, [3, 25, 40], [
      { x0: 14, y0: 10, x1: 26, y1: 30, color: [250, 3, 3] },
    ])

    expect(analyzeCell(threeData, 40, 0, 0, 40, 40).cellType).toBe('3')
    expect(analyzeCell(flagData, 40, 0, 0, 40, 40).cellType).toBe('M')
  })

  it('distinguishes unrevealed and empty cells reliably', () => {
    const { analyzeCell } = useColorDetection()
    const unrevealed = makeCellImage(40, 40, [7, 48, 78])
    const empty = makeCellImage(40, 40, [3, 25, 40])

    expect(analyzeCell(unrevealed, 40, 0, 0, 40, 40).cellType).toBe('')
    expect(analyzeCell(empty, 40, 0, 0, 40, 40).cellType).toBe('0')
  })
})

