import type { ServerMessage } from '@/services/api/types';

/**
 * What the list renders. Confirmed messages and (later) outbox items are
 * both projected into this union so the list never touches store shapes.
 */
export type Row =
  | { key: string; type: 'day'; label: string }
  | { key: string; type: 'msg'; msg: ServerMessage; mine: boolean };

const DAY = 86_400_000;

export function dayLabel(ts: number, now = Date.now()): string {
  const d = new Date(ts);
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((startOfToday.getTime() - new Date(d).setHours(0, 0, 0, 0)) / DAY);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

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
    rows.push({ key: m.id, type: 'msg', msg: m, mine: m.authorId === 'fan' });
  }
  return rows;
}
