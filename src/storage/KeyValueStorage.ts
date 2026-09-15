/** Minimal synchronous key-value contract. Sync on purpose: an outbox item must be on disk before the UI calls it "queued". */
export interface KeyValueStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
  clear(): void;
}

/** Prefixes keys so several owners (client, mock server) share one physical store without seeing each other. */
export class NamespacedKV implements KeyValueStorage {
  constructor(private inner: KeyValueStorage, private prefix: string) {}
  get(k: string) { return this.inner.get(this.prefix + k); }
  set(k: string, v: string) { this.inner.set(this.prefix + k, v); }
  remove(k: string) { this.inner.remove(this.prefix + k); }
  keys() { return this.inner.keys().filter((k) => k.startsWith(this.prefix)).map((k) => k.slice(this.prefix.length)); }
  clear() { for (const k of this.keys()) this.remove(k); }
}
