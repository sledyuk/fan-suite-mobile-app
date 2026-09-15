import { reaction, runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import { SendError } from '@/services/api/types';
import type { RootStore } from '@/stores/RootStore';

const BACKOFF_MS = [500, 1500, 4000];

/**
 * Sends pending outbox items one at a time, in local order, while online and
 * not syncing. Network errors go back to pending (retry with backoff, then
 * failed-but-recoverable); typed server errors become failed with their reason.
 */
export async function drainOnce(root: RootStore, api: ChatApi): Promise<void> {
  const { outbox, chat, connectivity } = root;
  if (!connectivity.online || connectivity.syncing || outbox.sendingOne) return;
  const next = outbox.pending[0];
  if (!next) return;

  runInAction(() => outbox.markSending(next.clientId));
  try {
    const msg = await api.send({ chatId: next.chatId, clientId: next.clientId, text: next.text, createdAt: next.createdAt });
    runInAction(() => { chat.thread(next.chatId).upsert([msg]); outbox.remove(next.clientId); });
  } catch (e) {
    const err = e instanceof SendError ? e : new SendError('NETWORK', true, 'Network error');
    runInAction(() => {
      if (err.code !== 'NETWORK') { outbox.markFailed(next.clientId, { code: err.code, recoverable: err.recoverable, message: err.message }); return; }
      outbox.markPending(next.clientId);
      const attempts = outbox.items.find((i) => i.clientId === next.clientId)?.attempts ?? 1;
      if (!connectivity.online) return;                                   // wait for reconnect
      if (attempts >= BACKOFF_MS.length) outbox.markFailed(next.clientId, { code: 'NETWORK', recoverable: true, message: "Couldn't reach the server" });
      else setTimeout(() => void drainOnce(root, api), BACKOFF_MS[attempts - 1]);
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
