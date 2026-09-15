import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Conversation } from '@/services/mock/conversations';
import { generateHistory } from '@/services/mock/historyGenerator';
import { createInMemoryHistory } from '@/services/mock/historySource';
import { colors } from '@/theme/tokens';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { useThread } from './useThread';

interface Props {
  conversation: Conversation;
}

export default function ChatScreen({ conversation }: Props) {
  // Temporary: in-memory 50k history per conversation seed. Replaced by the mock chat server next step.
  const source = useMemo(() => createInMemoryHistory(generateHistory(50_000, conversation.seed), 150), [conversation.seed]);
  const { rows, loadOlder, loadingOlder } = useThread(source);
  // Back falls through to the list when the thread was opened without history (push notification, reload).
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/chats'));
  const openDetails = () => router.push({ pathname: '/fan/[fanId]', params: { fanId: conversation.id } });

  return (
    <View style={styles.screen}>
      <ChatHeader peer={conversation.fan} online={conversation.online} onBack={goBack} onDetails={openDetails} />
      <MessageList rows={rows} loadingOlder={loadingOlder} onLoadOlder={loadOlder} peer={conversation.fan} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
