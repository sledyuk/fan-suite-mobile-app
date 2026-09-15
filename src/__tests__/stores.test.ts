import { MemoryKV } from '@/storage/MemoryKV';
import { OutboxStore } from '@/stores/OutboxStore';
import { ThreadState } from '@/stores/ChatStore';

describe('OutboxStore', () => {
  it('persists synchronously on enqueue and keeps local order across a restart', () => {
    const kv = new MemoryKV(); const a = new OutboxStore(kv);
    a.enqueue('rick', 'one'); a.enqueue('rick', 'two'); a.enqueue('rick', 'three');
    expect(kv.get('outbox.v1')).toContain('"three"');
    const b = new OutboxStore(kv);
    expect(b.items.map((i) => i.text)).toEqual(['one', 'two', 'three']);
    expect(b.items.every((i) => i.status === 'pending')).toBe(true);
  });

  it('a crash mid-send reopens as pending', () => {
    const kv = new MemoryKV(); const a = new OutboxStore(kv);
    const it = a.enqueue('rick', 'x'); a.markSending(it.clientId);
    expect(new OutboxStore(kv).items[0].status).toBe('pending');
  });
});

describe('ThreadState', () => {
  const m = (seq: number) => ({ id: `m${seq}`, seq, authorId: 'fan' as const, text: 't', createdAt: seq, kind: 'text' as const });
  it('dedupes by id, sorts by seq, and repeats leave orderedIds untouched', () => {
    const t = new ThreadState();
    t.upsert([m(3), m(1)]); t.upsert([m(2)]);
    const before = t.orderedIds;
    t.upsert([m(2), m(3)]);
    expect(t.orderedIds.slice()).toEqual(['m1', 'm2', 'm3']);
    expect(t.orderedIds).toBe(before);
    expect(t.lastSeq).toBe(3);
  });
});
