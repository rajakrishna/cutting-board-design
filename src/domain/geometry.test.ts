import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultBoard } from './defaults';
import { buildFinishedPolygons, computeSliceCount, stopBlock } from './geometry';
import { computeCutSummary, formatInches } from './cutList';
import { buildGuide } from './guide';
import { randomizeBoard } from './randomize';
import { PRESETS } from '../data/templates';

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('ships the eight research presets', () => {
    expect(PRESETS.map((p) => p.id)).toEqual([
      'cube-illusion',
      'newton-3d',
      'tumbling-block',
      'four-towers',
      'checkerboard',
      'brick',
      'chevron',
      'butcher-bands',
    ]);
  });

  it('cube illusion cycles maple → cherry → walnut each row', () => {
    const preset = PRESETS.find((p) => p.id === 'cube-illusion')!;
    const board = { id: 't', name: 't', ...preset.board };
    const polys = buildFinishedPolygons(board);
    const row0 = polys.filter((p) => p.stripId.endsWith('-r0')).map((p) => p.woodId);
    const row1 = polys.filter((p) => p.stripId.endsWith('-r1')).map((p) => p.woodId);
    expect(row0.slice(0, 3)).toEqual(['hard-maple', 'cherry', 'walnut']);
    expect(row1[0]).toBe(row0[1]);
    expect(row1[1]).toBe(row0[2]);
  });

  it('chevron negates trailing angle on rotated rows', () => {
    const preset = PRESETS.find((p) => p.id === 'chevron')!;
    const board = { id: 't', name: 't', ...preset.board };
    const polys = buildFinishedPolygons(board);
    const row0 = polys.find((p) => p.stripId.endsWith('-r0'))!;
    const row1 = polys.find((p) => p.stripId.endsWith('-r1'))!;
    expect(row0.angle).toBe(20);
    expect(row1.angle).toBe(-20);
  });

  it('does not randomize to an offset-row pattern', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const brick = PRESETS.find((preset) => preset.id === 'brick')!;
    const checker = PRESETS.find((preset) => preset.id === 'checkerboard')!;

    const board = randomizeBoard(createDefaultBoard(), [brick, checker]);

    expect(board.settings.rowOffset).toBe(0);
  });
});
