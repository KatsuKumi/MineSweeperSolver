import { describe, it, expect } from 'vitest'
import { computeHomography, projectPoint, detectBoardQuad } from '@/utils/perspective'

describe('perspective utilities', () => {
  it('computes homography mapping unit square to an arbitrary quad', () => {
    const H = computeHomography(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      [
        { x: 100, y: 50 },
        { x: 300, y: 60 },
        { x: 340, y: 260 },
        { x: 80, y: 250 },
      ],
    )

    const tl = projectPoint(H, 0, 0)
    const br = projectPoint(H, 1, 1)
    const mid = projectPoint(H, 0.5, 0.5)

    expect(tl.x).toBeCloseTo(100, 1)
    expect(tl.y).toBeCloseTo(50, 1)
    expect(br.x).toBeCloseTo(340, 1)
    expect(br.y).toBeCloseTo(260, 1)
    expect(mid.x).toBeGreaterThan(180)
    expect(mid.x).toBeLessThan(230)
    expect(mid.y).toBeGreaterThan(130)
    expect(mid.y).toBeLessThan(180)
  })

  it('detects board quad inside a screenshot with surrounding borders', () => {
    const w = 240
    const h = 180
    const data = new Uint8ClampedArray(w * h * 4)

    // Fill background with green-gray wall color
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const inBoard = x >= 40 && x < 200 && y >= 20 && y < 160
        if (inBoard) {
          data[i] = 7
          data[i + 1] = 48
          data[i + 2] = 78
        } else {
          data[i] = 35
          data[i + 1] = 55
          data[i + 2] = 35
        }
        data[i + 3] = 255
      }
    }

    const quad = detectBoardQuad(data, w, h, '#07304e', '#031928')
    expect(quad.topLeft.x).toBeGreaterThanOrEqual(34)
    expect(quad.topLeft.x).toBeLessThanOrEqual(46)
    expect(quad.topLeft.y).toBeGreaterThanOrEqual(14)
    expect(quad.topLeft.y).toBeLessThanOrEqual(26)
    expect(quad.bottomRight.x).toBeGreaterThanOrEqual(194)
    expect(quad.bottomRight.x).toBeLessThanOrEqual(206)
    expect(quad.bottomRight.y).toBeGreaterThanOrEqual(154)
    expect(quad.bottomRight.y).toBeLessThanOrEqual(166)
  })
})

