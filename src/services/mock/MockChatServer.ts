import type { ChatApi } from '../api/ChatApi';
import { SendError, type Attachment, type ClientId, type ServerId, type ServerMessage } from '../api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import type { Faults } from './faults';
import { generateHistory } from './historyGenerator';
import { pageOf } from './historySource';

interface Thread {
  /** Full in-memory history: deterministic seed followed by the persisted tail. */
  messages: ServerMessage[];
  acceptedByClientId: Record<ClientId, ServerId>;
  nextSeq: number;
  /** How the seed was generated, so a restart can rebuild it instead of reading it back from storage. */
  seed: { count: number; seed: number; endAt?: number };
}

/** What actually hits storage: everything after the seed. The 50k seeded messages are never serialized. */
interface PersistedThread {
  tail: ServerMessage[];
  acceptedByClientId: Record<ClientId, ServerId>;
  nextSeq: number;
  seed: Thread['seed'];
}

const KEY = (chatId: string) => `chat.v2.${chatId}`;
const LEGACY_KEY = (chatId: string) => `chat.v1.${chatId}`;

/** v1 stored the whole thread, seed included. Split it back into seed parameters plus tail so nothing accepted is lost. */
function migrateV1(raw: string, seed: number): { thread: Thread; persisted: PersistedThread } {
  const old = JSON.parse(raw) as { messages: ServerMessage[]; acceptedByClientId: Record<ClientId, ServerId>; nextSeq: number };
  const seeded = old.messages.filter((m) => m.id.startsWith('h_'));
  const tail = old.messages.filter((m) => !m.id.startsWith('h_'));
  const last = seeded[seeded.length - 1];
  const seedParams: Thread['seed'] = { count: seeded.length, seed, ...(last ? { endAt: last.createdAt } : {}) };
  const persisted: PersistedThread = { tail, acceptedByClientId: old.acceptedByClientId, nextSeq: old.nextSeq, seed: seedParams };
  return { thread: { messages: old.messages, acceptedByClientId: old.acceptedByClientId, nextSeq: old.nextSeq, seed: seedParams }, persisted };
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ServerOptions {
  seedCount?: number | (() => number);
  seedFor?: (chatId: string) => number;
  tailFor?: (chatId: string) => { authorId: 'fan' | 'creator'; text: string; createdAt: number }[];
}

export class MockChatServer implements ChatApi {
  private threads = new Map<string, Thread>();

  constructor(protected storage: KeyValueStorage, protected faults: () => Faults, protected opts: ServerOptions = {}) {}

  protected thread(chatId: string): Thread {
    let t = this.threads.get(chatId);
    if (!t) {
      const raw = this.storage.get(KEY(chatId));
      const legacy = raw ? null : this.storage.get(LEGACY_KEY(chatId));
      if (legacy) {
        const m = migrateV1(legacy, this.opts.seedFor?.(chatId) ?? 42);
        t = m.thread;
        this.storage.set(KEY(chatId), JSON.stringify(m.persisted));
        this.storage.remove(LEGACY_KEY(chatId));
      } else if (raw) {
        const p = JSON.parse(raw) as PersistedThread;
        t = { messages: [...generateHistory(p.seed.count, p.seed.seed, p.seed.endAt), ...p.tail], acceptedByClientId: p.acceptedByClientId, nextSeq: p.nextSeq, seed: p.seed };
      } else {
        const count = typeof this.opts.seedCount === 'function' ? this.opts.seedCount() : (this.opts.seedCount ?? 50_000);
        const tail = this.opts.tailFor?.(chatId) ?? [];
        const seedParams = { count, seed: this.opts.seedFor?.(chatId) ?? 42, ...(tail[0] ? { endAt: tail[0].createdAt - 60_000 } : {}) };
        const seed = generateHistory(seedParams.count, seedParams.seed, seedParams.endAt);
        const messages = [...seed, ...tail.map((m, i) => ({ id: `m_${chatId}_${seed.length + i + 1}`, seq: seed.length + i + 1, authorId: m.authorId, text: m.text, createdAt: m.createdAt, kind: 'text' as const }))];
        t = { messages, acceptedByClientId: {}, nextSeq: messages.length + 1, seed: seedParams };
        this.persist(chatId, t);
      }
      this.threads.set(chatId, t);
    }
    return t;
  }

  protected persist(chatId: string, t: Thread) {
    const p: PersistedThread = { tail: t.messages.slice(t.seed.count), acceptedByClientId: t.acceptedByClientId, nextSeq: t.nextSeq, seed: t.seed };
    this.storage.set(KEY(chatId), JSON.stringify(p));
  }

  protected async gate() {
    const f = this.faults();
    if (f.latencyMs) await sleep(f.latencyMs);
    if (f.offline) throw new SendError('NETWORK', true, 'You are offline');
  }

  protected maybeFail() {
    const f = this.faults();
    if (!f.failNextSend) return;
    const code = f.failNextSend; f.failNextSend = null;
    if (code === 'RATE_LIMITED') throw new SendError(code, true, 'Too many messages, try again in a moment');
    if (code === 'PAYMENT_REQUIRED') throw new SendError(code, false, 'Subscription required to send messages');
    throw new SendError('BLOCKED', false, "You can't message this fan");
  }

  /**
   * Appends the message and, when `remember` is set, its clientId mapping, then commits both in ONE storage write.
   * Two separate writes would leave a window where the message is durable but its duplicate protection is not.
   */
  protected accept(chatId: string, t: Thread, input: { clientId: ClientId; text: string; createdAt: number; attachment?: Attachment }, remember = true): ServerMessage {
    const msg: ServerMessage = { id: `m_${chatId}_${t.nextSeq}`, clientId: input.clientId, seq: t.nextSeq, authorId: 'creator', text: input.text, createdAt: Date.now(), kind: input.attachment?.kind ?? 'text', ...(input.attachment ? { attachment: input.attachment } : {}) };
    t.messages.push(msg);
    t.nextSeq += 1;
    if (remember) t.acceptedByClientId[input.clientId] = msg.id;
    try {
      this.persist(chatId, t);
    } catch (e) {
      // The write failed, so nothing was accepted: undo the in-memory mutation. Otherwise a retry against this same
      // instance would be answered from memory with a message that no longer exists after a restart.
      t.messages.pop();
      t.nextSeq -= 1;
      if (remember) delete t.acceptedByClientId[input.clientId];
      throw e;
    }
    return msg;
  }

  protected maybeDropResponse() {
    const f = this.faults();
    if (f.dropNextResponse) { f.dropNextResponse = false; throw new SendError('NETWORK', true, 'Response lost'); }
  }

  async send(input: { chatId: string; clientId: ClientId; text: string; createdAt: number; attachment?: Attachment }): Promise<ServerMessage> {
    await this.gate();
    this.maybeFail();
    const t = this.thread(input.chatId);
    const existing = t.acceptedByClientId[input.clientId];
    if (existing) return t.messages.find((m) => m.id === existing)!;
    const msg = this.accept(input.chatId, t, input);
    this.maybeDropResponse();
    return msg;
  }

  async sync(chatId: string, sinceSeq: number) {
    await this.gate();
    return this.thread(chatId).messages.filter((m) => m.seq > sinceSeq);
  }

  async getPage(chatId: string, beforeSeq: number | null, limit: number) {
    await this.gate();
    return pageOf(this.thread(chatId).messages, beforeSeq, limit);
  }

  injectMessage(chatId: string, m: { authorId: 'fan' | 'creator'; text: string; createdAt: number }): ServerMessage {
    const t = this.thread(chatId);
    const msg: ServerMessage = { id: `m_${chatId}_${t.nextSeq}`, seq: t.nextSeq++, authorId: m.authorId, text: m.text, createdAt: m.createdAt, kind: 'text' };
    t.messages.push(msg); this.persist(chatId, t); return msg;
  }

  injectIncoming(chatId: string, texts: string[]): ServerMessage[] {
    const t = this.thread(chatId);
    const out = texts.map((text) => { const m: ServerMessage = { id: `m_${chatId}_${t.nextSeq}`, seq: t.nextSeq++, authorId: 'fan', text, createdAt: Date.now(), kind: 'text' }; t.messages.push(m); return m; });
    this.persist(chatId, t);
    return out;
  }

  reset() { for (const k of this.storage.keys()) this.storage.remove(k); this.threads.clear(); }
  messageCount(chatId: string) { return this.thread(chatId).messages.length; }
  allMessages(chatId: string) { return this.thread(chatId).messages; }
}
