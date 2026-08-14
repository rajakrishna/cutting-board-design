import type { Board, BuyLine } from './types';
import { computeCutSummary } from './cutList';

export function buildBuyList(board: Board): BuyLine[] {
  return computeCutSummary(board).buyList;
}

export function buyListOneLiners(board: Board): string[] {
  return buildBuyList(board).map((b) => b.label);
}
