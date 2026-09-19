import type { Board } from './types'
import { computeSliceCount, stopBlock } from './geometry'

export const BUILD_STAGES = ['start', 'cut', 'glue', 'final'] as const
export type BuildStage = (typeof BUILD_STAGES)[number]

export const BUILD_STAGE_META: Record<
  BuildStage,
  { label: string; caption: string }
> = {
  start: {
    label: 'Start',
    caption: 'Strip layout — first glue-up, edge-grain blank',
  },
  cut: {
    label: 'Cut',
    caption: 'Crosscut slices at the stop. Kerf shown.',
  },
  glue: {
    label: 'Glue',
    caption: 'Stand on end → flip/rotate alternate → re-glue',
  },
  final: {
    label: 'Final',
    caption: 'Finished end-grain face',
  },
}

export function isBuildStage(v: string): v is BuildStage {
  return (BUILD_STAGES as readonly string[]).includes(v)
}

export function stageIndex(stage: BuildStage): number {
  return BUILD_STAGES.indexOf(stage)
}

export function stageUsesFinished(stage: BuildStage): boolean {
  return stage === 'glue' || stage === 'final'
}

export function stageSliceGap(stage: BuildStage): number {
  return stage === 'glue' ? 0.45 : 0
}

export function stageShowsKerf(stage: BuildStage): boolean {
  return stage === 'cut'
}

export type KerfCut = { y: number; h: number }

/** Kerf slots along glue-up 1, leftover split on both ends. */
export function glueUpKerfCuts(board: Board): KerfCut[] {
  if (board.grainMode !== 'end') return []
  const { count } = computeSliceCount(board)
  const block = stopBlock(board)
  const kerf = board.settings.kerf
  const extra = board.settings.extraLength
  const cuts: KerfCut[] = []
  let y = extra / 2
  for (let i = 0; i < count; i++) {
    y += block
    if (i < count - 1) {
      cuts.push({ y, h: Math.max(0.04, kerf) })
      y += kerf
    }
  }
  return cuts
}

export function rowIndexFromStripId(stripId: string): number {
  const m = /-r(\d+)$/.exec(stripId)
  return m ? Number(m[1]) : 0
}
