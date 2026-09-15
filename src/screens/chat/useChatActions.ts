import * as Haptics from 'expo-haptics';
import { runInAction } from 'mobx';
import { useCallback } from 'react';
import { useStores } from '@/hooks/useStores';
import type { Attachment } from '@/services/api/types';

export const MAX_LENGTH = 400;

export function useChatActions(chatId: string) {
  const root = useStores();

  const send = useCallback((text: string, attachment?: Attachment) => {
    const trimmed = text.trim().slice(0, MAX_LENGTH);
    if (!trimmed && !attachment) return;
    runInAction(() => root.outbox.enqueue(chatId, trimmed, { attachment }));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [root, chatId]);

  const retry = useCallback((clientId: string) => runInAction(() => root.outbox.retry(clientId)), [root]);
  const discard = useCallback((clientId: string) => runInAction(() => root.outbox.remove(clientId)), [root]);

  return { send, retry, discard };
}
