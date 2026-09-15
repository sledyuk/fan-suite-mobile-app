import { useCallback, useState } from 'react';
import { CONVERSATIONS, type Conversation } from '@/services/mock/conversations';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Owns the conversation list and its pull-to-refresh. Today it re-reads the
 * fixture after a simulated round trip; the sync step will swap the body for
 * a call to the mock chat server without changing this hook's shape.
 */
export function useConversations() {
  const [items, setItems] = useState<Conversation[]>(CONVERSATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await sleep(700);
      setItems([...CONVERSATIONS].sort((a, b) => b.last.at - a.last.at));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  return { items, refreshing, refresh };
}
