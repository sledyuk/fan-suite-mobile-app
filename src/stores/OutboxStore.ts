import * as Crypto from 'expo-crypto';
import { makeAutoObservable } from 'mobx';
import type { Attachment, OutboxError, OutboxItem } from '@/services/api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

export class OutboxStore {
  items: OutboxItem[] = [];
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'outbox.v1', () => this.items, (v) => {
      this.items = v.map((i) => (i.status === 'sending' ? { ...i, status: 'pending' } : i));
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
    return this.items[this.items.length - 1]!;
  }
  markSending(id: string) { const it = this.find(id); it.status = 'sending'; it.attempts += 1; }
  markPending(id: string) { const it = this.find(id); it.status = 'pending'; it.error = undefined; }
  markFailed(id: string, error: OutboxError) { const it = this.find(id); it.status = 'failed'; it.error = error; }
  remove(id: string) { this.items = this.items.filter((i) => i.clientId !== id); }
  retry(id: string) { const it = this.find(id); it.status = 'pending'; it.error = undefined; it.attempts = 0; }
  clear() { this.items = []; }

  get pending() { return this.items.filter((i) => i.status === 'pending'); }
  get sendingOne() { return this.items.some((i) => i.status === 'sending'); }
  forChat(chatId: string) { return this.items.filter((i) => i.chatId === chatId); }
}
