import { reaction, runInAction } from 'mobx';
import type { RootStore } from '@/stores/RootStore';

export const previewText = (text: string, kind?: string) => (kind === 'image' ? `📷 Photo${text ? ` · ${text}` : ''}` : kind === 'video' ? `🎬 Video${text ? ` · ${text}` : ''}` : text);

export function startListSync(root: RootStore) {
  const { demo, outbox, chat } = root;

  const stopOutbox = reaction(
    () => outbox.items.map((i) => `${i.chatId}:${i.clientId}:${i.status}`).join('|'),
    () => runInAction(() => {
      const byChat = new Map<string, typeof outbox.items[number]>();
      for (const i of outbox.items) byChat.set(i.chatId, i);
      for (const c of demo.conversations) {
        const item = byChat.get(c.id);
        if (item) demo.setLast(c.id, { text: previewText(item.text, item.attachment?.kind), from: 'creator', at: item.createdAt, status: item.status === 'failed' ? 'failed' : 'sending' });
        else if (c.last.from === 'creator' && (c.last.status === 'sending' || c.last.status === 'failed')) {
          const last = chat.thread(c.id).ordered.at(-1);
          if (last) demo.setLast(c.id, { text: previewText(last.text, last.attachment?.kind), from: last.authorId, at: last.createdAt, status: last.authorId === 'creator' ? 'delivered' : undefined });
        }
      }
    }),
  );

  const seen = new Map<string, number>();
  const stopThreads = reaction(
    () => [...chat.threads.entries()].map(([id, t]) => `${id}:${t.lastSeq}:${t.loaded}`).join('|'),
    () => runInAction(() => {
      for (const [id, t] of chat.threads) {
        if (!t.loaded) continue;
        const prev = seen.get(id);
        seen.set(id, t.lastSeq);
        if (prev === undefined || t.lastSeq <= prev) continue;
        const fresh = t.ordered.filter((m) => m.seq > prev);
        const last = fresh.at(-1)!;
        const incoming = fresh.filter((m) => m.authorId === 'fan').length;
        if (incoming && demo.activeChatId !== id) demo.bumpUnread(id, incoming);
        if (outbox.forChat(id).length) continue;
        demo.setLast(id, { text: previewText(last.text, last.attachment?.kind), from: last.authorId, at: last.createdAt, status: last.authorId === 'creator' ? 'delivered' : undefined });
      }
    }),
  );

  return () => { stopOutbox(); stopThreads(); };
}
