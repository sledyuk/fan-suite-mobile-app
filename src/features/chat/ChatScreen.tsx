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

export function ChatScreen({ conversation }: Props) {
  // Temporary: in-memory 50k history per conversation seed. Replaced by the mock chat server next step.
  const source = useMemo(() => createInMemoryHistory(generateHistory(50_000, conversation.seed), 150), [conversation.seed]);
  const { rows, loadOlder, loadingOlder } = useThread(source);

  return (
    <View style={styles.screen}>
      <ChatHeader creator={conversation.creator} onBack={() => router.back()} />
      <MessageList rows={rows} loadingOlder={loadingOlder} onLoadOlder={loadOlder} creator={conversation.creator} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
