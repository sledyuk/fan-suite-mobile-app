import { reaction, runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import type { RootStore } from '@/stores/RootStore';

export async function syncOnce(root: RootStore, api: ChatApi) {
  runInAction(() => root.connectivity.setSyncing(true));
  try {
    for (const [chatId, t] of root.chat.threads) {
      const msgs = await api.sync(chatId, t.lastSeq);
      runInAction(() => { if (msgs.length) root.applyServerMessages(chatId, msgs); });
    }
  } catch {
  } finally {
    runInAction(() => root.connectivity.setSyncing(false));
  }
}

export function startSyncWorker(root: RootStore, api: ChatApi) {
  return reaction(() => root.connectivity.online, (online) => { if (online) void syncOnce(root, api); });
}
