import { makeAutoObservable } from 'mobx';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

export class SettingsStore {
  developerMode = __DEV__;
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'settings.v1', () => ({ developerMode: this.developerMode }), (v) => { this.developerMode = v.developerMode; });
  }
  setDeveloperMode(on: boolean) { this.developerMode = on; }
}
