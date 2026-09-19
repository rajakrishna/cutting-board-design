import { describe, expect, it } from 'vitest'
import { createDefaultBoard } from './defaults'
import { computeSliceCount } from './geometry'
import { glueUpKerfCuts, stageSliceGap, stageUsesFinished } from './buildStages'

describe('build stages', () => {
  it('only glue and final use the finished face', () => {
    expect(stageUsesFinished('start')).toBe(false)
    expect(stageUsesFinished('cut')).toBe(false)
    expect(stageUsesFinished('glue')).toBe(true)
    expect(stageUsesFinished('final')).toBe(true)
    expect(stageSliceGap('glue')).toBeGreaterThan(0)
    expect(stageSliceGap('final')).toBe(0)
  })

  it('places kerf-aware cut slots between slices', () => {
    const board = createDefaultBoard()
    const { count } = computeSliceCount(board)
    const cuts = glueUpKerfCuts(board)
    expect(cuts).toHaveLength(Math.max(0, count - 1))
    expect(cuts[0]?.h).toBe(board.settings.kerf)
    for (let i = 1; i < cuts.length; i++) {
      const gap = cuts[i]!.y - cuts[i - 1]!.y
      expect(gap).toBeCloseTo(
        board.settings.finishedThickness +
          board.settings.flattenAllowance +
          board.settings.kerf,
      )
    }
  })
})
