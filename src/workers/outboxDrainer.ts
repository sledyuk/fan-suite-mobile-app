import { reaction, runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import { SendError, type OutboxItem } from '@/services/api/types';
import type { RootStore } from '@/stores/RootStore';

export const BACKOFF_MS = [500, 1500, 4000];

/**
 * Picks the next item to send: the first pending item per chat, in local order, unless that chat is blocked by a
 * failed item or by one still waiting out its backoff. Returns the earliest deadline it skipped so the caller can
 * wake up again at the right time.
 */
function pickNext(items: OutboxItem[], now: number): { next?: OutboxItem; wakeAt?: number } {
  const blocked = new Set<string>();
  let wakeAt: number | undefined;
  for (const i of items) {
    if (blocked.has(i.chatId)) continue;
    if (i.status === 'failed') { blocked.add(i.chatId); continue; }
    if (i.status !== 'pending') continue;
    if (i.nextAttemptAt !== undefined && i.nextAttemptAt > now) {
      blocked.add(i.chatId);
      wakeAt = wakeAt === undefined ? i.nextAttemptAt : Math.min(wakeAt, i.nextAttemptAt);
      continue;
    }
    return { next: i };
  }
  return { wakeAt };
}

export async function drainOnce(root: RootStore, api: ChatApi): Promise<void> {
  const { outbox, connectivity } = root;
  if (!connectivity.online || connectivity.syncing || outbox.sendingOne) return;
  const { next, wakeAt } = pickNext(outbox.items, Date.now());
  if (!next) {
    if (wakeAt !== undefined) setTimeout(() => void drainOnce(root, api), Math.max(0, wakeAt - Date.now()));
    return;
  }

  runInAction(() => outbox.markSending(next.clientId));
  try {
    const msg = await api.send({ chatId: next.chatId, clientId: next.clientId, text: next.text, createdAt: next.createdAt, attachment: next.attachment });
    runInAction(() => { root.applyServerMessages(next.chatId, [msg]); outbox.items.some((i) => i.clientId === next.clientId) && outbox.remove(next.clientId); });
  } catch (e) {
    const err = e instanceof SendError ? e : new SendError('NETWORK', true, 'Network error');
    runInAction(() => {
      if (err.code !== 'NETWORK') { outbox.markFailed(next.clientId, { code: err.code, recoverable: err.recoverable, message: err.message }); return; }
      const attempts = outbox.items.find((i) => i.clientId === next.clientId)?.attempts ?? 1;
      if (!connectivity.online) { outbox.markPending(next.clientId); return; }
      if (attempts > BACKOFF_MS.length) { outbox.markFailed(next.clientId, { code: 'NETWORK', recoverable: true, message: "Couldn't reach the server" }); return; }
      const delay = BACKOFF_MS[attempts - 1]!;
      // The deadline lives on the item, so the reaction below (which fires on this very status change) cannot
      // retry early; the timer only wakes the drainer once the deadline has passed.
      outbox.markPending(next.clientId, Date.now() + delay);
      setTimeout(() => void drainOnce(root, api), delay);
    });
    return;
  }
  void drainOnce(root, api);
}

export function startOutboxDrainer(root: RootStore, api: ChatApi) {
  const dispose = reaction(
    () => [root.outbox.pending.length, root.outbox.sendingOne, root.connectivity.online, root.connectivity.syncing] as const,
    () => void drainOnce(root, api),
  );
  void drainOnce(root, api);
  return dispose;
}
