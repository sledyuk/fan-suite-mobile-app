import type { ServerMessage } from '../api/types';
import { SCRIPT } from './script';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_END_AT = Date.UTC(2026, 8, 15, 11, 0, 0);

export function generateHistory(count: number, seed = 42, endAt = DEFAULT_END_AT): ServerMessage[] {
  const rnd = mulberry32(seed);
  const out: ServerMessage[] = new Array(count);
  let t = 0;
  let pair = SCRIPT[Math.floor(rnd() * SCRIPT.length)];
  for (let i = 0; i < count; i++) {
    const fanTurn = i % 2 === 1;
    if (!fanTurn) pair = SCRIPT[Math.floor(rnd() * SCRIPT.length)];
    t += 30_000 + Math.floor(rnd() * 570_000);
    out[i] = {
      id: `h_${i + 1}`,
      seq: i + 1,
      authorId: fanTurn ? 'fan' : 'creator',
      kind: 'text',
      text: fanTurn ? pair[1] : pair[0],
      createdAt: t,
    };
  }
  const shift = endAt - t;
  for (const m of out) m.createdAt += shift;
  return out;
}
