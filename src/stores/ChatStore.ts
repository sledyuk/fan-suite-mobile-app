import { makeAutoObservable, observable } from 'mobx';
import type { ServerId, ServerMessage } from '@/services/api/types';

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

/** Not persisted: history is re-paged from the server on launch; only the outbox needs to survive restarts. */
export class ChatStore {
  threads = observable.map<string, ThreadState>({}, { deep: false });
  constructor() { makeAutoObservable(this); }
  thread(chatId: string): ThreadState {
    let t = this.threads.get(chatId);
    if (!t) { t = new ThreadState(); this.threads.set(chatId, t); }
    return t;
  }
  clear() { this.threads.clear(); }
}
