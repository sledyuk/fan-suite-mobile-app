import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { Stack, router } from 'expo-router';
import { MessageCircle, Plus } from '@/components/icons';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GlassIconButton } from '@/components/GlassIconButton';
import { type Conversation } from '@/services/mock/conversations';
import { colors, spacing } from '@/theme/tokens';
import { ConversationRow } from './ConversationRow';
import { useConversations } from './useConversations';

const keyExtractor = (c: Conversation) => c.id;

export const openConversation = (id: string) => router.push({ pathname: '/chat/[chatId]', params: { chatId: id } });

const ChatListScreen = observer(function ChatListScreen() {
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
          title: 'Messages',
          headerRight: () => (
            <GlassIconButton accessibilityLabel="New message" onPress={() => router.push('/new-message')}>
              <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
            </GlassIconButton>
          ),
        }}
      />
      <LegendList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={60}
        refreshing={refreshing}
        onRefresh={refresh}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.lg }}
        ListEmptyComponent={
          <EmptyState icon={MessageCircle} title="No messages yet" body="When fans message you, their conversations show up here. Pull down to refresh." />
        }
      />
    </View>
  );
});

export default ChatListScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
