import { describe, expect, it } from 'vitest';
import { createDefaultBoard } from './defaults';
import { computeSliceCount, stopBlock } from './geometry';
import { computeCutSummary, formatInches } from './cutList';
import { buildGuide } from './guide';

describe('domain engine', () => {
  it('bakes flatten into stop block', () => {
    const board = createDefaultBoard();
    expect(stopBlock(board)).toBe(
      board.settings.finishedThickness + board.settings.flattenAllowance,
    );
  });

  it('computes end-grain slices and buy list', () => {
    const board = createDefaultBoard();
    const slices = computeSliceCount(board);
    expect(slices.count).toBeGreaterThan(0);
    const summary = computeCutSummary(board);
    expect(summary.buyList.length).toBeGreaterThan(0);
    expect(summary.stopBlock).toBe(stopBlock(board));
  });

  it('shortens guide for long grain and s4s', () => {
    const board = createDefaultBoard();
    board.grainMode = 'long';
    board.settings.stockMode = 's4s';
    const guide = buildGuide(board);
    expect(guide.some((s) => s.id === 'crosscut')).toBe(false);
    expect(guide.some((s) => s.id === 'mill')).toBe(false);
    expect(guide.some((s) => s.id === 'glue2')).toBe(false);
  });

  it('formats fractions', () => {
    expect(formatInches(1.5)).toBe('1 1/2"');
    expect(formatInches(0.125)).toBe('1/8"');
  });
});
