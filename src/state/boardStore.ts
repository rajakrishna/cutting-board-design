import { create } from 'zustand';
import type { Board, GrainMode, StockItem, Strip } from '../domain/types';
import { createDefaultBoard } from '../domain/defaults';
import { PRESETS, getPreset } from '../data/templates';
import { randomizeBoard } from '../domain/randomize';
import {
  boardFromQuery,
  boardToQuery,
  deserializeBoard,
  serializeBoard,
} from '../domain/serialize';
import { buildGeometry } from '../domain/geometry';
import { computeCutSummary } from '../domain/cutList';
import { buildGuide } from '../domain/guide';
import { inventoryCompare, suggestFromInventory } from '../domain/inventory';

export type PreviewMode = '3d' | '2d';
export type FaceMode = 'finished' | 'glue1';
export type AppView = 'design' | 'guide';
export type SheetTab = 'woods' | 'strips' | 'shop';

type SavedBoard = { id: string; name: string; json: string; updatedAt: number };

type BoardStore = {
  board: Board;
  undoBoard: Board | null;
  inventory: StockItem[];
  onlyInventorySpecies: boolean;
  advanced: boolean;
  previewMode: PreviewMode;
  faceMode: FaceMode;
  showDimensions: boolean;
  selectedStripId: string | null;
  appView: AppView;
  sheetTab: SheetTab;
  guideStep: number;
  savedBoards: SavedBoard[];
  buyListOpen: boolean;

  setBoard: (board: Board) => void;
  patchSettings: (partial: Partial<Board['settings']>) => void;
  setGrainMode: (mode: GrainMode) => void;
  setStrips: (strips: Strip[]) => void;
  updateStrip: (id: string, partial: Partial<Strip>) => void;
  addStrip: () => void;
  removeStrip: (id: string) => void;
  selectStrip: (id: string | null) => void;
  loadPreset: (presetId: string) => void;
  randomize: (woodsOnly?: boolean) => void;
  undo: () => void;
  setPreviewMode: (m: PreviewMode) => void;
  setFaceMode: (m: FaceMode) => void;
  setShowDimensions: (v: boolean) => void;
  setAppView: (v: AppView) => void;
  setSheetTab: (t: SheetTab) => void;
  setGuideStep: (n: number) => void;
  setAdvanced: (v: boolean) => void;
  setBuyListOpen: (v: boolean) => void;
  setInventory: (items: StockItem[]) => void;
  setOnlyInventorySpecies: (v: boolean) => void;
  duplicateBoard: () => void;
  saveCurrent: () => void;
  loadSaved: (id: string) => void;
  newBoard: () => void;
  applySize: (length: number, width: number, thickness: number) => void;
  exportJson: () => string;
  importJson: (raw: string) => boolean;
  shareUrl: () => string;
  hydrateFromUrl: () => void;
};

const STORAGE_KEY = 'cbd-board-v1';
const SAVED_KEY = 'cbd-saved-v1';
const ADV_KEY = 'cbd-advanced';

function loadInitial(): Board {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('b');
    if (q) {
      const fromQ = boardFromQuery(q);
      if (fromQ) return fromQ;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const b = deserializeBoard(raw);
      if (b) return b;
    }
  }
  return createDefaultBoard();
}

function persist(board: Board) {
  try {
    localStorage.setItem(STORAGE_KEY, serializeBoard(board));
  } catch {
    /* ignore */
  }
}

function loadSavedList(): SavedBoard[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBoard[];
  } catch {
    return [];
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: createDefaultBoard(),
  undoBoard: null,
  inventory: [],
  onlyInventorySpecies: false,
  advanced: typeof window !== 'undefined' ? localStorage.getItem(ADV_KEY) === '1' : false,
  previewMode: '3d',
  faceMode: 'finished',
  showDimensions: true,
  selectedStripId: null,
  appView: 'design',
  sheetTab: 'woods',
  guideStep: 0,
  savedBoards: typeof window !== 'undefined' ? loadSavedList() : [],
  buyListOpen: false,

  setBoard: (board) => {
    persist(board);
    set({ board });
  },

  patchSettings: (partial) => {
    const board = {
      ...get().board,
      settings: {
        ...get().board.settings,
        ...partial,
        extras: {
          ...get().board.settings.extras,
          ...(partial.extras ?? {}),
        },
      },
    };
    persist(board);
    set({ board });
  },

  setGrainMode: (mode) => {
    const board = { ...get().board, grainMode: mode };
    persist(board);
    set({ board });
  },

  setStrips: (strips) => {
    const board = { ...get().board, strips };
    persist(board);
    set({ board });
  },

  updateStrip: (id, partial) => {
    const strips = get().board.strips.map((s) =>
      s.id === id ? { ...s, ...partial } : s,
    );
    get().setStrips(strips);
  },

  addStrip: () => {
    const last = get().board.strips.at(-1);
    const strips = [
      ...get().board.strips,
      {
        id: uid(),
        woodId: last?.woodId ?? 'hard-maple',
        width: last?.width ?? 1.5,
        trailingAngle: 0,
      },
    ];
    get().setStrips(strips);
  },

  removeStrip: (id) => {
    const prev = get().board;
    set({ undoBoard: prev });
    get().setStrips(prev.strips.filter((s: Strip) => s.id !== id));
  },

  selectStrip: (id) => set({ selectedStripId: id }),

  loadPreset: (presetId) => {
    const preset = getPreset(presetId);
    if (!preset) return;
    const prev = get().board;
    const strips = preset.board.strips.map((s) => ({ ...s, id: uid() }));
    const board: Board = {
      id: uid(),
      name: preset.name,
      grainMode: prev.grainMode === 'long' ? 'long' : preset.board.grainMode,
      strips,
      settings: {
        ...preset.board.settings,
        finishedLength: prev.settings.finishedLength,
        finishedThickness: prev.settings.finishedThickness,
        kerf: prev.settings.kerf,
        flattenAllowance: prev.settings.flattenAllowance,
        stockMode: prev.settings.stockMode,
      },
      sliceOverrides: [],
    };
    persist(board);
    set({ board, undoBoard: prev, selectedStripId: null });
  },

  randomize: (woodsOnly = false) => {
    const prev = get().board;
    const board = randomizeBoard(
      prev,
      PRESETS,
      get().inventory,
      woodsOnly,
    );
    persist(board);
    set({ board, undoBoard: prev });
  },

  undo: () => {
    const u = get().undoBoard;
    if (!u) return;
    persist(u);
    set({ board: u, undoBoard: null });
  },

  setPreviewMode: (m) => set({ previewMode: m }),
  setFaceMode: (m) => set({ faceMode: m }),
  setShowDimensions: (v) => set({ showDimensions: v }),
  setAppView: (v) => set({ appView: v, guideStep: 0 }),
  setSheetTab: (t) => set({ sheetTab: t }),
  setGuideStep: (n) => set({ guideStep: n }),

  setAdvanced: (v) => {
    localStorage.setItem(ADV_KEY, v ? '1' : '0');
    set({ advanced: v });
  },

  setBuyListOpen: (v) => set({ buyListOpen: v }),

  setInventory: (items) => set({ inventory: items }),
  setOnlyInventorySpecies: (v) => set({ onlyInventorySpecies: v }),

  duplicateBoard: () => {
    const board = {
      ...get().board,
      id: uid(),
      name: `${get().board.name} copy`,
    };
    persist(board);
    set({ board });
    get().saveCurrent();
  },

  saveCurrent: () => {
    const board = get().board;
    const list = [
      {
        id: board.id,
        name: board.name,
        json: serializeBoard(board),
        updatedAt: Date.now(),
      },
      ...get().savedBoards.filter((b) => b.id !== board.id),
    ].slice(0, 20);
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    set({ savedBoards: list });
  },

  loadSaved: (id) => {
    const item = get().savedBoards.find((b) => b.id === id);
    if (!item) return;
    const board = deserializeBoard(item.json);
    if (!board) return;
    persist(board);
    set({ board });
  },

  newBoard: () => {
    const board = createDefaultBoard();
    persist(board);
    set({ board, undoBoard: null, selectedStripId: null });
  },

  applySize: (length, width, thickness) => {
    const board = get().board;
    const total = board.strips.reduce((a, s) => a + s.width, 0);
    const scale = total > 0 ? width / total : 1;
    const strips = board.strips.map((s) => ({
      ...s,
      width: Math.round(s.width * scale * 16) / 16,
    }));
    const next = {
      ...board,
      strips,
      settings: {
        ...board.settings,
        finishedLength: length,
        finishedWidth: width,
        finishedThickness: thickness,
      },
    };
    persist(next);
    set({ board: next });
  },

  exportJson: () => serializeBoard(get().board),

  importJson: (raw) => {
    const board = deserializeBoard(raw);
    if (!board) return false;
    persist(board);
    set({ board });
    return true;
  },

  shareUrl: () => {
    const q = boardToQuery(get().board);
    const url = new URL(window.location.href);
    url.searchParams.set('b', q);
    return url.toString();
  },

  hydrateFromUrl: () => {
    const board = loadInitial();
    set({ board });
  },
}));

export function useDerived() {
  const board = useBoardStore((s) => s.board);
  const inventory = useBoardStore((s) => s.inventory);
  const only = useBoardStore((s) => s.onlyInventorySpecies);
  const geometry = buildGeometry(board);
  const summary = computeCutSummary(board);
  const guide = buildGuide(board);
  const suggestions = suggestFromInventory(inventory, PRESETS, only);
  const invCompare = inventoryCompare(board, inventory);
  return { geometry, summary, guide, suggestions, invCompare };
}
