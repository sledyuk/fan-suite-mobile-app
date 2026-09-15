import { CONVERSATIONS, findConversation, relativeTime } from '@/services/mock/conversations';

describe('conversations fixture', () => {
  it('has unique ids and seeds, newest first', () => {
    const ids = new Set(CONVERSATIONS.map((c) => c.id)); expect(ids.size).toBe(CONVERSATIONS.length);
    const seeds = new Set(CONVERSATIONS.map((c) => c.seed)); expect(seeds.size).toBe(CONVERSATIONS.length);
    for (let i = 1; i < CONVERSATIONS.length; i++) expect(CONVERSATIONS[i - 1].lastAt).toBeGreaterThan(CONVERSATIONS[i].lastAt);
    expect(findConversation('rick')?.creator.name).toBe('Rick Sanchez');
    expect(findConversation('nope')).toBeUndefined();
  });
  it('formats relative time compactly', () => {
    const now = 1_000_000_000_000;
    expect(relativeTime(now - 30_000, now)).toBe('30s ago');
    expect(relativeTime(now - 12 * 60_000, now)).toBe('12m ago');
    expect(relativeTime(now - 3 * 3_600_000, now)).toBe('3h ago');
    expect(relativeTime(now - 2 * 86_400_000, now)).toBe('2d ago');
  });
});
