import type { ServerMessage } from '../api/types';
import { SCRIPT } from './script';

/** Small seedable PRNG so the 50k history is identical on every run. */
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

const GIFT_AMOUNTS = [5, 10, 20, 50];

/**
 * Deterministic thread: alternating fan/creator lines taken from SCRIPT,
 * ~10% of fan lines replaced by a gift event. Timestamps advance 30s-10min.
 * The generator owns seq/ids so a fresh mock server can reseed identically.
 */
export function generateHistory(count: number, seed = 42, startAt = Date.UTC(2026, 0, 1)): ServerMessage[] {
  const rnd = mulberry32(seed);
  const out: ServerMessage[] = new Array(count);
  let t = startAt;
  let pair = SCRIPT[Math.floor(rnd() * SCRIPT.length)];
  for (let i = 0; i < count; i++) {
    const fanTurn = i % 2 === 0;
    if (fanTurn) pair = SCRIPT[Math.floor(rnd() * SCRIPT.length)];
    t += 30_000 + Math.floor(rnd() * 570_000);
    const isGift = fanTurn && rnd() < 0.1;
    out[i] = {
      id: `h_${i + 1}`,
      seq: i + 1,
      authorId: fanTurn ? 'fan' : 'creator',
      kind: isGift ? 'gift' : 'text',
      text: isGift
        ? `You sent a $${GIFT_AMOUNTS[Math.floor(rnd() * GIFT_AMOUNTS.length)].toFixed(2)} gift!`
        : fanTurn ? pair[0] : pair[1],
      createdAt: t,
    };
  }
  return out;
}
