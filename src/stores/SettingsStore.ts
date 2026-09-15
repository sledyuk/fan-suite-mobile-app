import { makeAutoObservable } from 'mobx';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

/** User-facing preferences. Persisted under `settings.v1`. */
export class SettingsStore {
  /** Shows the floating debug button on every screen (More → Developer mode). Defaults on in dev builds. */
  developerMode = __DEV__;
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'settings.v1', () => ({ developerMode: this.developerMode }), (v) => { this.developerMode = v.developerMode; });
  }
  setDeveloperMode(on: boolean) { this.developerMode = on; }
}
