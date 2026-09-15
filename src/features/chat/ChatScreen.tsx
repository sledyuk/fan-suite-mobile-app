import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { generateHistory } from '@/services/mock/historyGenerator';
import { createInMemoryHistory } from '@/services/mock/historySource';
import { colors } from '@/theme/tokens';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { useThread } from './useThread';

export function ChatScreen() {
  // Temporary: in-memory 50k history. Replaced by the mock chat server next step.
  const source = useMemo(() => createInMemoryHistory(generateHistory(50_000), 150), []);
  const { rows, loadOlder, loadingOlder } = useThread(source);

  return (
    <View style={styles.screen}>
      <ChatHeader />
      <MessageList rows={rows} loadingOlder={loadingOlder} onLoadOlder={loadOlder} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
