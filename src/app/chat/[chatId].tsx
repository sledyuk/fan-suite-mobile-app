import { Redirect, useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/features/chat';
import { findConversation } from '@/services/mock/conversations';

export default function ChatRoute() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const conversation = findConversation(chatId);
  if (!conversation) return <Redirect href="/chats" />;
  return <ChatScreen conversation={conversation} />;
}
