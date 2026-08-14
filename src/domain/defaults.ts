import type { Board, BoardSettings, Strip } from './types';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const DEFAULT_SETTINGS: BoardSettings = {
  finishedLength: 16,
  finishedWidth: 12,
  finishedThickness: 1.5,
  panelThickness: 1.75,
  kerf: 0.125,
  flattenAllowance: 0.125,
  extraLength: 2,
  units: 'in',
  flipAlternate: false,
  rotateAlternate: false,
  wastePercent: 20,
  stockMode: 'rough',
  makeCount: 1,
  planerWidth: 13,
  rowOffset: 0,
  pricePerBf: {},
  extras: {
    juiceGroove: false,
    feet: true,
    chamfer: true,
    handles: false,
  },
};

export function defaultStrips(): Strip[] {
  return [
    { id: uid(), woodId: 'walnut', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'hard-maple', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'walnut', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'hard-maple', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'walnut', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'hard-maple', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'walnut', width: 1.5, trailingAngle: 0 },
    { id: uid(), woodId: 'hard-maple', width: 1.5, trailingAngle: 0 },
  ];
}

export function createDefaultBoard(): Board {
  const strips = defaultStrips();
  const width = strips.reduce((a, s) => a + s.width, 0);
  return {
    id: uid(),
    name: 'Maple & Walnut Stripes',
    grainMode: 'end',
    strips,
    settings: { ...DEFAULT_SETTINGS, finishedWidth: width },
    sliceOverrides: [],
  };
}

export const SIZE_CHIPS = [
  { id: 'serving', label: 'Serving', length: 12, width: 9, thickness: 1.25 },
  { id: 'prep', label: 'Prep', length: 16, width: 12, thickness: 1.5 },
  { id: 'chef', label: 'Chef', length: 18, width: 12, thickness: 1.5 },
  { id: 'xl', label: 'XL', length: 24, width: 18, thickness: 1.75 },
] as const;
