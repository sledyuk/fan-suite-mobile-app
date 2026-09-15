import { reaction, runInAction } from 'mobx';
import type { RootStore } from '@/stores/RootStore';

/**
 * Keeps each conversation row in step with its thread:
 * - our unconfirmed sends show as "sending" / "failed" with their text,
 * - once confirmed, the row shows the server's last message ("delivered" when ours),
 * - incoming fan messages update the preview and bump unread unless the thread is open.
 */
export function startListSync(root: RootStore) {
  const { demo, outbox, chat } = root;

  // Outbox → row: latest unconfirmed item per chat wins.
  const stopOutbox = reaction(
    () => outbox.items.map((i) => `${i.chatId}:${i.clientId}:${i.status}`).join('|'),
    () => runInAction(() => {
      const byChat = new Map<string, typeof outbox.items[number]>();
      for (const i of outbox.items) byChat.set(i.chatId, i);            // last one in local order
      for (const c of demo.conversations) {
        const item = byChat.get(c.id);
        if (item) demo.setLast(c.id, { text: item.text, from: 'creator', at: item.createdAt, status: item.status === 'failed' ? 'failed' : 'sending' });
        else if (c.last.from === 'creator' && c.last.status === 'sending') {
          const last = chat.thread(c.id).ordered.at(-1);               // just confirmed
          if (last) demo.setLast(c.id, { text: last.text, from: last.authorId, at: last.createdAt, status: last.authorId === 'creator' ? 'delivered' : undefined });
        }
      }
    }),
  );

  // Thread → row: newest confirmed message per loaded thread.
  const seen = new Map<string, number>();                                // chatId → lastSeq we projected
  const stopThreads = reaction(
    () => [...chat.threads.entries()].map(([id, t]) => `${id}:${t.lastSeq}:${t.loaded}`).join('|'),
    () => runInAction(() => {
      for (const [id, t] of chat.threads) {
        if (!t.loaded) continue;
        const prev = seen.get(id);
        seen.set(id, t.lastSeq);
        if (prev === undefined || t.lastSeq <= prev) continue;           // first load or nothing new
        const fresh = t.ordered.filter((m) => m.seq > prev);
        const last = fresh.at(-1)!;
        if (outbox.forChat(id).length) continue;                         // outbox projection takes precedence
        demo.setLast(id, { text: last.text, from: last.authorId, at: last.createdAt, status: last.authorId === 'creator' ? 'delivered' : undefined });
        const incoming = fresh.filter((m) => m.authorId === 'fan').length;
        if (incoming && demo.activeChatId !== id) demo.bumpUnread(id, incoming);
      }
    }),
  );

  return () => { stopOutbox(); stopThreads(); };
}
