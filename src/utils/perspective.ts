export interface Point2D {
  x: number
  y: number
}

export interface BoardQuad {
  topLeft: Point2D
  topRight: Point2D
  bottomRight: Point2D
  bottomLeft: Point2D
}

function parseHexRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0]
}

function rgbDistSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return dr * dr + dg * dg + db * db
}

/**
 * Solves an 8x8 linear system using Gaussian elimination with partial pivoting
 * to return a 3x3 homography matrix (row-major length-9 array) mapping src -> dst.
 */
export function computeHomography(
  src: [Point2D, Point2D, Point2D, Point2D],
  dst: [Point2D, Point2D, Point2D, Point2D],
): number[] {
  const A: number[][] = []
  const b: number[] = []

  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]
    const { x: u, y: v } = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  }

  const n = 8
  for (let col = 0; col < n; col++) {
    let maxRow = col
    let maxVal = Math.abs(A[col][col])
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(A[row][col])
      if (val > maxVal) {
        maxVal = val
        maxRow = row
      }
    }

    ;[A[col], A[maxRow]] = [A[maxRow], A[col]]
    ;[b[col], b[maxRow]] = [b[maxRow], b[col]]

    const pivot = A[col][col]
    if (Math.abs(pivot) < 1e-12) continue

    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / pivot
      for (let k = col; k < n; k++) {
        A[row][k] -= factor * A[col][k]
      }
      b[row] -= factor * b[col]
    }
  }

  const h = new Array<number>(9).fill(0)
  h[8] = 1
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row]
    for (let col = row + 1; col < n; col++) {
      sum -= A[row][col] * h[col]
    }
    h[row] = Math.abs(A[row][row]) > 1e-12 ? sum / A[row][row] : 0
  }

  return h
}

export function projectPoint(H: number[], x: number, y: number): Point2D {
  const w = H[6] * x + H[7] * y + H[8]
  if (Math.abs(w) < 1e-12) return { x, y }
  return {
    x: (H[0] * x + H[1] * y + H[2]) / w,
    y: (H[3] * x + H[4] * y + H[5]) / w,
  }
}

export function fullImageQuad(width: number, height: number): BoardQuad {
  return {
    topLeft: { x: 0, y: 0 },
    topRight: { x: width, y: 0 },
    bottomRight: { x: width, y: height },
    bottomLeft: { x: 0, y: height },
  }
}

/**
 * Automatically detects the 4 corners of the minesweeper board inside either
 * a cropped image (with optional wall borders/tilt) or a full screenshot.
 */
export function detectBoardQuad(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  unrevealedHex = '#07304e',
  emptyHex = '#031928',
): BoardQuad {
  const fallback = fullImageQuad(width, height)
  if (width < 16 || height < 16) return fallback

  const [ur, ug, ub] = parseHexRgb(unrevealedHex)
  const [er, eg, eb] = parseHexRgb(emptyHex)

  const ds = Math.max(2, Math.floor(Math.min(width, height) / 220))
  const mw = Math.floor(width / ds)
  const mh = Math.floor(height / ds)
  if (mw < 4 || mh < 4) return fallback

  const grid = new Uint8Array(mw * mh)
  const thresholdSq = 28 * 28
  const isBlueTheme = ub > ug + 6 && ub > ur + 10

  for (let my = 0; my < mh; my++) {
    const sy = my * ds + (ds >> 1)
    for (let mx = 0; mx < mw; mx++) {
      const sx = mx * ds + (ds >> 1)
      const i = (sy * width + sx) * 4
      const r = imageData[i]
      const g = imageData[i + 1]
      const b = imageData[i + 2]

      const isBlueTile = b > g + 6 && b > r + 12 && r < 70 && b >= 24 && b <= 165
      const isCustomThemeMatch =
        !isBlueTheme &&
        (rgbDistSq(r, g, b, ur, ug, ub) <= thresholdSq ||
          rgbDistSq(r, g, b, er, eg, eb) <= thresholdSq)

      if (isBlueTile || isCustomThemeMatch) {
        grid[my * mw + mx] = 1
      }
    }
  }

  // Dilate by 2 cells so digits/flags inside cells merge into the board region
  const dilated = new Uint8Array(mw * mh)
  for (let my = 0; my < mh; my++) {
    for (let mx = 0; mx < mw; mx++) {
      if (!grid[my * mw + mx]) continue
      const y0 = Math.max(0, my - 2)
      const y1 = Math.min(mh - 1, my + 2)
      const x0 = Math.max(0, mx - 2)
      const x1 = Math.min(mw - 1, mx + 2)
      for (let ny = y0; ny <= y1; ny++) {
        for (let nx = x0; nx <= x1; nx++) {
          dilated[ny * mw + nx] = 1
        }
      }
    }
  }

  // Largest 4-connected component
  const visited = new Uint8Array(mw * mh)
  const queue = new Int32Array(mw * mh)
  let bestComponent: number[] = []

  for (let idx = 0; idx < mw * mh; idx++) {
    if (!dilated[idx] || visited[idx]) continue
    let head = 0
    let tail = 0
    queue[tail++] = idx
    visited[idx] = 1
    const comp: number[] = []

    while (head < tail) {
      const cur = queue[head++]
      comp.push(cur)
      const cx = cur % mw
      const cy = (cur - cx) / mw

      if (cx > 0) {
        const n = cur - 1
        if (dilated[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
      if (cx + 1 < mw) {
        const n = cur + 1
        if (dilated[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
      if (cy > 0) {
        const n = cur - mw
        if (dilated[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
      if (cy + 1 < mh) {
        const n = cur + mw
        if (dilated[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
    }

    if (comp.length > bestComponent.length) {
      bestComponent = comp
    }
  }

  if (bestComponent.length < mw * mh * 0.04) {
    return fallback
  }

  // Extract extreme corners using undilated pixels in the winning component
  const points: Point2D[] = []
  for (const idx of bestComponent) {
    if (!grid[idx]) continue
    const mx = idx % mw
    const my = (idx - mx) / mw
    points.push({ x: mx * ds + ds * 0.5, y: my * ds + ds * 0.5 })
  }

  if (points.length < 4) return fallback

  let minSum = Infinity
  let maxSum = -Infinity
  let minDiff = Infinity
  let maxDiff = -Infinity
  let tl = points[0]
  let br = points[0]
  let bl = points[0]
  let tr = points[0]

  for (const pt of points) {
    const sum = pt.x + pt.y
    const diff = pt.x - pt.y
    if (sum < minSum) {
      minSum = sum
      tl = pt
    }
    if (sum > maxSum) {
      maxSum = sum
      br = pt
    }
    if (diff > maxDiff) {
      maxDiff = diff
      tr = pt
    }
    if (diff < minDiff) {
      minDiff = diff
      bl = pt
    }
  }

  const nearBorderX = width * 0.025
  const nearBorderY = height * 0.025
  const coversFull =
    tl.x <= nearBorderX &&
    bl.x <= nearBorderX &&
    tr.x >= width - nearBorderX &&
    br.x >= width - nearBorderX &&
    tl.y <= nearBorderY &&
    tr.y <= nearBorderY &&
    bl.y >= height - nearBorderY &&
    br.y >= height - nearBorderY

  if (coversFull) {
    return fallback
  }

  return {
    topLeft: tl,
    topRight: tr,
    bottomRight: br,
    bottomLeft: bl,
  }
}
