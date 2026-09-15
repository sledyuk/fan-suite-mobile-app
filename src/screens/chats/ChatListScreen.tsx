import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { CONVERSATIONS, type Conversation } from '@/services/mock/conversations';
import { colors, spacing } from '@/theme/tokens';
import { ConversationRow } from './ConversationRow';
import { SearchBar } from './SearchBar';

const keyExtractor = (c: Conversation) => c.id;

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONVERSATIONS;
    return CONVERSATIONS.filter((c) => c.creator.name.toLowerCase().includes(q) || c.creator.handle.toLowerCase().includes(q));
  }, [query]);

  const open = useCallback((id: string) => router.push({ pathname: '/chat/[chatId]', params: { chatId: id } }), []);
  const renderItem = useCallback(({ item }: LegendListRenderItemProps<Conversation>) => <ConversationRow item={item} onPress={open} />, [open]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.titleRow}>
        <AppText variant="title" color={colors.textHeading}>Chats</AppText>
      </View>
      <SearchBar value={query} onChange={setQuery} />
      <LegendList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={60}
        recycleItems
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        ListEmptyComponent={<AppText variant="caption" color={colors.textMuted} style={styles.empty}>No conversations match “{query}”.</AppText>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  titleRow: { height: 48, justifyContent: 'center', paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  empty: { textAlign: 'center', paddingTop: spacing.xxl },
});
