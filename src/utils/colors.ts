export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function colorDistance(
  color1: [number, number, number], 
  color2: [number, number, number]
): number {
  const [r1, g1, b1] = color1
  const [r2, g2, b2] = color2
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
}

export function isColorSimilar(
  color1: [number, number, number], 
  color2: [number, number, number], 
  tolerance: number = 50
): boolean {
  return colorDistance(color1, color2) <= tolerance
}