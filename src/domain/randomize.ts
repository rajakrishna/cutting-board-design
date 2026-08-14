import type { Board, Preset, StockItem, Strip } from './types';

const FOOD_SAFE_CONTRAST: string[][] = [
  ['hard-maple', 'walnut'],
  ['hard-maple', 'cherry'],
  ['walnut', 'cherry'],
  ['hard-maple', 'walnut', 'cherry'],
  ['hard-maple', 'padauk'],
  ['beech', 'walnut'],
];

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function jitterWidth(w: number): number {
  const delta = (Math.random() - 0.5) * 0.25;
  return Math.max(0.5, Math.round((w + delta) * 8) / 8);
}

export function randomizeBoard(
  current: Board,
  presets: Preset[],
  inventory?: StockItem[],
  woodsOnly = false,
): Board {
  const allowedSpecies = inventory && inventory.length > 0
    ? [...new Set(inventory.map((i) => i.woodId))]
    : null;

  let pairs = FOOD_SAFE_CONTRAST;
  if (allowedSpecies) {
    pairs = pairs
      .map((p) => p.filter((id) => allowedSpecies.includes(id)))
      .filter((p) => p.length >= 2);
    if (pairs.length === 0) {
      pairs = [allowedSpecies.slice(0, 3)];
    }
  }

  const species = pick(pairs.length ? pairs : [['hard-maple', 'walnut']]);

  if (woodsOnly) {
    const strips = current.strips.map((s, i) => ({
      ...s,
      woodId: species[i % species.length]!,
    }));
    return { ...current, strips };
  }

  const endPresets = presets.filter(
    (p) => p.board.grainMode === current.grainMode || p.board.grainMode === 'end',
  );
  const pool = endPresets.length ? endPresets : presets;
  const preset = pick(pool);

  const strips: Strip[] = preset.board.strips.map((s, i) => ({
    ...s,
    id: uid(),
    woodId: species[i % species.length]!,
    width: jitterWidth(s.width),
  }));

  // Scale strip widths to finished width
  const total = strips.reduce((a, s) => a + s.width, 0);
  const target = current.settings.finishedWidth;
  if (total > 0) {
    const scale = target / total;
    for (const s of strips) s.width = Math.round(s.width * scale * 16) / 16;
  }

  return {
    ...current,
    name: `Random ${preset.name}`,
    grainMode: current.grainMode === 'long' ? 'long' : preset.board.grainMode,
    strips,
    settings: {
      ...current.settings,
      flipAlternate: preset.board.settings.flipAlternate,
      rotateAlternate: preset.board.settings.rotateAlternate,
      rowOffset: preset.board.settings.rowOffset,
    },
    sliceOverrides: [],
  };
}
