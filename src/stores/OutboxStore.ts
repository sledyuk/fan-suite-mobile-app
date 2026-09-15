import * as Crypto from 'expo-crypto';
import { makeAutoObservable } from 'mobx';
import type { Attachment, OutboxError, OutboxItem } from '@/services/api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

const KEY = 'outbox.v1';

export class OutboxStore {
  items: OutboxItem[] = [];
  dispose: () => void;

  constructor(private storage: KeyValueStorage) {
    makeAutoObservable<OutboxStore, 'storage'>(this, { dispose: false, storage: false });
    this.dispose = persistSlice(storage, KEY, () => this.items, (v) => {
      // A restart drops in-flight timers and requests: reopen 'sending' as 'pending' and clear any backoff deadline.
      this.items = v.map(({ nextAttemptAt: _n, ...i }) => (i.status === 'sending' ? { ...i, status: 'pending' } : i));
    });
  }

  private find(clientId: string) {
    const it = this.items.find((i) => i.clientId === clientId);
    if (!it) throw new Error(`outbox: unknown item ${clientId}`);
    return it;
  }

  enqueue(chatId: string, text: string, opts: { clientId?: string; createdAt?: number; attachment?: Attachment } = {}): OutboxItem {
    const item: OutboxItem = { clientId: opts.clientId ?? Crypto.randomUUID(), chatId, text, createdAt: opts.createdAt ?? Date.now(), status: 'pending', attempts: 0, ...(opts.attachment ? { attachment: opts.attachment } : {}) };
    this.items.push(item);
    // Persist before reporting the item as queued. The reaction in persistSlice also writes, but its errors never
    // reach the caller; this synchronous write does, and the item is rolled back so the composer keeps the draft.
    try { this.storage.set(KEY, JSON.stringify(this.items)); } catch (e) { this.items.pop(); throw e; }
    return this.items[this.items.length - 1]!;
  }
  /** Queues the same text for several chats as one durable write: either every recipient is queued or none is. */
  enqueueMany(chatIds: string[], text: string): OutboxItem[] {
    const start = this.items.length;
    const created = chatIds.map((chatId) => { const item: OutboxItem = { clientId: Crypto.randomUUID(), chatId, text, createdAt: Date.now(), status: 'pending', attempts: 0 }; this.items.push(item); return item; });
    try { this.storage.set(KEY, JSON.stringify(this.items)); } catch (e) { this.items.splice(start); throw e; }
    return created;
  }
  markSending(id: string) { const it = this.find(id); it.status = 'sending'; it.attempts += 1; }
  markPending(id: string, nextAttemptAt?: number) { const it = this.find(id); it.status = 'pending'; it.error = undefined; it.nextAttemptAt = nextAttemptAt; }
  markFailed(id: string, error: OutboxError) { const it = this.find(id); it.status = 'failed'; it.error = error; }
  remove(id: string) { this.items = this.items.filter((i) => i.clientId !== id); }
  retry(id: string) { const it = this.find(id); it.status = 'pending'; it.error = undefined; it.attempts = 0; it.nextAttemptAt = undefined; }
  clear() { this.items = []; }

  get pending() { return this.items.filter((i) => i.status === 'pending'); }
  get sendingOne() { return this.items.some((i) => i.status === 'sending'); }
  forChat(chatId: string) { return this.items.filter((i) => i.chatId === chatId); }
}
