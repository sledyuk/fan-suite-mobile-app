import * as Haptics from 'expo-haptics';
import { runInAction } from 'mobx';
import { useCallback } from 'react';
import { useStores } from '@/hooks/useStores';

export const MAX_LENGTH = 400;

/** Send = persist to the outbox and let the drainer do the rest. Retry = back to pending. */
export function useChatActions(chatId: string) {
  const root = useStores();

  const send = useCallback((text: string) => {
    const trimmed = text.trim().slice(0, MAX_LENGTH);
    if (!trimmed) return;
    runInAction(() => root.outbox.enqueue(chatId, trimmed));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [root, chatId]);

  const retry = useCallback((clientId: string) => runInAction(() => root.outbox.retry(clientId)), [root]);
  const discard = useCallback((clientId: string) => runInAction(() => root.outbox.remove(clientId)), [root]);

  return { send, retry, discard };
}
