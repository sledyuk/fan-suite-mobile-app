import { memo } from 'react';
import { observer } from 'mobx-react-lite';
import type { Participant } from '@/services/mock/participants';
import { Bubble } from './Bubble';
import { DaySeparator } from './DaySeparator';
import type { Row } from './rows';

interface Props {
  row: Row;
  peer: Participant;
  onRetry: (clientId: string) => void;
  onDiscard: (clientId: string) => void;
}

export const MessageRow = memo(observer(function MessageRow({ row, peer, onRetry, onDiscard }: Props) {
  if (row.type === 'day') return <DaySeparator label={row.label} />;
  if (row.type === 'outbox') return <Bubble kind="outbox" item={row.item} onRetry={onRetry} onDiscard={onDiscard} />;
  return <Bubble kind="msg" msg={row.msg} mine={row.mine} peer={peer} />;
}));
