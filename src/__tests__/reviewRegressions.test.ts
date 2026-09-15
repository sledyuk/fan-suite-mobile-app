/**
 * Regression checks for the message-safety findings from code review. Each test failed against the
 * pre-fix code and passes now; the finding number refers to README "Review findings and fixes".
 */
import { MemoryKV } from '@/storage/MemoryKV';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { MockChatServer } from '@/services/mock/MockChatServer';
import { MockBackendBilling } from '@/services/mock/MockBackendBilling';
import { MockPurchases } from '@/services/mock/MockPurchases';
import { defaultFaults } from '@/services/mock/faults';
import { RootStore } from '@/stores/RootStore';
import { startWorkers } from '@/workers/startWorkers';
import { BACKOFF_MS } from '@/workers/outboxDrainer';

const CHAT = 'rick';
const flush = () => new Promise((r) => setTimeout(r, 0));
const settle = async (root: RootStore) => { for (let i = 0; i < 40 && root.outbox.items.length; i++) await flush(); };

const boot = (client: KeyValueStorage, serverKV: KeyValueStorage, outcome: 'success' | 'success_delayed' = 'success') => {
  const cfg = { outcome, confirmDelayMs: 0 };
  const root = new RootStore(client, new MockPurchases(() => cfg, client), new MockBackendBilling(() => cfg));
  const api = new MockChatServer(serverKV, () => root.connectivity.faults, { seedCount: 10 });
  const stop = startWorkers(root, api);
  return { root, api, stop, done: () => { stop(); root.dispose(); } };
};

class FlakyKV extends MemoryKV {
  failWrites = false;
  override set(k: string, v: string) { if (this.failWrites) throw new Error('disk full'); super.set(k, v); }
}

test('finding 1: enqueue reports failure when the outbox cannot be persisted, and nothing is queued', () => {
  const client = new FlakyKV();
  const { root, done } = boot(client, new MemoryKV());
  root.connectivity.setOnline(false);
  client.failWrites = true;
  expect(() => root.outbox.enqueue(CHAT, 'lost on restart?')).toThrow('disk full');
  expect(root.outbox.items).toHaveLength(0);
  client.failWrites = false;
  root.outbox.enqueue(CHAT, 'kept');
  expect(JSON.parse(client.get('outbox.v1')!)).toHaveLength(1);
  done();
});

test('finding 2: an accepted message and its clientId mapping are committed in a single write', async () => {
  const kv = new FlakyKV(); const faults = defaultFaults();
  const a = new MockChatServer(kv, () => faults, { seedCount: 0 });
  a.messageCount(CHAT); // create the thread first so only the send's own writes are counted
  const setSpy = jest.spyOn(kv, 'set');
  await a.send({ chatId: CHAT, clientId: 'c1', text: 'once', createdAt: 1 });
  expect(setSpy.mock.calls.filter(([k]) => k.startsWith('chat.'))).toHaveLength(1);

  // A write that fails must not leave the message accepted without its duplicate protection.
  kv.failWrites = true;
  await expect(a.send({ chatId: CHAT, clientId: 'c2', text: 'twice?', createdAt: 2 })).rejects.toThrow('disk full');
  kv.failWrites = false;
  const b = new MockChatServer(kv, () => faults, { seedCount: 0 });
  expect(b.allMessages(CHAT).map((m) => m.text)).toEqual(['once']);
  await b.send({ chatId: CHAT, clientId: 'c2', text: 'twice?', createdAt: 2 });
  await b.send({ chatId: CHAT, clientId: 'c2', text: 'twice?', createdAt: 2 });
  expect(b.allMessages(CHAT).filter((m) => m.text === 'twice?')).toHaveLength(1);
});

test('finding 3: reconnecting from outside the chat still recovers incoming messages before draining', async () => {
  const client = new MemoryKV(); const serverKV = new MemoryKV();
  let s = boot(client, serverKV);
  s.root.connectivity.setOnline(false);
  s.root.outbox.enqueue(CHAT, 'out');
  await flush();
  s.done();
  s.api.injectIncoming(CHAT, ['i1', 'i2', 'i3', 'i4']);

  // Restart on the chat list: the thread was never opened, so there is no thread cache and no ThreadState.
  s = boot(client, serverKV);
  expect(s.root.chat.threads.size).toBe(0);
  s.root.connectivity.setOnline(true);
  await settle(s.root);

  const texts = s.root.chat.thread(CHAT).ordered.map((m) => m.text);
  expect(texts.slice(-5)).toEqual(['i1', 'i2', 'i3', 'i4', 'out']);
  expect(s.root.chat.thread(CHAT).lastSeq).toBe(15);
  s.done();
});

test('finding 3b: cold start while already online syncs before the first send', async () => {
  const client = new MemoryKV(); const serverKV = new MemoryKV();
  const seed = new MockChatServer(serverKV, () => defaultFaults(), { seedCount: 10 });
  seed.injectIncoming(CHAT, ['early']);
  client.set('outbox.v1', JSON.stringify([{ clientId: 'x', chatId: CHAT, text: 'queued', createdAt: 1, status: 'pending', attempts: 0 }]));

  const s = boot(client, serverKV);
  await settle(s.root);
  expect(s.root.chat.thread(CHAT).ordered.slice(-2).map((m) => m.text)).toEqual(['early', 'queued']);
  s.done();
});

test('finding 4: confirmed access requeues a payment-blocked send with the same clientId', async () => {
  const s = boot(new MemoryKV(), new MemoryKV());
  s.root.connectivity.setFault('failNextSend', 'PAYMENT_REQUIRED');
  const item = s.root.outbox.enqueue(CHAT, 'paid content');
  for (let i = 0; i < 20; i++) await flush();
  expect(s.root.outbox.items[0]).toMatchObject({ status: 'failed', error: { code: 'PAYMENT_REQUIRED', recoverable: false } });

  await s.root.billing.buy();
  expect(s.root.billing.isActive).toBe(true);
  await settle(s.root);
  expect(s.root.outbox.items).toHaveLength(0);
  const delivered = s.root.chat.thread(CHAT).ordered.filter((m) => m.text === 'paid content');
  expect(delivered).toHaveLength(1);
  expect(delivered[0]!.clientId).toBe(item.clientId);
  s.done();
});

test('finding 5: retries wait for the backoff deadline instead of firing on the status change', async () => {
  jest.useFakeTimers();
  const s = boot(new MemoryKV(), new MemoryKV());
  const sendSpy = jest.spyOn(s.api, 'send');
  s.root.connectivity.setFault('offline', true);
  s.root.outbox.enqueue(CHAT, 'flaky');
  await jest.advanceTimersByTimeAsync(0);
  expect(sendSpy).toHaveBeenCalledTimes(1);

  let elapsed = 0;
  for (const [n, delay] of BACKOFF_MS.entries()) {
    await jest.advanceTimersByTimeAsync(delay - 1); elapsed += delay - 1;
    expect(sendSpy).toHaveBeenCalledTimes(n + 1);
    await jest.advanceTimersByTimeAsync(1); elapsed += 1;
    expect(sendSpy).toHaveBeenCalledTimes(n + 2);
  }
  expect(elapsed).toBe(BACKOFF_MS.reduce((a, b) => a + b, 0));
  await jest.advanceTimersByTimeAsync(10);
  expect(sendSpy).toHaveBeenCalledTimes(BACKOFF_MS.length + 1);
  expect(s.root.outbox.items[0]).toMatchObject({ status: 'failed', error: { code: 'NETWORK', recoverable: true } });
  s.done(); jest.useRealTimers();
});
