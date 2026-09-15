import { MemoryKV } from '@/storage/MemoryKV';
import { MockChatServer } from '@/services/mock/MockChatServer';
import { NaiveChatServer } from '@/services/mock/NaiveChatServer';
import { defaultFaults, type Faults } from '@/services/mock/faults';

const CHAT = 'rick';
type Server = new (...a: ConstructorParameters<typeof MockChatServer>) => MockChatServer;
const setup = (Impl: Server) => { const faults: Faults = defaultFaults(); return { faults, server: new Impl(new MemoryKV(), () => faults, { seedCount: 0 }) }; };

/** Send reaches the server, the response is lost, the user retries with the same clientId. */
const lostResponseThenRetry = async (server: MockChatServer, faults: Faults) => {
  const msg = { chatId: CHAT, clientId: 'c1', text: 'hello', createdAt: 1 };
  faults.dropNextResponse = true;
  await expect(server.send(msg)).rejects.toMatchObject({ code: 'NETWORK' });
  await server.send(msg);
  return server.allMessages(CHAT).filter((m) => m.text === 'hello').length;
};

describe('duplicate send after a lost response', () => {
  test.failing('BUG: a server without an idempotency key stores the retried send twice', async () => {
    const { server, faults } = setup(NaiveChatServer);
    expect(await lostResponseThenRetry(server, faults)).toBe(1);
  });

  test('FIX: the server remembers accepted clientIds and returns the existing message', async () => {
    const { server, faults } = setup(MockChatServer);
    expect(await lostResponseThenRetry(server, faults)).toBe(1);
    const again = await server.send({ chatId: CHAT, clientId: 'c1', text: 'hello', createdAt: 1 });
    expect(again.id).toBe(server.allMessages(CHAT)[0].id);
    expect(server.messageCount(CHAT)).toBe(1);
  });

  test('accepted messages survive a server restart (same storage, new instance)', async () => {
    const faults = defaultFaults(); const kv = new MemoryKV();
    const a = new MockChatServer(kv, () => faults, { seedCount: 0 });
    await a.send({ chatId: CHAT, clientId: 'c9', text: 'persist me', createdAt: 1 });
    const b = new MockChatServer(kv, () => faults, { seedCount: 0 });
    expect(b.messageCount(CHAT)).toBe(1);
    expect((await b.send({ chatId: CHAT, clientId: 'c9', text: 'persist me', createdAt: 1 })).seq).toBe(1);
  });

  test('typed failures: recoverable vs not', async () => {
    const { server, faults } = setup(MockChatServer);
    faults.failNextSend = 'RATE_LIMITED';
    await expect(server.send({ chatId: CHAT, clientId: 'r', text: 'x', createdAt: 1 })).rejects.toMatchObject({ code: 'RATE_LIMITED', recoverable: true });
    faults.failNextSend = 'BLOCKED';
    await expect(server.send({ chatId: CHAT, clientId: 'b', text: 'x', createdAt: 1 })).rejects.toMatchObject({ code: 'BLOCKED', recoverable: false });
    expect(server.messageCount(CHAT)).toBe(0);
  });
});
