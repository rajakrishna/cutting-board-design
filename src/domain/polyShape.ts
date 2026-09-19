import type { RectPoly } from './types'

/** Fence shear only. ±90 shop-rotate is not a parallelogram. */
export function shearDegrees(angleDeg: number): number {
  if (!Number.isFinite(angleDeg)) return 0
  let a = angleDeg
  while (a > 180) a -= 360
  while (a <= -180) a += 360
  if (Math.abs(a) > 45) return 0
  return a
}

export function shearOffset(angleDeg: number, height: number): number {
  const a = shearDegrees(angleDeg)
  if (a === 0) return 0
  return height * Math.tan((a * Math.PI) / 180)
}

export function parallelogramPoints(p: Pick<RectPoly, 'x' | 'y' | 'w' | 'h' | 'angle'>): [
  number,
  number,
][] {
  const sk = shearOffset(p.angle, p.h)
  return [
    [p.x, p.y],
    [p.x + p.w, p.y],
    [p.x + p.w + sk, p.y + p.h],
    [p.x + sk, p.y + p.h],
  ]
}

export function polyBounds(polys: Pick<RectPoly, 'x' | 'y' | 'w' | 'h' | 'angle'>[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of polys) {
    for (const [x, y] of parallelogramPoints(p)) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 }
  return { minX, minY, maxX, maxY }
}
