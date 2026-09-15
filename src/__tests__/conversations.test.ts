import { CONVERSATIONS, findConversation } from '@/services/mock/conversations';
import { listTime } from '@/lib/time';

describe('conversations fixture', () => {
  it('has unique ids and seeds, newest first', () => {
    const ids = new Set(CONVERSATIONS.map((c) => c.id)); expect(ids.size).toBe(CONVERSATIONS.length);
    const seeds = new Set(CONVERSATIONS.map((c) => c.seed)); expect(seeds.size).toBe(CONVERSATIONS.length);
    for (let i = 1; i < CONVERSATIONS.length; i++) expect(CONVERSATIONS[i - 1].last.at).toBeGreaterThan(CONVERSATIONS[i].last.at);
    expect(CONVERSATIONS.reduce((n, c) => n + c.unreadCount, 0)).toBe(3);
    for (const c of CONVERSATIONS) expect(c.last.from === 'creator' ? c.last.status !== undefined : c.last.status === undefined).toBe(true);
    expect(findConversation('rick')?.fan.name).toBe('Rick Sanchez');
    expect(findConversation('nope')).toBeUndefined();
  });
  it('formats list stamps: time today, Yesterday, then short date', () => {
    const now = new Date(2026, 8, 15, 12, 0, 0).getTime();
    expect(listTime(now - 30 * 60_000, now)).toMatch(/11:30/);
    expect(listTime(now - 86_400_000, now)).toBe('Yesterday');
    expect(listTime(now - 3 * 86_400_000, now)).toMatch(/12 Sep|Sep 12/);
  });
});
