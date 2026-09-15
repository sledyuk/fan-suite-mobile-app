import { dayLabel } from '@/lib/time';
import type { OutboxItem, ServerMessage } from '@/services/api/types';

/**
 * What the list renders. Confirmed messages and unconfirmed outbox items are
 * projected into one union so the list never touches store shapes.
 */
export type Row =
  | { key: string; type: 'day'; label: string }
  | { key: string; type: 'msg'; msg: ServerMessage; mine: boolean }
  | { key: string; type: 'outbox'; item: OutboxItem };

/** Oldest → newest: confirmed by server seq, then the outbox in local order. Day separators where the date changes. */
export function buildRows(messages: ReadonlyArray<ServerMessage>, outbox: ReadonlyArray<OutboxItem> = [], now = Date.now()): Row[] {
  const rows: Row[] = [];
  let lastDay = '';
  const separator = (ts: number, section: 'c' | 'q') => {
    const day = new Date(ts).toDateString();
    if (day !== lastDay) { rows.push({ key: `day_${section}_${day}`, type: 'day', label: dayLabel(ts, now) }); lastDay = day; }
  };
  for (const m of messages) {
    separator(m.createdAt, 'c');
    rows.push({ key: m.id, type: 'msg', msg: m, mine: m.authorId === 'creator' }); // the app user is the creator
  }
  const confirmed = new Set(messages.map((m) => m.clientId).filter(Boolean));
  for (const item of outbox) {
    if (confirmed.has(item.clientId)) continue;   // server already has it; the store reconciles shortly
    separator(item.createdAt, 'q');                // queued section: keys must not collide with the confirmed section
    rows.push({ key: item.clientId, type: 'outbox', item });
  }
  return rows;
}
