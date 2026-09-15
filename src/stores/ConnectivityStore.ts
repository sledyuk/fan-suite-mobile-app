import { makeAutoObservable } from 'mobx';
import { defaultFaults, type Faults } from '@/services/mock/faults';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

/** Simulated network state + fault switches. Persisted so "force-quit while offline" reopens offline. */
export class ConnectivityStore {
  online = true;
  faults: Faults = defaultFaults();
  syncing = false;
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'connectivity.v1', () => ({ online: this.online, faults: this.faults }), (v) => {
      this.online = v.online; this.faults = { ...defaultFaults(), ...v.faults };
    });
  }

  setOnline(online: boolean) { this.online = online; this.faults.offline = !online; }
  setFault<K extends keyof Faults>(k: K, v: Faults[K]) { this.faults[k] = v; }
  setSyncing(b: boolean) { this.syncing = b; }
}
