import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import type { Participant } from '@/services/mock/creator';
import { useCallback } from 'react';
import { MessageRow } from './MessageRow';
import type { Row } from './rows';

interface Props {
  rows: Row[];
  creator: Participant;
  loadingOlder: boolean;
  onLoadOlder: () => void;
}

const keyExtractor = (r: Row) => r.key;
const getItemType = (r: Row) => r.type;

/**
 * Not inverted: LegendList anchors content at the bottom (`alignItemsAtEnd`)
 * and keeps the viewport stable while older pages are prepended
 * (`maintainVisibleContentPosition`), which avoids the transform hacks an
 * inverted FlatList needs.
 */
export function MessageList({ rows, loadingOlder, onLoadOlder, creator }: Props) {
  const insets = useSafeAreaInsets();
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Row>) => <MessageRow row={item} creator={creator} />,
    [creator],
  );
  return (
    <LegendList
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      recycleItems
      alignItemsAtEnd
      initialScrollAtEnd
      maintainScrollAtEnd
      maintainVisibleContentPosition
      estimatedItemSize={88}
      onStartReached={onLoadOlder}
      onStartReachedThreshold={0.5}
      ListHeaderComponent={loadingOlder ? <Spinner /> : null}
      keyboardDismissMode="interactive"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.sm }]}
      style={styles.list}
    />
  );
}

function Spinner() {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  spinner: { paddingVertical: spacing.md, alignItems: 'center' },
});
