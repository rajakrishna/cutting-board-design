import type { GrainMode } from '../../domain/types'

/** Zoom the preview opens at, and returns to on Fit. */
export const DEFAULT_ZOOM = 0.7

export type CameraPose = {
  position: [number, number, number]
  target: [number, number, number]
  distance: number
}

/** Long-grain 3/4: existing low isometric. End grain: slight overhead so the finished face fills the view. */
const FRAMING = {
  end: { x: 0.46, y: 1.24, z: 0.5 },
  long: { x: 0.9, y: 0.7, z: 0.9 },
} as const

export function frameBoardCamera(opts: {
  spanX: number
  spanZ: number
  thickness: number
  grainMode: GrainMode
  zoom?: number
}): CameraPose {
  const zoom = opts.zoom ?? DEFAULT_ZOOM
  const maxDim = Math.max(opts.spanX, opts.spanZ, 10)
  const dir = FRAMING[opts.grainMode]
  const target: [number, number, number] = [0, opts.thickness / 2, 0]
  const offset: [number, number, number] = [maxDim * dir.x, maxDim * dir.y, maxDim * dir.z]
  const position: [number, number, number] = [
    target[0] + offset[0] / zoom,
    target[1] + offset[1] / zoom,
    target[2] + offset[2] / zoom,
  ]
  const distance = Math.hypot(offset[0], offset[1], offset[2])
  return { position, target, distance }
}

export function cameraElevationRad(pose: CameraPose): number {
  const dy = pose.position[1] - pose.target[1]
  const dx = pose.position[0] - pose.target[0]
  const dz = pose.position[2] - pose.target[2]
  return Math.atan2(dy, Math.hypot(dx, dz))
}
