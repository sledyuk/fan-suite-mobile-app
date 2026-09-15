import { Redirect, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import ChatScreen from '@/screens/chat';

const ChatRoute = observer(function ChatRoute() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const conversation = useStores().demo.find(chatId);
  if (!conversation) return <Redirect href="/chats" />;
  return <ChatScreen conversation={conversation} />;
});

export default ChatRoute;
