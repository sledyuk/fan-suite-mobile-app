import { router } from 'expo-router';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStores } from '@/hooks/useStores';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import type { Conversation } from '@/services/mock/conversations';
import { colors } from '@/theme/tokens';
import { Banner } from './Banner';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ThreadComposer } from './ThreadComposer';
import { useChatActions } from './useChatActions';
import { useThread } from './useThread';

interface Props {
  conversation: Conversation;
}

const ChatScreen = observer(function ChatScreen({ conversation }: Props) {
  const { demo } = useStores();
  const { rows, loadOlder, loadingOlder } = useThread(conversation.id);
  // While open, this thread is "read": clears the badge now and keeps new incoming read.
  useEffect(() => {
    runInAction(() => demo.setActiveChat(conversation.id));
    return () => runInAction(() => demo.setActiveChat(null));
  }, [demo, conversation.id]);
  const { send, retry, discard } = useChatActions(conversation.id);
  // Back falls through to the list when the thread was opened without history (push notification, reload).
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/chats'));
  const openDetails = () => router.push({ pathname: '/fan/[fanId]', params: { fanId: conversation.id } });

  return (
    <View style={styles.screen}>
      <ChatHeader peer={conversation.fan} online={conversation.online} onBack={goBack} onDetails={openDetails} />
      <Banner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <MessageList rows={rows} peer={conversation.fan} loadingOlder={loadingOlder} onLoadOlder={loadOlder} onRetry={retry} onDiscard={discard} />
        <ThreadComposer onSend={send} />
      </KeyboardAvoidingView>
    </View>
  );
});

export default ChatScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
});
