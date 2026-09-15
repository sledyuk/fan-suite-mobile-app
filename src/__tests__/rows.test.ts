import { buildRows, dayLabel } from '@/features/chat/rows';
import type { ServerMessage } from '@/services/api/types';

const NOW = new Date(2026, 8, 15, 12, 0, 0).getTime(); // local 15 Sep 2026 noon
const at = (dayOffset: number, hour = 9): number => {
  const d = new Date(NOW); d.setDate(d.getDate() + dayOffset); d.setHours(hour, 0, 0, 0); return d.getTime();
};
const msg = (seq: number, createdAt: number, authorId: 'fan' | 'creator' = 'fan'): ServerMessage =>
  ({ id: `m${seq}`, seq, authorId, text: 't', createdAt, kind: 'text' });

describe('buildRows', () => {
  it('inserts a separator when the calendar day changes and marks fan messages as mine', () => {
    const rows = buildRows([msg(1, at(-1)), msg(2, at(-1, 10), 'creator'), msg(3, at(0))], NOW);
    expect(rows.map((r) => r.type)).toEqual(['day', 'msg', 'msg', 'day', 'msg']);
    expect(rows[0]).toMatchObject({ label: 'Yesterday' });
    expect(rows[3]).toMatchObject({ label: 'Today' });
    expect(rows[1]).toMatchObject({ mine: true });
    expect(rows[2]).toMatchObject({ mine: false });
  });

  it('labels older days with a short date', () => {
    expect(dayLabel(at(-40), NOW)).toMatch(/Aug/);
  });
});
