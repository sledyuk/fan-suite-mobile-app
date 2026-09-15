import Storage from 'expo-sqlite/kv-store';
import { NamespacedKV, type KeyValueStorage } from './KeyValueStorage';

/** expo-sqlite/kv-store: synchronous, on disk, bundled in Expo Go. */
const sqliteKV: KeyValueStorage = {
  get: (k) => Storage.getItemSync(k),
  set: (k, v) => { Storage.setItemSync(k, v); },
  remove: (k) => { Storage.removeItemSync(k); },
  keys: () => Storage.getAllKeysSync(),
  clear: () => { Storage.clearSync(); },
};

/** The app's own state (outbox, entitlement, connectivity). */
export const clientKV: KeyValueStorage = new NamespacedKV(sqliteKV, 'client:');
/** The mock backend's state (accepted messages). Kept apart from the client on purpose. */
export const serverKV: KeyValueStorage = new NamespacedKV(sqliteKV, 'server:');
