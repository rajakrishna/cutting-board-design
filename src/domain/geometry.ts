import type { Board, BoardGeometry, RectPoly, Warning } from './types';
import { getWood } from './woods';

export function stripTotalWidth(board: Board): number {
  return board.strips.reduce((sum, s) => sum + s.width, 0);
}

export function stopBlock(board: Board): number {
  if (board.grainMode === 'long') return board.settings.finishedThickness;
  return board.settings.finishedThickness + board.settings.flattenAllowance;
}

export function computeSliceCount(board: Board): {
  count: number;
  leftover: number;
  glueUp1Length: number;
} {
  const { kerf, extraLength, finishedLength, panelThickness } = board.settings;
  if (board.grainMode === 'long') {
    return {
      count: 0,
      leftover: 0,
      glueUp1Length: finishedLength + extraLength,
    };
  }
  if (panelThickness <= 0) {
    return { count: 0, leftover: 0, glueUp1Length: extraLength };
  }

  // Each end-grain row contributes panelThickness to finished length
  const count = Math.max(1, Math.floor((finishedLength + kerf) / (panelThickness + kerf)));
  const used = count * panelThickness + Math.max(0, count - 1) * kerf;
  const leftover = Math.max(0, finishedLength - used);
  const glueUp1Length =
    count * stopBlock(board) + Math.max(0, count - 1) * kerf + extraLength;

  return { count, leftover, glueUp1Length };
}

export function buildGlueUp1Polygons(board: Board): RectPoly[] {
  const length =
    board.grainMode === 'long'
      ? board.settings.finishedLength + board.settings.extraLength
      : computeSliceCount(board).glueUp1Length;
  let x = 0;
  return board.strips.map((s) => {
    const poly: RectPoly = {
      stripId: s.id,
      woodId: s.woodId,
      x,
      y: 0,
      w: s.width,
      h: length,
      angle: s.trailingAngle,
    };
    x += s.width;
    return poly;
  });
}

export function buildFinishedPolygons(board: Board): RectPoly[] {
  const { finishedLength, finishedWidth, flipAlternate, rotateAlternate, rowOffset } =
    board.settings;
  const { count } = computeSliceCount(board);

  if (board.grainMode === 'long') {
    let x = 0;
    return board.strips.map((s) => {
      const poly: RectPoly = {
        stripId: s.id,
        woodId: s.woodId,
        x,
        y: 0,
        w: s.width,
        h: finishedLength,
        angle: s.trailingAngle,
      };
      x += s.width;
      return poly;
    });
  }

  const polys: RectPoly[] = [];
  const stripWidths = board.strips.map((s) => s.width);
  const rowH = board.settings.panelThickness;
  const blockW = finishedWidth / Math.max(1, board.strips.length);

  for (let row = 0; row < count; row++) {
    const flipped = flipAlternate && row % 2 === 1;
    const rotated = rotateAlternate && row % 2 === 1;
    const override = board.sliceOverrides.find((o) => o.index === row);
    const isFlipped = override?.flipped ?? flipped;
    const isRotated = override?.rotated ?? rotated;
    const offset = row % 2 === 1 ? rowOffset * (stripWidths[0] ?? blockW) : 0;

    const order = isFlipped ? [...board.strips].reverse() : board.strips;
    let x = offset;
    for (const s of order) {
      const w = s.width;
      polys.push({
        stripId: `${s.id}-r${row}`,
        woodId: s.woodId,
        x,
        y: row * rowH,
        w,
        h: rowH,
        angle: isRotated ? s.trailingAngle + 90 : s.trailingAngle,
      });
      x += w;
    }
  }

  const totalH = count * rowH || 1;
  const scaleY = finishedLength / totalH;
  for (const p of polys) {
    p.y *= scaleY;
    p.h *= scaleY;
  }

  return polys;
}

export function buildGeometry(board: Board): BoardGeometry {
  return {
    glueUp1: buildGlueUp1Polygons(board),
    finished: buildFinishedPolygons(board),
    overall: {
      length: board.settings.finishedLength,
      width: stripTotalWidth(board),
      thickness: board.settings.finishedThickness,
    },
  };
}

export function collectWarnings(board: Board): Warning[] {
  const warnings: Warning[] = [];
  const woods = board.strips.map((s) => getWood(s.woodId)).filter(Boolean);
  const jankas = woods.map((w) => w!.janka);
  if (jankas.length >= 2) {
    const max = Math.max(...jankas);
    const min = Math.min(...jankas);
    if (max - min > 800) {
      warnings.push({
        id: 'janka-mismatch',
        level: 'warn',
        message: `Hardness mismatch (~${min}–${max} Janka). Softer wood will dish.`,
      });
    }
  }
  for (const w of woods) {
    if (!w) continue;
    if (w.janka < 900) {
      warnings.push({
        id: `soft-${w.id}`,
        level: 'warn',
        message: `${w.name} is soft (<900 Janka) and may dish.`,
      });
    }
    if (w.openPore) {
      warnings.push({
        id: `pore-${w.id}`,
        level: 'warn',
        message: `${w.name} is open-pore — not ideal for cutting boards.`,
      });
    }
    if (w.oily) {
      warnings.push({
        id: `oily-${w.id}`,
        level: 'info',
        message: `${w.name} is oily — wipe before gluing.`,
      });
    }
    if (w.id === 'soft-maple') {
      warnings.push({
        id: 'soft-maple',
        level: 'info',
        message: 'Soft maple dishes faster — prefer hard maple.',
      });
    }
  }
  if (board.grainMode === 'end' && board.settings.finishedThickness < 1.25) {
    warnings.push({
      id: 'thin-end',
      level: 'warn',
      message: 'End grain under 1¼″ can cup or crack. Thicker is safer.',
    });
  }
  if (board.settings.extras.juiceGroove && board.grainMode === 'end') {
    warnings.push({
      id: 'juice-end',
      level: 'warn',
      message: 'Juice groove on end grain holds moisture. Serving boards only.',
    });
  }
  const glueWidth = stripTotalWidth(board);
  if (glueWidth > board.settings.planerWidth && board.settings.stockMode === 'rough') {
    warnings.push({
      id: 'planer-width',
      level: 'warn',
      message: `Glue-up 1 is ${glueWidth.toFixed(1)}″ wide — wider than planer (${board.settings.planerWidth}″). Use a router sled or rip the panel.`,
    });
  }
  if (board.strips.length > 12) {
    warnings.push({
      id: 'open-time',
      level: 'info',
      message: 'Many strips — Titebond III open time ~10 min. Glue in stages.',
    });
  }
  for (const s of board.strips) {
    if (Math.abs(s.trailingAngle) > 45) {
      warnings.push({
        id: `angle-${s.id}`,
        level: 'warn',
        message: `Strip angle ${s.trailingAngle}° is aggressive — check fence setup.`,
      });
    }
  }
  return warnings;
}
