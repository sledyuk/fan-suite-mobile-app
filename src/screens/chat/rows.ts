import { dayLabel } from '@/lib/time';
import type { ServerMessage } from '@/services/api/types';

/**
 * What the list renders. Confirmed messages and (later) outbox items are
 * both projected into this union so the list never touches store shapes.
 */
export type Row =
  | { key: string; type: 'day'; label: string }
  | { key: string; type: 'msg'; msg: ServerMessage; mine: boolean };

/** Oldest → newest, with a day separator whenever the calendar date changes. */
export function buildRows(messages: ReadonlyArray<ServerMessage>, now = Date.now()): Row[] {
  const rows: Row[] = [];
  let lastDay = '';
  for (const m of messages) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDay) {
      rows.push({ key: `day_${day}`, type: 'day', label: dayLabel(m.createdAt, now) });
      lastDay = day;
    }
    rows.push({ key: m.id, type: 'msg', msg: m, mine: m.authorId === 'creator' }); // the app user is the creator
  }
  return rows;
}
