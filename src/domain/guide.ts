import type { Board, GuideStep, GuideTool } from './types';
import { computeCutSummary, formatInches } from './cutList';
import { stopBlock } from './geometry';

const TOOLS = {
  mill: {
    need: 'Jointer + planer',
    or: 'TS jointing sled + planer, or buy S4S and skip',
  },
  rip: {
    need: 'Table saw, glue-line rip blade, push stick',
    or: 'Track saw / circ saw + guide if square',
  },
  glue: {
    need: 'Parallel or bar clamps, cauls, Titebond III, wax paper',
    or: 'Pipe clamps + waxed 2× cauls',
    never: 'Rush 24h cure; starve end-grain glue; over-clamp dry joints',
  },
  glue2: {
    need: 'Same clamps + sizing coat (thin glue, 5–10 min, then second coat)',
    never: 'One skimpy coat on thirsty end grain',
  },
  flatten1: {
    need: 'Planer (if panel ≤ planer width)',
    or: 'Router flattening sled',
    never: 'Knives into dried glue — scrape first',
  },
  crosscut: {
    need: 'Table saw + crosscut sled + stop block',
    or: 'Miter saw only if actually square',
    never: 'Freehand',
  },
  flattenEnd: {
    need: 'Router sled or drum sander',
    or: 'Belt sander / sandpaper on granite or saw top',
    never: 'Thickness planer',
  },
  flattenLong: {
    need: 'Planer',
    or: 'Router sled',
  },
  shape: {
    need: 'Sled to square; router if chamfer/groove/handles on',
    or: 'Block plane + sandpaper; tape exit edge vs chip-out',
  },
  sand: {
    need: 'Random-orbit 80→220, water pop, vacuum between grits',
    or: 'Sanding block',
    never: 'Skip grits; skip water pop',
  },
  finish: {
    need: 'Mineral oil (several coats), board butter, optional feet',
    or: 'Pharmacy mineral oil + cloth',
    never: 'Dishwasher; cooking oil; oily rags in a pile',
  },
  ppe: {
    need: 'Eyes, hearing, dust mask on sand',
  },
} as const satisfies Record<string, GuideTool>;

function kitUnion(steps: GuideStep[]): GuideTool[] {
  const seen = new Set<string>();
  const out: GuideTool[] = [];
  for (const s of steps) {
    for (const t of s.tools) {
      if (seen.has(t.need)) continue;
      seen.add(t.need);
      out.push(t);
    }
  }
  return out;
}

export function buildGuide(board: Board): GuideStep[] {
  const summary = computeCutSummary(board);
  const sb = stopBlock(board);
  const end = board.grainMode === 'end';
  const s4s = board.settings.stockMode === 's4s';
  const extras = board.settings.extras;

  const steps: GuideStep[] = [];

  steps.push({
    id: 'overview',
    title: 'What you’re making',
    caption: end
      ? `End-grain board ${formatInches(board.settings.finishedLength)} × ${formatInches(board.settings.finishedWidth)} × ${formatInches(board.settings.finishedThickness)}. Two overnight glue cures — not a Saturday project. Buy list and kit below.`
      : `Long-grain (edge-grain) board ${formatInches(board.settings.finishedLength)} × ${formatInches(board.settings.finishedWidth)} × ${formatInches(board.settings.finishedThickness)}. One glue-up. Planer is OK on the finished face.`,
    kind: 'overview',
    tools: [TOOLS.ppe],
    measurements: {
      stopBlock: formatInches(sb),
      clamps: summary.clampCount,
      slices: summary.sliceCount,
    },
  });

  if (!s4s) {
    steps.push({
      id: 'mill',
      title: 'Mill stock flat and square',
      caption: 'Flatten one face and one edge. Kiln-dried ~6–8% MC; acclimate a few days. Skip pith and loose knots on glue faces.',
      kind: 'mill',
      tools: [TOOLS.mill],
    });
  }

  steps.push({
    id: 'rip',
    title: 'Rip strips',
    caption: `Rip to strip widths for the pattern. Glue-up 1 length ≈ ${formatInches(summary.stripLength)}. Sequential rips from the same board keep grain continuous.`,
    kind: 'rip',
    tools: [TOOLS.rip],
    measurements: {
      stripLength: formatInches(summary.stripLength),
      kerf: formatInches(board.settings.kerf),
    },
  });

  steps.push({
    id: 'dryfit1',
    title: 'Dry-fit glue-up 1',
    caption: 'Number strips, mark grain arrows, dry-fit the pattern. Alternate heart up/down if fighting cup (advanced).',
    kind: 'dryfit',
    tools: [TOOLS.glue],
  });

  steps.push({
    id: 'glue1',
    title: 'Glue-up 1',
    caption: `Cauls, alternate clamps top/bottom (~${summary.clampCount} clamps), wax paper under jaws. 24h cure.`,
    kind: 'glue',
    tools: [TOOLS.glue],
    measurements: { clamps: summary.clampCount },
  });

  steps.push({
    id: 'flatten1',
    title: 'Flatten the panel',
    caption: end
      ? 'Plane the edge-grain panel flat. Scrape dried glue first. If wider than your planer, use a router sled.'
      : 'Plane the panel — this is your finished face for long grain.',
    kind: 'flatten',
    tools: [TOOLS.flatten1],
  });

  if (end) {
    steps.push({
      id: 'crosscut',
      title: 'Crosscut numbered slices',
      caption: `Set stop block to ${formatInches(sb)} (finished thickness + flatten). ${summary.sliceCount} slices. Number each piece.`,
      kind: 'crosscut',
      tools: [TOOLS.crosscut],
      measurements: {
        stopBlock: formatInches(sb),
        slices: summary.sliceCount,
        kerf: formatInches(board.settings.kerf),
      },
    });

    steps.push({
      id: 'stand',
      title: board.settings.rowOffset > 0 ? 'Stand, flip, brick offset' : 'Stand / flip / rotate',
      caption:
        board.settings.rowOffset > 0
          ? 'Stand slices on end. Alternate flip. Brick: offset every other row by half a block — split one slice and count the kerf.'
          : 'Stand slices on end so end grain faces up. Flip / rotate every other if your pattern needs it. Dry-fit before glue.',
      kind: 'arrange',
      tools: [],
    });

    steps.push({
      id: 'glue2',
      title: 'Glue-up 2 (end grain)',
      caption: 'End grain drinks glue — size coat, wait 5–10 min, second coat, then clamp. 24h cure. Keep tops flush.',
      kind: 'glue',
      tools: [TOOLS.glue2, TOOLS.glue],
    });

    steps.push({
      id: 'flatten2',
      title: 'Flatten finished end grain',
      caption: 'Do NOT run end grain through a thickness planer. Router sled, drum sander, or sandpaper on a flat top.',
      kind: 'flatten',
      tools: [TOOLS.flattenEnd],
    });
  } else {
    steps.push({
      id: 'flatten-long',
      title: 'Final flatten',
      caption: 'Planer is OK on long grain. Take light passes to finished thickness.',
      kind: 'flatten',
      tools: [TOOLS.flattenLong],
    });
  }

  const shapeTools: GuideTool[] = [TOOLS.shape];
  if (extras.juiceGroove) {
    shapeTools.push({
      need: 'Router + juice-groove bit + jig',
      never: 'Deep groove on end grain without a moisture plan',
    });
  }

  steps.push({
    id: 'shape',
    title: 'Square and shape',
    caption: 'Trim square (tape exit edge vs chip-out). Add chamfer, handles, or juice groove only if extras are on.',
    kind: 'shape',
    tools: shapeTools,
  });

  steps.push({
    id: 'sand',
    title: 'Sand',
    caption: '80 → 120 → 180 → 220. Water pop after 220: dampen, dry, light sand again.',
    kind: 'sand',
    tools: [TOOLS.sand],
  });

  steps.push({
    id: 'finish',
    title: 'Oil, wax, feet',
    caption: end
      ? 'Flood with mineral oil over several days — end grain is thirsty. Board butter. Feet = airflow + one-sided; skip feet for reversible.'
      : 'Mineral oil + board butter. Hand wash, dry on edge, no dishwasher.',
    kind: 'finish',
    tools: [TOOLS.finish, TOOLS.ppe],
  });

  // Inject kit list into overview
  const kit = kitUnion(steps);
  steps[0] = {
    ...steps[0]!,
    tools: kit,
    caption:
      steps[0]!.caption +
      ` Kit: ${kit.map((t) => t.need).join('; ')}.`,
  };

  return steps;
}

export const CARE_CARD = [
  'Hand wash with warm soapy water — never the dishwasher.',
  'Dry on edge so both faces get air.',
  'Re-oil when the board looks dry or thirsty.',
  'Feet help airflow but make the board one-sided.',
  'Spread oily rags flat to dry before disposal.',
];
