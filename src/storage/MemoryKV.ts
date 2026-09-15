import type { KeyValueStorage } from './KeyValueStorage';

/** In-memory store for tests. "Restart" = build new stores over the same instance. */
export class MemoryKV implements KeyValueStorage {
  private m = new Map<string, string>();
  get(k: string) { return this.m.get(k) ?? null; }
  set(k: string, v: string) { this.m.set(k, v); }
  remove(k: string) { this.m.delete(k); }
  keys() { return [...this.m.keys()]; }
  clear() { this.m.clear(); }
}
