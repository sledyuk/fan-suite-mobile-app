import { memo } from 'react';
import { Bubble } from './Bubble';
import { DaySeparator } from './DaySeparator';
import type { Participant } from '@/services/mock/creator';
import type { Row } from './rows';

/**
 * Memoised on purpose: with recycling on, the list hands the same component a
 * new `row`; keeping props to a single stable object makes the memo cheap.
 */
export const MessageRow = memo(function MessageRow({ row, creator }: { row: Row; creator: Participant }) {
  if (row.type === 'day') return <DaySeparator label={row.label} />;
  return <Bubble msg={row.msg} mine={row.mine} creator={creator} />;
});
