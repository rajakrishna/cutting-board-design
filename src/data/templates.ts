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
    description:
      'Maple (lit), cherry (mid), walnut (dark). Cycle-shift each row — same species meet only at corners.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes:
        'Equal-width ABC. Crosscut at strip width. Cycle-shift each slice by one. Square cells — 60° hex rhombi are not in the strip model.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['hard-maple', 1.25],
          ['cherry', 1.25],
          ['walnut', 1.25],
        ],
        3,
      ),
      settings: baseSettings({
        finishedWidth: 11.25,
        panelThickness: 1.25,
        cycleShift: 1,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'newton-3d',
    name: 'Newton 3D Block',
    description: 'Four-wood highlight/shadow — maple, cherry, sapele, walnut.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: 'ABCD repeat. Crosscut at strip width. Cycle-shift each slice by one.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['hard-maple', 1.5],
          ['cherry', 1.5],
          ['sapele', 1.5],
          ['walnut', 1.5],
        ],
        2,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 1.5,
        cycleShift: 1,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'tumbling-block',
    name: 'Tumbling Diamond',
    description: 'Two-tone maple + walnut. 30° lean, flip and rotate alternate rows.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 30,
      notes:
        '30° trailing. Flip + rotate every other slice. Preview shears cells; not a hex tumbling-block tiling.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['hard-maple', 1.5, 30],
          ['walnut', 1.5, 30],
        ],
        4,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 1.5,
        flipAlternate: true,
        rotateAlternate: true,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'four-towers',
    name: 'Four Towers',
    description: 'Stepped 3D — wide walnut towers, maple risers, each row shifted one strip.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: 'Wide/narrow AB repeat. Cycle-shift 1 so the towers step. Not full 3D tower geometry.',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['walnut', 2],
          ['hard-maple', 1],
        ],
        4,
      ),
      settings: baseSettings({
        finishedWidth: 12,
        panelThickness: 1.5,
        cycleShift: 1,
        flipAlternate: false,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'checkerboard',
    name: 'Classic Checker',
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
    description: 'Angled strips, rotate alternate so the lean flips.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 20,
      notes: 'Trailing 20°. Rotate every other slice (preview shears; not true herringbone rhombi).',
    },
    board: {
      grainMode: 'end',
      strips: repeat(
        [
          ['walnut', 1.25, 20],
          ['hard-maple', 1.25, 20],
        ],
        4,
      ),
      settings: baseSettings({
        finishedWidth: 10,
        panelThickness: 1.25,
        flipAlternate: false,
        rotateAlternate: true,
      }),
      sliceOverrides: [],
    },
  },
  {
    id: 'butcher-bands',
    name: 'Butcher Bands',
    description: 'Maple field with bold walnut accent bands.',
    cutCard: {
      ripAngle: 0,
      miterAngle: 0,
      notes: '0°. No flip — bands stay continuous after the stand-up.',
    },
    board: {
      grainMode: 'end',
      strips: [
        s('hard-maple', 2.25),
        s('walnut', 0.75),
        s('hard-maple', 2.5),
        s('walnut', 0.75),
        s('hard-maple', 2.5),
        s('walnut', 0.75),
        s('hard-maple', 2.5),
      ],
      settings: baseSettings({ finishedWidth: 12, flipAlternate: false }),
      sliceOverrides: [],
    },
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
