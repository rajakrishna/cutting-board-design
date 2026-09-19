import { describe, expect, it } from 'vitest'
import { createDefaultBoard } from './defaults'
import { computeSliceCount } from './geometry'
import {
  BUILD_STAGE_META,
  glueUpKerfCuts,
  glueUpSliceBands,
  stageSliceGap,
  stageShowsSliceOutlines,
  stageUsesFinished,
} from './buildStages'

describe('build stages', () => {
  it('only glue and final use the finished face', () => {
    expect(stageUsesFinished('start')).toBe(false)
    expect(stageUsesFinished('cut')).toBe(false)
    expect(stageUsesFinished('glue')).toBe(true)
    expect(stageUsesFinished('final')).toBe(true)
    expect(stageSliceGap('glue')).toBeGreaterThan(0)
    expect(stageSliceGap('final')).toBe(0)
  })

  it('names edge glue-up vs end-grain finished', () => {
    expect(BUILD_STAGE_META.start.label).toMatch(/edge glue-up/i)
    expect(BUILD_STAGE_META.glue.label).toMatch(/glue-up/i)
    expect(BUILD_STAGE_META.final.label).toMatch(/end-grain finished/i)
    expect(stageShowsSliceOutlines('cut')).toBe(true)
    expect(stageShowsSliceOutlines('start')).toBe(false)
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

  it('outlines one band per crosscut slice', () => {
    const board = createDefaultBoard()
    const { count } = computeSliceCount(board)
    const bands = glueUpSliceBands(board)
    expect(bands).toHaveLength(count)
    expect(bands[0]?.h).toBe(
      board.settings.finishedThickness + board.settings.flattenAllowance,
    )
  })
})
