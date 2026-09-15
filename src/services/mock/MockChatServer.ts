import type { ChatApi } from '../api/ChatApi';
import { SendError, type Attachment, type ClientId, type ServerId, type ServerMessage } from '../api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import type { Faults } from './faults';
import { generateHistory } from './historyGenerator';
import { pageOf } from './historySource';

interface Thread {
  messages: ServerMessage[];
  acceptedByClientId: Record<ClientId, ServerId>;
  nextSeq: number;
}

const KEY = (chatId: string) => `chat.v1.${chatId}`;
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
      if (raw) t = JSON.parse(raw) as Thread;
      else {
        const count = typeof this.opts.seedCount === 'function' ? this.opts.seedCount() : (this.opts.seedCount ?? 50_000);
        const tail = this.opts.tailFor?.(chatId) ?? [];
        const seed = generateHistory(count, this.opts.seedFor?.(chatId) ?? 42, tail[0] ? tail[0].createdAt - 60_000 : undefined);
        const messages = [...seed, ...tail.map((m, i) => ({ id: `m_${chatId}_${seed.length + i + 1}`, seq: seed.length + i + 1, authorId: m.authorId, text: m.text, createdAt: m.createdAt, kind: 'text' as const }))];
        t = { messages, acceptedByClientId: {}, nextSeq: messages.length + 1 };
        this.persist(chatId, t);
      }
      this.threads.set(chatId, t);
    }
    return t;
  }

  protected persist(chatId: string, t: Thread) { this.storage.set(KEY(chatId), JSON.stringify(t)); }

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

  protected accept(chatId: string, t: Thread, input: { clientId: ClientId; text: string; createdAt: number; attachment?: Attachment }): ServerMessage {
    const msg: ServerMessage = { id: `m_${chatId}_${t.nextSeq}`, clientId: input.clientId, seq: t.nextSeq++, authorId: 'creator', text: input.text, createdAt: Date.now(), kind: input.attachment?.kind ?? 'text', ...(input.attachment ? { attachment: input.attachment } : {}) };
    t.messages.push(msg);
    this.persist(chatId, t);
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
    t.acceptedByClientId[input.clientId] = msg.id;
    this.persist(input.chatId, t);
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
