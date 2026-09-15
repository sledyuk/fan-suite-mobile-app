import { reaction, runInAction } from 'mobx';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';

/**
 * Hydrate a slice from storage now, then write it back synchronously after every
 * change. MobX runs the reaction as soon as the outermost action ends, and the
 * storage is sync, so callers can rely on "if the action returned, it is on disk".
 */
export function persistSlice<T>(storage: KeyValueStorage, key: string, read: () => T, apply: (v: T) => void): () => void {
  const raw = storage.get(key);
  if (raw !== null) {
    try { runInAction(() => apply(JSON.parse(raw) as T)); } catch { storage.remove(key); }
  }
  return reaction(() => JSON.stringify(read()), (json) => storage.set(key, json));
}
