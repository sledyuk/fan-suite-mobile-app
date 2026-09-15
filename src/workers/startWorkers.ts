import type { ChatApi } from '@/services/api/ChatApi';
import type { RootStore } from '@/stores/RootStore';
import { startListSync } from './listSync';
import { startOutboxDrainer } from './outboxDrainer';
import { startSyncWorker } from './syncWorker';

export function startWorkers(root: RootStore, api: ChatApi) {
  const stopSync = startSyncWorker(root, api);
  const stopDrain = startOutboxDrainer(root, api);
  const stopList = startListSync(root);
  return () => { stopSync(); stopDrain(); stopList(); };
}
