import type { Board, Preset, StockItem } from './types';
import { computeCutSummary } from './cutList';
import { getWood } from './woods';

export type Suggestion = {
  presetId: string;
  name: string;
  status: 'fits' | 'short' | 'too-small' | 'long-grain';
  message: string;
  shortBy?: Record<string, number>;
};

function inventoryBf(items: StockItem[], woodId: string): number {
  return items
    .filter((i) => i.woodId === woodId)
    .reduce((sum, i) => sum + (i.thickness * i.width * i.length * i.count) / 144, 0);
}

export function suggestFromInventory(
  inventory: StockItem[],
  presets: Preset[],
  onlyTheseSpecies: boolean,
): Suggestion[] {
  if (inventory.length === 0) return [];

  const available = new Set(inventory.map((i) => i.woodId));
  const out: Suggestion[] = [];

  for (const preset of presets) {
    const board: Board = {
      id: 'tmp',
      name: preset.name,
      ...preset.board,
    };
    const woods = new Set(board.strips.map((s) => s.woodId));
    if (onlyTheseSpecies && [...woods].some((w) => !available.has(w))) continue;

    const summary = computeCutSummary(board);
    const shortBy: Record<string, number> = {};
    let allFit = true;
    for (const [woodId, need] of Object.entries(summary.boardFeetByWood)) {
      const have = inventoryBf(inventory, woodId);
      if (have + 1e-6 < need) {
        allFit = false;
        shortBy[woodId] = Math.round((need - have) * 100) / 100;
      }
    }

    const maxLen = Math.max(...inventory.map((i) => i.length), 0);
    if (board.grainMode === 'end' && maxLen > 0 && maxLen < summary.stripLength) {
      out.push({
        presetId: preset.id,
        name: preset.name,
        status: 'long-grain',
        message: `Stock too short for end-grain glue-up 1 (${summary.stripLength.toFixed(0)}″ needed). Try long grain.`,
      });
      continue;
    }

    if (allFit) {
      out.push({
        presetId: preset.id,
        name: preset.name,
        status: 'fits',
        message: 'Fits your scrap inventory.',
      });
    } else {
      const parts = Object.entries(shortBy).map(([id, bf]) => {
        const w = getWood(id);
        return `${bf} bf more ${w?.name ?? id}`;
      });
      const totalShort = Object.values(shortBy).reduce((a, b) => a + b, 0);
      out.push({
        presetId: preset.id,
        name: preset.name,
        status: totalShort > 5 ? 'too-small' : 'short',
        message:
          totalShort > 5
            ? `Too small — try a serving board size. Short: ${parts.join(', ')}`
            : `Fits if you buy ${parts.join(', ')}`,
        shortBy,
      });
    }
  }

  const rank = { fits: 0, 'long-grain': 1, short: 2, 'too-small': 3 };
  return out.sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 4);
}

export function inventoryCompare(
  board: Board,
  inventory: StockItem[],
): { woodId: string; need: number; have: number; enough: boolean }[] {
  if (inventory.length === 0) return [];
  const summary = computeCutSummary(board);
  return Object.entries(summary.boardFeetByWood).map(([woodId, need]) => {
    const have = inventoryBf(inventory, woodId);
    return { woodId, need, have, enough: have + 1e-6 >= need };
  });
}
