import type { BuildStage } from '../../domain/buildStages'
import type { GrainMode } from '../../domain/types'

/** Zoom the preview opens at, and returns to on Fit. */
export const DEFAULT_ZOOM = 0.7

export type CameraPose = {
  position: [number, number, number]
  target: [number, number, number]
  distance: number
}

type Framing = { x: number; y: number; z: number }

/** Long-grain 3/4: existing low isometric. End grain Final: slight overhead hero. */
const FRAMING: Record<'end' | 'long' | BuildStage, Framing> = {
  end: { x: 0.46, y: 1.24, z: 0.5 },
  long: { x: 0.9, y: 0.7, z: 0.9 },
  start: { x: 0.95, y: 0.58, z: 0.72 },
  cut: { x: 0.32, y: 1.32, z: 0.48 },
  glue: { x: 0.55, y: 1.12, z: 0.58 },
  final: { x: 0.46, y: 1.24, z: 0.5 },
}

export function frameBoardCamera(opts: {
  spanX: number
  spanZ: number
  thickness: number
  grainMode: GrainMode
  stage?: BuildStage
  zoom?: number
}): CameraPose {
  const zoom = opts.zoom ?? DEFAULT_ZOOM
  const maxDim = Math.max(opts.spanX, opts.spanZ, 10)
  const dir =
    opts.grainMode === 'long'
      ? FRAMING.long
      : FRAMING[opts.stage ?? 'final']
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
