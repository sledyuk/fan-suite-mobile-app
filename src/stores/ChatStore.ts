import { makeAutoObservable, observable, reaction } from 'mobx';
import type { ServerId, ServerMessage } from '@/services/api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';

const CACHE_KEY = (chatId: string) => `thread-cache.v1.${chatId}`;
const CACHE_SIZE = 50;

/** Confirmed messages of one thread, ordered by the server's seq. */
export class ThreadState {
  byId = observable.map<ServerId, ServerMessage>({}, { deep: false });
  orderedIds: ServerId[] = [];
  lastSeq = 0;
  oldestLoadedSeq: number | null = null;
  hasMore = true;
  loadingOlder = false;
  loaded = false;

  constructor() { makeAutoObservable(this); }

  /** Upsert by server id. Repeats never add copies; order only changes when a new id arrives. */
  upsert(msgs: ServerMessage[]) {
    let inserted = false;
    for (const m of msgs) {
      if (!this.byId.has(m.id)) inserted = true;
      this.byId.set(m.id, m);
      if (m.seq > this.lastSeq) this.lastSeq = m.seq;
    }
    if (!inserted) return;
    const ids = [...this.byId.values()].sort((a, b) => a.seq - b.seq).map((m) => m.id);
    this.orderedIds = ids;
    this.oldestLoadedSeq = this.byId.get(ids[0])!.seq;
  }
  setPage(msgs: ServerMessage[], hasMore: boolean) { this.upsert(msgs); this.hasMore = hasMore; this.loadingOlder = false; this.loaded = true; }
  setLoadingOlder(b: boolean) { this.loadingOlder = b; }

  get ordered(): ServerMessage[] { return this.orderedIds.map((id) => this.byId.get(id)!); }
}

/**
 * History is re-paged from the server on launch, but the newest CACHE_SIZE
 * confirmed messages of each thread are cached locally so a thread opened
 * offline (or right after a restart) shows recent context above the outbox.
 */
export class ChatStore {
  threads = observable.map<string, ThreadState>({}, { deep: false });
  private disposers: (() => void)[] = [];
  constructor(private storage?: KeyValueStorage) { makeAutoObservable<ChatStore, 'disposers' | 'storage'>(this, { disposers: false, storage: false }); }

  thread(chatId: string): ThreadState {
    let t = this.threads.get(chatId);
    if (!t) {
      t = new ThreadState();
      this.threads.set(chatId, t);
      if (this.storage) {
        const raw = this.storage.get(CACHE_KEY(chatId));
        if (raw) { try { t.upsert(JSON.parse(raw) as ServerMessage[]); t.hasMore = true; } catch { this.storage.remove(CACHE_KEY(chatId)); } }
        const th = t; const st = this.storage;
        this.disposers.push(reaction(() => th.lastSeq, () => st.set(CACHE_KEY(chatId), JSON.stringify(th.ordered.slice(-CACHE_SIZE)))));
      }
    }
    return t;
  }
  clear() { this.threads.clear(); for (const d of this.disposers) d(); this.disposers = []; if (this.storage) for (const k of this.storage.keys()) if (k.startsWith('thread-cache.')) this.storage.remove(k); }
  dispose() { for (const d of this.disposers) d(); }
}
