import { runInAction } from 'mobx';
import { useCallback, useEffect, useMemo } from 'react';
import { useStores } from '@/hooks/useStores';
import { container } from '@/services/container';
import { syncOnce } from '@/workers/syncWorker';
import { buildRows } from './rows';

export const PAGE_SIZE = 50;

export function useThread(chatId: string) {
  const root = useStores();
  const thread = root.chat.thread(chatId);
  const api = container.chatApi;

  const loadPage = useCallback(async (beforeSeq: number | null) => {
    if (thread.loadingOlder) return;
    runInAction(() => thread.setLoadingOlder(true));
    try {
      const page = await api.getPage(chatId, beforeSeq, PAGE_SIZE);
      runInAction(() => root.applyServerMessages(chatId, page.messages, { page: { hasMore: page.hasMore } }));
    } catch {
      runInAction(() => thread.setLoadingOlder(false));
    }
  }, [api, chatId, thread]);

  useEffect(() => {
    if (thread.loaded) { if (root.connectivity.online) void syncOnce(root, api); return; }
    void loadPage(null);
  }, [thread, loadPage, root, api]);

  const loadOlder = useCallback(() => {
    if (!thread.hasMore || thread.oldestLoadedSeq === null) return;
    void loadPage(thread.oldestLoadedSeq);
  }, [thread, loadPage]);

  const ordered = thread.ordered;
  const outbox = root.outbox.forChat(chatId);
  const rows = useMemo(() => buildRows(ordered, outbox), [ordered, outbox]);

  return { rows, loadOlder, loadingOlder: thread.loadingOlder, loaded: thread.loaded };
}
