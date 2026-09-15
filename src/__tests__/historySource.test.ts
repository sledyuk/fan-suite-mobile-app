import { generateHistory } from '@/services/mock/historyGenerator';
import { pageOf } from '@/services/mock/historySource';

const seqs = (p: { messages: { seq: number }[] }) => p.messages.map((m) => m.seq);

describe('pageOf', () => {
  const all = generateHistory(10);

  it('returns the newest page for null and reports more', () => {
    const p = pageOf(all, null, 4);
    expect(seqs(p)).toEqual([7, 8, 9, 10]);
    expect(p.hasMore).toBe(true);
  });

  it('pages backwards without overlap', () => {
    expect(seqs(pageOf(all, 7, 4))).toEqual([3, 4, 5, 6]);
    const last = pageOf(all, 3, 4);
    expect(seqs(last)).toEqual([1, 2]);
    expect(last.hasMore).toBe(false);
  });

  it('handles an empty source', () => {
    expect(pageOf([], null, 4)).toEqual({ messages: [], hasMore: false });
  });
});
