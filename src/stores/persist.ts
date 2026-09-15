import { reaction, runInAction } from 'mobx';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';

export function persistSlice<T>(storage: KeyValueStorage, key: string, read: () => T, apply: (v: T) => void): () => void {
  const raw = storage.get(key);
  if (raw !== null) {
    try { runInAction(() => apply(JSON.parse(raw) as T)); } catch { storage.remove(key); }
  }
  return reaction(() => JSON.stringify(read()), (json) => storage.set(key, json));
}
