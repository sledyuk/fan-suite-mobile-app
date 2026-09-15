import { makeAutoObservable } from 'mobx';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

export class SettingsStore {
  developerMode = __DEV__;
  /** The debug console explains itself the first time it opens; dismissed once per install. */
  debugIntroSeen = false;
  dispose: () => void;

  constructor(storage: KeyValueStorage) {
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(storage, 'settings.v1', () => ({ developerMode: this.developerMode, debugIntroSeen: this.debugIntroSeen }), (v) => {
      this.developerMode = v.developerMode; this.debugIntroSeen = v.debugIntroSeen ?? false;
    });
  }
  setDeveloperMode(on: boolean) { this.developerMode = on; }
  dismissDebugIntro() { this.debugIntroSeen = true; }
}
