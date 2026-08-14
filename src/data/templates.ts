import type { Preset, Strip } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/defaults';

function s(woodId: string, width: number, trailingAngle = 0): Strip {
  return {
    id: Math.random().toString(36).slice(2, 9),
    woodId,
    width,
    trailingAngle,
  };
}

function baseSettings(overrides: Partial<typeof DEFAULT_SETTINGS> = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...overrides,
    extras: { ...DEFAULT_SETTINGS.extras, ...(overrides.extras ?? {}) },
  };
}

export const PRESETS: Preset[] = [
  {
    id: 'stripes',
    name: 'Classic Stripes',
    description: 'Alternating maple and walnut. Square rips.',
    cutCard: { ripAngle: 0, miterAngle: 0, notes: 'Square rips, 0° trailing.' },
    board: {
      grainMode: 'end',
      strips: [
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
      ],
      settings: baseSettings({ finishedWidth: 12, flipAlternate: false }),
      sliceOverrides: [],
    },
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    description: 'Flip every other slice for a checker pattern.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0° rips; flip every other slice.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
        s('walnut', 1.5),
        s('hard-maple', 1.5),
      ],
      settings: baseSettings({
        finishedWidth: 12,
        flipAlternate: true,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'three-wood',
    name: 'Three-Wood Bands',
    description: 'Maple, walnut, and cherry bands.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0°; listed strip widths.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('hard-maple', 2),
        s('walnut', 1),
        s('cherry', 2),
        s('walnut', 1),
        s('hard-maple', 2),
        s('walnut', 1),
        s('cherry', 2),
        s('walnut', 1),
      ],
      settings: baseSettings({ finishedWidth: 12 }),
      sliceOverrides: [],
    },
  },
  {
    id: 'chevron',
    name: 'Diagonal / Chevron',
    description: 'Trailing-angle chevron accent. Not herringbone.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 15,
      notes: 'Trailing angle 15° on listed strips. CBDJS-style — not herringbone.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('walnut', 1.25, 15),
        s('hard-maple', 1.25, 15),
        s('walnut', 1.25, 15),
        s('hard-maple', 1.25, 15),
        s('walnut', 1.25, 15),
        s('hard-maple', 1.25, 15),
        s('walnut', 1.25, 15),
        s('hard-maple', 1.25, 15),
      ],
      settings: baseSettings({ finishedWidth: 10, flipAlternate: true }),
      sliceOverrides: [],
    },
  },
  {
    id: 'brick',
    name: 'Brick / Running Bond',
    description: 'Half-block offset rows. Straight cuts only.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0° rips; alternate rows offset by half a block. Split one slice per offset row.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('hard-maple', 2),
        s('walnut', 2),
        s('hard-maple', 2),
        s('walnut', 2),
        s('hard-maple', 2),
        s('walnut', 2),
      ],
      settings: baseSettings({
        finishedWidth: 12,
        flipAlternate: false,
        rowOffset: 0.5,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist Two-Wood',
    description: 'Beginner default — wide maple with walnut accents.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0°; beginner default.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('hard-maple', 3),
        s('walnut', 0.75),
        s('hard-maple', 4.5),
        s('walnut', 0.75),
        s('hard-maple', 3),
      ],
      settings: baseSettings({ finishedWidth: 12, wastePercent: 10 }),
      sliceOverrides: [],
    },
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
