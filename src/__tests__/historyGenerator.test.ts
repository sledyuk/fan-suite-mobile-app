import { generateHistory } from '@/services/mock/historyGenerator';

describe('generateHistory', () => {
  it('produces the requested count with strictly increasing seq and non-empty text', () => {
    const h = generateHistory(1000);
    expect(h).toHaveLength(1000);
    for (let i = 0; i < h.length; i++) {
      expect(h[i].seq).toBe(i + 1);
      expect(h[i].text.length).toBeGreaterThan(0);
      if (i > 0) expect(h[i].createdAt).toBeGreaterThan(h[i - 1].createdAt);
    }
  });

  it('is deterministic for the same seed and differs for another seed', () => {
    const a = generateHistory(500, 7);
    const b = generateHistory(500, 7);
    const c = generateHistory(500, 8);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });

  it('generates 50k messages quickly', () => {
    const t0 = Date.now();
    const h = generateHistory(50_000);
    expect(Date.now() - t0).toBeLessThan(500);
    expect(h[49_999].seq).toBe(50_000);
    expect(h.some((m) => m.kind === 'gift')).toBe(true);
  });
});
