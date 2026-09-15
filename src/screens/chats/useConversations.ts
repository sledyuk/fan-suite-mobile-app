import { runInAction } from 'mobx';
import { useCallback, useMemo, useState } from 'react';
import { useStores } from '@/hooks/useStores';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ConversationActions {
  toggleRead: (id: string) => void;
  togglePin: (id: string) => void;
  toggleMute: (id: string) => void;
}

export function useConversations() {
  const { demo } = useStores();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try { await sleep(700); } finally { setRefreshing(false); }
  }, [refreshing]);

  const actions = useMemo<ConversationActions>(() => ({
    toggleRead: (id) => runInAction(() => demo.toggleRead(id)),
    togglePin: (id) => runInAction(() => demo.togglePin(id)),
    toggleMute: (id) => runInAction(() => demo.toggleMute(id)),
  }), [demo]);

  return { items: demo.ordered, seeded: demo.seeded, refreshing, refresh, actions };
}
