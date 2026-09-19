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

function repeat(seq: Array<[string, number, number?]>, times: number): Strip[] {
  const out: Strip[] = [];
  for (let i = 0; i < times; i++) {
    for (const [woodId, width, angle] of seq) {
      out.push(s(woodId, width, angle));
    }
  }
  return out;
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
    id: 'cube-illusion',
    name: 'Cube Illusion',
    description: 'Three-tone isometric cubes — maple, walnut, cherry. Shift each row one strip.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: 'Equal-width ABC repeat. Crosscut at strip width. Cycle-shift each slice by one.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['hard-maple', 4 / 3],
          ['walnut', 4 / 3],
          ['cherry', 4 / 3],
        ],
        3,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 4 / 3,
        cycleShift: 1,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'stripes',
    name: 'Classic Stripes',
    description: 'Alternating maple and walnut. Square rips.',
    cutCard: { ripAngle: 0, miterAngle: 0, notes: 'Square rips, 0° trailing.' },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['walnut', 1.5],
          ['hard-maple', 1.5],
        ],
        4,
      ),
      settings: baseSettings({ finishedWidth: 12, flipAlternate: false }),
      sliceOverrides: [],
    },
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    description: 'Two-wood flip every other slice.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0° rips; flip every other slice.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['walnut', 1.5],
          ['hard-maple', 1.5],
        ],
        4,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        flipAlternate: true,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'brick',
    name: 'Brick',
    description: 'Running bond — half-block offset rows.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0° rips; alternate rows offset by half a block.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['hard-maple', 2],
          ['walnut', 2],
        ],
        3,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        flipAlternate: false,
        rowOffset: 0.5,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'chevron',
    name: 'Chevron',
    description: 'Angled strips, flip alternate. Preview is square cells; 15° is on the cut card.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 15,
      notes: 'Trailing 15°. Flip every other slice. Not true herringbone rhombi.',
    },
    board: {
      grainMode: 'end',
      strips: repeat([['walnut', 1.25, 15], ['hard-maple', 1.25, 15]], 4),
      settings: baseSettings({
        finishedWidth: 10,
        flipAlternate: true,
        rotateAlternate: true,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'tumbling-block',
    name: 'Tumbling Block',
    description: 'Chunkier 3-wood shift. Closest to tumbling-block without 60° rhombi.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: 'ABC repeat, 2″ cells, cycle-shift 1. Square approximation of tumbling block.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['cherry', 2],
          ['hard-maple', 2],
          ['walnut', 2],
        ],
        2,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 2,
        cycleShift: 1,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'four-towers',
    name: 'Four Towers',
    description: 'Paired blocks that stack into four masses. Strip-model stand-in for 2×2 towers.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: 'AABB repeat, cycle-shift 2 so towers trade places each row.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['walnut', 1.5],
          ['walnut', 1.5],
          ['hard-maple', 1.5],
          ['hard-maple', 1.5],
        ],
        2,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 1.5,
        cycleShift: 2,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'three-wood',
    name: 'Three-Wood Bands',
    description: 'Maple, walnut, and cherry bands. No row shift.',
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
    id: 'accent-stripe',
    name: 'Accent Stripe',
    description: 'Butcher-block maple field with walnut + padauk pinstripes.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0°. No flip — bands stay continuous after the stand-up.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('hard-maple', 2.5),
        s('walnut', 0.375),
        s('padauk', 0.75),
        s('walnut', 0.375),
        s('hard-maple', 3.25),
        s('walnut', 0.375),
        s('padauk', 0.75),
        s('walnut', 0.375),
        s('hard-maple', 2.25),
      ],
      settings: baseSettings({ finishedWidth: 11, flipAlternate: false }),
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
