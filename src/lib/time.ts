const DAY = 86_400_000;

const startOfDay = (ts: number) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };

/** "Today" / "Yesterday" / "12 Sep" / "12 Sep 2025" — used by day separators in a thread. */
export function dayLabel(ts: number, now = Date.now()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: d.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' });
}

/** Clock time for a message bubble, locale aware ("5:40 pm" or "17:40"). */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

/** Compact stamp for list rows: time if today, "Yesterday", else short date. */
export function listTime(ts: number, now = Date.now()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diffDays === 0) return formatTime(ts);
  return dayLabel(ts, now);
}
