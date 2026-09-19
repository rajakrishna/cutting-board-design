import { describe, expect, it } from 'vitest'
import { cameraElevationRad, frameBoardCamera } from './cameraFraming'

const board = { spanX: 12, spanZ: 16, thickness: 1.5 }

describe('frameBoardCamera', () => {
  it('aims end-grain hero more overhead so the finished face fills the view', () => {
    const end = frameBoardCamera({ ...board, grainMode: 'end' })
    const long = frameBoardCamera({ ...board, grainMode: 'long' })
    const endElev = cameraElevationRad(end)
    const longElev = cameraElevationRad(long)

    expect(endElev).toBeGreaterThan(longElev)
    expect(endElev).toBeGreaterThan((50 * Math.PI) / 180)
    expect(longElev).toBeLessThan((40 * Math.PI) / 180)
  })

  it('looks at the board volume, not the bench', () => {
    const pose = frameBoardCamera({ ...board, grainMode: 'end' })
    expect(pose.target[1]).toBeCloseTo(board.thickness / 2)
  })

  it('uses a lower 3/4 on Start and hero overhead on Final', () => {
    const start = frameBoardCamera({ ...board, grainMode: 'end', stage: 'start' })
    const fin = frameBoardCamera({ ...board, grainMode: 'end', stage: 'final' })
    expect(cameraElevationRad(fin)).toBeGreaterThan(cameraElevationRad(start))
  })

  it('treats distance as the zoom=1 reference so Fit matches the 70% open shot', () => {
    const pose = frameBoardCamera({ ...board, grainMode: 'end' })
    const openDist = Math.hypot(
      pose.position[0] - pose.target[0],
      pose.position[1] - pose.target[1],
      pose.position[2] - pose.target[2],
    )
    expect(pose.distance / openDist).toBeCloseTo(0.7)
  })
})
