import { LegendList, type LegendListRef, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Participant } from '@/services/mock/participants';
import { colors, spacing } from '@/theme/tokens';
import { MessageRow } from './MessageRow';
import type { Row } from './rows';

interface Props {
  rows: Row[];
  peer: Participant;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: (clientId: string) => void;
  onDiscard: (clientId: string) => void;
}

const keyExtractor = (r: Row) => r.key;
const getItemType = (r: Row) => r.type;

/**
 * Not inverted: LegendList anchors content at the bottom (`alignItemsAtEnd`)
 * and keeps the viewport stable while older pages are prepended
 * (`maintainVisibleContentPosition`), which avoids the transform hacks an
 * inverted FlatList needs.
 */
export function MessageList({ rows, peer, loadingOlder, onLoadOlder, onRetry, onDiscard }: Props) {
  const reduced = useReducedMotion();
  const listRef = useRef<LegendListRef>(null);
  const last = rows.at(-1);
  const lastKey = last?.key;
  const lastIsMine = last?.type === 'outbox' || (last?.type === 'msg' && last.mine);
  // A send of ours always brings the thread to the bottom (standard chat UX), even if the user had scrolled up.
  useEffect(() => {
    if (lastIsMine) listRef.current?.scrollToEnd({ animated: !reduced });
  }, [lastKey, lastIsMine, reduced]);
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Row>) => <MessageRow row={item} peer={peer} onRetry={onRetry} onDiscard={onDiscard} />,
    [peer, onRetry, onDiscard],
  );

  return (
    <LegendList
      ref={listRef}
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      recycleItems
      alignItemsAtEnd
      initialScrollAtEnd
      maintainScrollAtEnd={{ animated: !reduced }}
      maintainVisibleContentPosition
      estimatedItemSize={88}
      onStartReached={onLoadOlder}
      onStartReachedThreshold={0.5}
      ListHeaderComponent={loadingOlder ? <Spinner /> : null}
      keyboardDismissMode="interactive"
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}

function Spinner() {
  return <View style={styles.spinner}><ActivityIndicator color={colors.textMuted} /></View>;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  spinner: { paddingVertical: spacing.md, alignItems: 'center' },
});
