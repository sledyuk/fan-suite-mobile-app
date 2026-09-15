import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { Stack } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { openConversation } from '@/screens/chats/ChatListScreen';
import { ConversationRow } from '@/screens/chats/ConversationRow';
import { useConversations } from '@/screens/chats/useConversations';
import { type Conversation } from '@/services/mock/conversations';
import { colors, spacing } from '@/theme/tokens';

const keyExtractor = (c: Conversation) => c.id;

/** Search tab: native header search bar (iOS 26 shows it in the split tab-bar search button). */
const SearchScreen = observer(function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { items, actions } = useConversations();

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.fan.name.toLowerCase().includes(q) || c.fan.handle.toLowerCase().includes(q) || c.last.text.toLowerCase().includes(q));
  }, [query, items]);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Conversation>) => <ConversationRow item={item} onPress={openConversation} actions={actions} />,
    [actions],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Search',
          headerSearchBarOptions: { placeholder: 'Search conversations', autoCapitalize: 'none', hideWhenScrolling: false, onChangeText: (e) => setQuery(e.nativeEvent.text) },
        }}
      />
      <LegendList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={60}
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.lg }}
        ListEmptyComponent={
          <AppText variant="caption" color={colors.textMuted} style={styles.empty}>
            {items.length === 0 ? 'Nothing to search yet.' : `No conversations match “${query}”.`}
          </AppText>
        }
      />
    </View>
  );
});

export default SearchScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { textAlign: 'center', paddingTop: spacing.xxl },
});
