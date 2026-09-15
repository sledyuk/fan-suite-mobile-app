import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassIconButton } from '@/components/GlassIconButton';
import { type Conversation } from '@/services/mock/conversations';
import { colors, spacing } from '@/theme/tokens';
import { ConversationRow } from './ConversationRow';
import { useConversations } from './useConversations';

const keyExtractor = (c: Conversation) => c.id;

export const openConversation = (id: string) => router.push({ pathname: '/chat/[chatId]', params: { chatId: id } });

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const { items, refreshing, refresh, actions } = useConversations();
  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<Conversation>) => <ConversationRow item={item} onPress={openConversation} actions={actions} />,
    [actions],
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Chats',
          headerRight: () => (
            <GlassIconButton accessibilityLabel="New message">
              <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
            </GlassIconButton>
          ),
        }}
      />
      <LegendList
        data={items}
        refreshing={refreshing}
        onRefresh={refresh}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={60}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
