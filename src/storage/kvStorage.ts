import Storage from 'expo-sqlite/kv-store';
import { NamespacedKV, type KeyValueStorage } from './KeyValueStorage';

const sqliteKV: KeyValueStorage = {
  get: (k) => Storage.getItemSync(k),
  set: (k, v) => { Storage.setItemSync(k, v); },
  remove: (k) => { Storage.removeItemSync(k); },
  keys: () => Storage.getAllKeysSync(),
  clear: () => { Storage.clearSync(); },
};

export const clientKV: KeyValueStorage = new NamespacedKV(sqliteKV, 'client:');
export const serverKV: KeyValueStorage = new NamespacedKV(sqliteKV, 'server:');
