import type { Board, BuyLine, CutSummary } from './types';
import {
  collectWarnings,
  computeSliceCount,
  stopBlock,
  stripTotalWidth,
} from './geometry';
import { getWood } from './woods';

function quartersLabel(panelThickness: number): string {
  // map net panel thickness to common rough quarters
  if (panelThickness <= 0.8) return '4/4';
  if (panelThickness <= 1.05) return '5/4';
  if (panelThickness <= 1.35) return '6/4';
  return '8/4';
}

function roughThickness(quarters: string): number {
  switch (quarters) {
    case '4/4':
      return 1;
    case '5/4':
      return 1.25;
    case '6/4':
      return 1.5;
    default:
      return 2;
  }
}

function ceilToStockLength(inches: number): number {
  const feet = Math.ceil(inches / 12);
  return Math.max(2, feet) * 12;
}

export function computeCutSummary(board: Board): CutSummary {
  const { settings, strips, grainMode } = board;
  const { count, leftover, glueUp1Length } = computeSliceCount(board);
  const glueUp1Width = stripTotalWidth(board);
  const sb = stopBlock(board);
  const stripLength =
    grainMode === 'long'
      ? settings.finishedLength + settings.extraLength
      : glueUp1Length;

  const millExtra = settings.stockMode === 'rough' ? 0.25 : 0;
  const waste =
    settings.wastePercent > 0
      ? settings.wastePercent / 100
      : settings.stockMode === 'rough'
        ? 0.2
        : 0.1;

  const byWood: Record<string, { widthSum: number; strips: number }> = {};
  for (const s of strips) {
    const entry = byWood[s.woodId] ?? { widthSum: 0, strips: 0 };
    entry.widthSum += s.width;
    entry.strips += 1;
    byWood[s.woodId] = entry;
  }

  const boardFeetByWood: Record<string, number> = {};
  const buyList: BuyLine[] = [];
  const quarters = quartersLabel(settings.panelThickness);
  const netT = settings.panelThickness;
  const roughT = settings.stockMode === 'rough' ? roughThickness(quarters) : netT;

  for (const [woodId, info] of Object.entries(byWood)) {
    const wood = getWood(woodId);
    const ripWidth = info.widthSum + info.strips * millExtra;
    const length = stripLength + millExtra;
    const bfRaw = (roughT * ripWidth * length) / 144;
    const bf = bfRaw * (1 + waste) * settings.makeCount;
    boardFeetByWood[woodId] = bf;

    const minLength = ceilToStockLength(length);
    const suggestedWidth = Math.max(5, Math.min(8, Math.ceil(ripWidth + 0.5)));
    const perBoardBf = (roughT * suggestedWidth * minLength) / 144;
    const qty = Math.max(1, Math.ceil(bf / Math.max(perBoardBf, 0.01)));
    const price = settings.pricePerBf[woodId];
    const label = `${wood?.name ?? woodId} ${quarters} × ${suggestedWidth}″ × ${minLength / 12}′ × ${qty}`;

    buyList.push({
      woodId,
      quarters,
      netThickness: netT,
      minLength,
      suggestedWidth,
      qty,
      boardFeet: Math.round(bf * 100) / 100,
      cost: price != null ? Math.round(bf * price * 100) / 100 : undefined,
      label,
    });
  }

  // Clamp every 6–8″ along glue-up length, spanning width
  const span = grainMode === 'long' ? settings.finishedLength : glueUp1Length;
  const clampCount = Math.max(3, Math.ceil(span / 7) * 2);

  let weightLb = 0;
  for (const s of strips) {
    const w = getWood(s.woodId);
    if (!w) continue;
    const vol =
      (settings.finishedLength * s.width * settings.finishedThickness) / 1728;
    weightLb += vol * w.densityLbFt3;
  }
  weightLb *= settings.makeCount;

  return {
    stopBlock: sb,
    sliceCount: count,
    leftover,
    glueUp1Length,
    glueUp1Width,
    stripLength,
    boardFeetByWood,
    buyList,
    clampCount,
    weightLb: Math.round(weightLb * 10) / 10,
    warnings: collectWarnings(board),
  };
}

export function formatInches(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const whole = Math.floor(abs + 1e-9);
  const frac = abs - whole;
  const sixteenths = Math.round(frac * 16);
  if (sixteenths === 0) return `${sign}${whole}"`;
  if (sixteenths === 16) return `${sign}${whole + 1}"`;
  const g = gcd(sixteenths, 16);
  const num = sixteenths / g;
  const den = 16 / g;
  return whole === 0 ? `${sign}${num}/${den}"` : `${sign}${whole} ${num}/${den}"`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
