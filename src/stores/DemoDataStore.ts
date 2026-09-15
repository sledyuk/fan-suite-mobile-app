import { makeAutoObservable } from 'mobx';
import { CONVERSATIONS, type Conversation } from '@/services/mock/conversations';
import { WALLET, type Transaction } from '@/services/mock/wallet';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

export interface WalletState { balance: number; pendingPayout: number; thisMonth: number; transactions: Transaction[] }
const EMPTY_WALLET: WalletState = { balance: 0, pendingPayout: 0, thisMonth: 0, transactions: [] };

export class DemoDataStore {
  seeded = false;
  activeChatId: string | null = null;
  conversations: Conversation[] = [];
  wallet: WalletState = EMPTY_WALLET;
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'demo.v1', () => ({ seeded: this.seeded, conversations: this.conversations, wallet: this.wallet }), (v) => {
      this.seeded = v.seeded; this.conversations = v.conversations; this.wallet = v.wallet;
    });
  }

  seed() {
    this.seeded = true;
    this.conversations = CONVERSATIONS.map((c) => ({ ...c }));
    this.wallet = { ...WALLET, transactions: [...WALLET.transactions] };
  }
  clear() { this.seeded = false; this.conversations = []; this.wallet = EMPTY_WALLET; }

  find(id: string | undefined) { return this.conversations.find((c) => c.id === id); }
  get unreadTotal() { return this.conversations.reduce((n, c) => n + c.unreadCount, 0); }
  get ordered() { return [...this.conversations].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.last.at - a.last.at); }

  private patch(id: string, fn: (c: Conversation) => Partial<Conversation>) {
    this.conversations = this.conversations.map((c) => (c.id === id ? { ...c, ...fn(c) } : c));
  }
  toggleRead(id: string) { this.patch(id, (c) => ({ unreadCount: c.unreadCount > 0 ? 0 : c.last.from === 'fan' ? 1 : 0 })); }
  markRead(id: string) { this.patch(id, () => ({ unreadCount: 0 })); }
  bumpUnread(id: string, by = 1) { this.patch(id, (c) => ({ unreadCount: c.unreadCount + by })); }
  setActiveChat(id: string | null) { this.activeChatId = id; if (id) this.markRead(id); }
  togglePin(id: string) { this.patch(id, (c) => ({ pinned: !c.pinned })); }
  toggleMute(id: string) { this.patch(id, (c) => ({ muted: !c.muted })); }
  setLast(id: string, last: Conversation['last']) { this.patch(id, () => ({ last })); }
}
