import { describe, expect, it } from 'vitest'
import { parallelogramPoints, polyBounds, shearDegrees, shearOffset } from './polyShape'

describe('polyShape', () => {
  it('ignores shop-rotate angles', () => {
    expect(shearDegrees(0)).toBe(0)
    expect(shearDegrees(30)).toBe(30)
    expect(shearDegrees(-15)).toBe(-15)
    expect(shearDegrees(90)).toBe(0)
    expect(shearDegrees(105)).toBe(0)
  })

  it('shears a square into a 60° parallelogram at 30°', () => {
    const sk = shearOffset(30, 1)
    const pts = parallelogramPoints({ x: 0, y: 0, w: 1, h: 1, angle: 30 })
    const ax = pts[3]![0] - pts[0]![0]
    const ay = pts[3]![1] - pts[0]![1]
    const bx = pts[1]![0] - pts[0]![0]
    const by = pts[1]![1] - pts[0]![1]
    const cos = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
    expect(sk).toBeCloseTo(Math.tan(Math.PI / 6))
    expect(Math.acos(cos) * (180 / Math.PI)).toBeCloseTo(60, 5)
  })

  it('includes shear in bounds', () => {
    const b = polyBounds([{ x: 0, y: 0, w: 2, h: 1, angle: 30 }])
    expect(b.minX).toBe(0)
    expect(b.maxX).toBeCloseTo(2 + Math.tan(Math.PI / 6))
  })
})
