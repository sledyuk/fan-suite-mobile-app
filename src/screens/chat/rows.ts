import { dayLabel } from '@/lib/time';
import type { OutboxItem, ServerMessage } from '@/services/api/types';

export type Row =
  | { key: string; type: 'day'; label: string }
  | { key: string; type: 'msg'; msg: ServerMessage; mine: boolean }
  | { key: string; type: 'outbox'; item: OutboxItem };

export function buildRows(messages: ReadonlyArray<ServerMessage>, outbox: ReadonlyArray<OutboxItem> = [], now = Date.now()): Row[] {
  const rows: Row[] = [];
  let lastDay = '';
  const separator = (ts: number, section: 'c' | 'q') => {
    const day = new Date(ts).toDateString();
    if (day !== lastDay) { rows.push({ key: `day_${section}_${day}`, type: 'day', label: dayLabel(ts, now) }); lastDay = day; }
  };
  for (const m of messages) {
    separator(m.createdAt, 'c');
    rows.push({ key: m.id, type: 'msg', msg: m, mine: m.authorId === 'creator' });
  }
  const confirmed = new Set(messages.map((m) => m.clientId).filter(Boolean));
  for (const item of outbox) {
    if (confirmed.has(item.clientId)) continue;
    separator(item.createdAt, 'q');
    rows.push({ key: item.clientId, type: 'outbox', item });
  }
  return rows;
}
