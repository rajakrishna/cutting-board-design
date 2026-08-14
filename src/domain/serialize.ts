import type { Board } from './types';

const SCHEMA = 1;

export type SerializedBoard = {
  v: number;
  board: Board;
};

export function serializeBoard(board: Board): string {
  const payload: SerializedBoard = { v: SCHEMA, board };
  return JSON.stringify(payload);
}

export function deserializeBoard(raw: string): Board | null {
  try {
    const data = JSON.parse(raw) as SerializedBoard;
    if (!data?.board?.strips || !data.board.settings) return null;
    return data.board;
  } catch {
    return null;
  }
}

export function boardToQuery(board: Board): string {
  const json = serializeBoard(board);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function boardFromQuery(q: string): Board | null {
  try {
    const pad = q.length % 4 === 0 ? '' : '='.repeat(4 - (q.length % 4));
    const b64 = q.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return deserializeBoard(json);
  } catch {
    return null;
  }
}
