import { MemoryKV } from '@/storage/MemoryKV';
import { MockChatServer } from '@/services/mock/MockChatServer';
import { MockBackendBilling } from '@/services/mock/MockBackendBilling';
import { MockPurchases } from '@/services/mock/MockPurchases';
import { RootStore } from '@/stores/RootStore';
import { startWorkers } from '@/workers/startWorkers';

const CHAT = 'rick';
const flush = () => new Promise((r) => setTimeout(r, 0));

const boot = async (client: MemoryKV, serverKV: MemoryKV) => {
  const cfg = { outcome: 'success' as const, confirmDelayMs: 0 };
  const root = new RootStore(client, new MockPurchases(() => cfg, client), new MockBackendBilling(() => cfg));
  const api = new MockChatServer(serverKV, () => root.connectivity.faults, { seedCount: 10 });
  const stop = startWorkers(root, api);
  const page = await api.getPage(CHAT, null, 50).catch(() => null);
  if (page) root.chat.thread(CHAT).setPage(page.messages, page.hasMore);
  return { root, api, stop };
};

test('3 pending survive a restart; 4 incoming are recovered first; pending flush in order; no duplicates', async () => {
  const client = new MemoryKV(); const serverKV = new MemoryKV();

  let s = await boot(client, serverKV);
  s.root.connectivity.setOnline(false);
  for (const t of ['a', 'b', 'c']) s.root.outbox.enqueue(CHAT, t);
  await flush();
  expect(s.root.outbox.items).toHaveLength(3);
  s.stop(); s.root.dispose();

  s.api.injectIncoming(CHAT, ['i1', 'i2', 'i3', 'i4']);

  s = await boot(client, serverKV);
  expect(s.root.connectivity.online).toBe(false);
  expect(s.root.outbox.items.map((i) => [i.text, i.status])).toEqual([['a', 'pending'], ['b', 'pending'], ['c', 'pending']]);
  expect(s.root.chat.thread(CHAT).loaded).toBe(false);
  expect(s.root.chat.thread(CHAT).ordered.length).toBe(10);

  s.root.connectivity.setOnline(true);
  for (let i = 0; i < 40 && s.root.outbox.items.length; i++) await flush();

  const texts = s.root.chat.thread(CHAT).ordered.map((m) => m.text);
  expect(texts.slice(-7)).toEqual(['i1', 'i2', 'i3', 'i4', 'a', 'b', 'c']);
  expect(s.root.outbox.items).toHaveLength(0);
  expect(s.api.messageCount(CHAT)).toBe(10 + 4 + 3);

  const before = s.root.chat.thread(CHAT).orderedIds;
  s.root.chat.thread(CHAT).upsert(await s.api.sync(CHAT, 0));
  expect(s.root.chat.thread(CHAT).orderedIds).toBe(before);
  s.stop(); s.root.dispose();
});

test('lost response + retry through the whole stack yields one copy', async () => {
  const client = new MemoryKV(); const serverKV = new MemoryKV();
  const s = await boot(client, serverKV);
  s.root.connectivity.setFault('dropNextResponse', true);
  s.root.outbox.enqueue(CHAT, 'once');
  for (let i = 0; i < 40 && s.root.outbox.items.length; i++) await new Promise((r) => setTimeout(r, 20));
  expect(s.root.outbox.items).toHaveLength(0);
  expect(s.api.allMessages(CHAT).filter((m) => m.text === 'once')).toHaveLength(1);
  expect(s.root.chat.thread(CHAT).ordered.filter((m) => m.text === 'once')).toHaveLength(1);
  s.stop(); s.root.dispose();
});

test('a failed send blocks the messages queued behind it in the same chat (local order preserved)', async () => {
  const s = await boot(new MemoryKV(), new MemoryKV());
  s.root.connectivity.setFault('failNextSend', 'RATE_LIMITED');
  s.root.outbox.enqueue(CHAT, 'first'); s.root.outbox.enqueue(CHAT, 'second');
  for (let i = 0; i < 20; i++) await flush();
  expect(s.root.outbox.items.map((i) => [i.text, i.status])).toEqual([['first', 'failed'], ['second', 'pending']]);
  expect(s.api.messageCount(CHAT)).toBe(10);
  s.root.outbox.retry(s.root.outbox.items[0].clientId);
  for (let i = 0; i < 40 && s.root.outbox.items.length; i++) await flush();
  expect(s.root.chat.thread(CHAT).ordered.slice(-2).map((m) => m.text)).toEqual(['first', 'second']);
  s.stop(); s.root.dispose();
});

test('a sync that returns our own message (by clientId) retires the outbox item — no double bubble', async () => {
  const s = await boot(new MemoryKV(), new MemoryKV());
  s.root.connectivity.setOnline(false);
  const item = s.root.outbox.enqueue(CHAT, 'raced');
  s.root.connectivity.setFault('offline', false); s.root.connectivity.setFault('dropNextResponse', true);
  await expect(s.api.send({ chatId: CHAT, clientId: item.clientId, text: 'raced', createdAt: item.createdAt })).rejects.toMatchObject({ code: 'NETWORK' });
  s.root.applyServerMessages(CHAT, await s.api.sync(CHAT, s.root.chat.thread(CHAT).lastSeq));
  expect(s.root.outbox.items).toHaveLength(0);
  expect(s.root.chat.thread(CHAT).ordered.filter((m) => m.text === 'raced')).toHaveLength(1);
  s.stop(); s.root.dispose();
});

test('network errors retry three times with backoff before the item is marked failed', async () => {
  jest.useFakeTimers();
  const s = await boot(new MemoryKV(), new MemoryKV());
  const sendSpy = jest.spyOn(s.api, 'send');
  s.root.connectivity.setFault('offline', true);
  s.root.outbox.enqueue(CHAT, 'flaky');
  await jest.advanceTimersByTimeAsync(0);
  await jest.advanceTimersByTimeAsync(500); await jest.advanceTimersByTimeAsync(1500); await jest.advanceTimersByTimeAsync(4000);
  await jest.advanceTimersByTimeAsync(10);
  expect(sendSpy).toHaveBeenCalledTimes(4);
  expect(s.root.outbox.items[0].status).toBe('failed');
  expect(s.root.outbox.items[0].error?.recoverable).toBe(true);
  s.stop(); s.root.dispose(); jest.useRealTimers();
});
