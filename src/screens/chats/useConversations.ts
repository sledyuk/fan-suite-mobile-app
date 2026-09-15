import { useCallback, useMemo, useState } from 'react';
import { CONVERSATIONS, type Conversation } from '@/services/mock/conversations';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ConversationActions {
  toggleRead: (id: string) => void;
  togglePin: (id: string) => void;
  toggleMute: (id: string) => void;
}

/** Pinned first, then newest last message. */
const order = (list: Conversation[]) =>
  [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.last.at - a.last.at);

/**
 * Owns the conversation list, pull-to-refresh and row actions. Today it works
 * on the fixture in memory; the sync step will swap `refresh` for a call to the
 * mock chat server without changing this hook's shape.
 */
export function useConversations() {
  const [items, setItems] = useState<Conversation[]>(() => order(CONVERSATIONS));
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await sleep(700);
      setItems((prev) => order(prev));
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  const patch = useCallback((id: string, fn: (c: Conversation) => Partial<Conversation>) => {
    setItems((prev) => order(prev.map((c) => (c.id === id ? { ...c, ...fn(c) } : c))));
  }, []);

  const actions = useMemo<ConversationActions>(() => ({
    // Mark read clears the count; mark unread on a read fan message sets 1 (creator-sent rows stay 0).
    toggleRead: (id) => patch(id, (c) => ({ unreadCount: c.unreadCount > 0 ? 0 : c.last.from === 'fan' ? 1 : 0 })),
    togglePin: (id) => patch(id, (c) => ({ pinned: !c.pinned })),
    toggleMute: (id) => patch(id, (c) => ({ muted: !c.muted })),
  }), [patch]);

  return { items, refreshing, refresh, actions };
}
