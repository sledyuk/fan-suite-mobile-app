import { reaction, runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import { SendError } from '@/services/api/types';
import type { RootStore } from '@/stores/RootStore';

const BACKOFF_MS = [500, 1500, 4000];

export async function drainOnce(root: RootStore, api: ChatApi): Promise<void> {
  const { outbox, connectivity } = root;
  if (!connectivity.online || connectivity.syncing || outbox.sendingOne) return;
  const blocked = new Set<string>();
  let next: typeof outbox.items[number] | undefined;
  for (const i of outbox.items) {
    if (i.status === 'failed') { blocked.add(i.chatId); continue; }
    if (i.status === 'pending' && !blocked.has(i.chatId)) { next = i; break; }
  }
  if (!next) return;

  runInAction(() => outbox.markSending(next.clientId));
  try {
    const msg = await api.send({ chatId: next.chatId, clientId: next.clientId, text: next.text, createdAt: next.createdAt, attachment: next.attachment });
    runInAction(() => { root.applyServerMessages(next.chatId, [msg]); outbox.items.some((i) => i.clientId === next.clientId) && outbox.remove(next.clientId); });
  } catch (e) {
    const err = e instanceof SendError ? e : new SendError('NETWORK', true, 'Network error');
    runInAction(() => {
      if (err.code !== 'NETWORK') { outbox.markFailed(next.clientId, { code: err.code, recoverable: err.recoverable, message: err.message }); return; }
      outbox.markPending(next.clientId);
      const attempts = outbox.items.find((i) => i.clientId === next.clientId)?.attempts ?? 1;
      if (!connectivity.online) return;
      if (attempts > BACKOFF_MS.length) outbox.markFailed(next.clientId, { code: 'NETWORK', recoverable: true, message: "Couldn't reach the server" });
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
