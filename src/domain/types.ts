export type GrainMode = 'end' | 'long';
export type StockMode = 'rough' | 's4s';
export type Units = 'in' | 'mm';

export type Wood = {
  id: string;
  name: string;
  color: string;
  oiledColor: string;
  textureId: string;
  foodSafe: boolean;
  janka: number;
  densityLbFt3: number;
  notes?: string;
  openPore?: boolean;
  softwood?: boolean;
  oily?: boolean;
  group: 'domestic' | 'exotic' | 'accent' | 'custom';
};

export type Strip = {
  id: string;
  woodId: string;
  width: number;
  trailingAngle: number;
};

export type StockItem = {
  id: string;
  woodId: string;
  thickness: number;
  width: number;
  length: number;
  count: number;
};

export type BoardExtras = {
  juiceGroove: boolean;
  feet: boolean;
  chamfer: boolean;
  handles: boolean;
};

export type BoardSettings = {
  finishedLength: number;
  finishedWidth: number;
  finishedThickness: number;
  panelThickness: number;
  kerf: number;
  flattenAllowance: number;
  extraLength: number;
  units: Units;
  flipAlternate: boolean;
  rotateAlternate: boolean;
  wastePercent: number;
  stockMode: StockMode;
  makeCount: number;
  planerWidth: number;
  rowOffset: number;
  pricePerBf: Record<string, number>;
  extras: BoardExtras;
};

export type SliceOverride = {
  index: number;
  flipped: boolean;
  rotated: boolean;
};

export type Board = {
  id: string;
  name: string;
  grainMode: GrainMode;
  strips: Strip[];
  settings: BoardSettings;
  sliceOverrides: SliceOverride[];
};

export type BuyLine = {
  woodId: string;
  quarters: string;
  netThickness: number;
  minLength: number;
  suggestedWidth: number;
  qty: number;
  boardFeet: number;
  cost?: number;
  label: string;
};

export type Warning = {
  id: string;
  level: 'warn' | 'info';
  message: string;
};

export type CutSummary = {
  stopBlock: number;
  sliceCount: number;
  leftover: number;
  glueUp1Length: number;
  glueUp1Width: number;
  stripLength: number;
  boardFeetByWood: Record<string, number>;
  buyList: BuyLine[];
  clampCount: number;
  weightLb: number;
  warnings: Warning[];
};

export type RectPoly = {
  stripId: string;
  woodId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
};

export type BoardGeometry = {
  glueUp1: RectPoly[];
  finished: RectPoly[];
  overall: { length: number; width: number; thickness: number };
};

export type GuideTool = {
  need: string;
  or?: string;
  never?: string;
};

export type GuideStep = {
  id: string;
  title: string;
  caption: string;
  kind: string;
  tools: GuideTool[];
  measurements?: Record<string, number | string>;
};

export type CutCard = {
  ripAngle: number;
  miterAngle: number;
  stopBlock?: number;
  notes: string;
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  board: Omit<Board, 'id' | 'name'>;
  cutCard: CutCard;
};
