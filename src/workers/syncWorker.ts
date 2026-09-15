import { reaction, runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import type { RootStore } from '@/stores/RootStore';

const PAGE_SIZE = 50;

/** Chats that need recovery: every open thread plus every chat with queued outgoing messages. */
function chatsToSync(root: RootStore): string[] {
  const ids = new Set<string>(root.chat.threads.keys());
  for (const i of root.outbox.items) ids.add(i.chatId);
  return [...ids];
}

export async function syncOnce(root: RootStore, api: ChatApi) {
  runInAction(() => root.connectivity.setSyncing(true));
  try {
    for (const chatId of chatsToSync(root)) {
      const t = root.chat.thread(chatId);
      if (t.lastSeq === 0) {
        // Nothing local yet (no cache, never opened): take the latest page instead of replaying the whole history.
        const page = await api.getPage(chatId, null, PAGE_SIZE);
        runInAction(() => root.applyServerMessages(chatId, page.messages, { page: { hasMore: page.hasMore } }));
        continue;
      }
      const msgs = await api.sync(chatId, t.lastSeq);
      runInAction(() => { if (msgs.length) root.applyServerMessages(chatId, msgs); });
    }
  } catch {
    // Offline or a dropped response: the drainer stays blocked only while `syncing` is true, and the next
    // reconnect retries the whole pass.
  } finally {
    runInAction(() => root.connectivity.setSyncing(false));
  }
}

export function startSyncWorker(root: RootStore, api: ChatApi) {
  const dispose = reaction(() => root.connectivity.online, (online) => { if (online) void syncOnce(root, api); });
  // Cold start while already online: recover incoming messages before the drainer sends anything.
  if (root.connectivity.online) void syncOnce(root, api);
  return dispose;
}
