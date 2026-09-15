import { Redirect, useLocalSearchParams } from 'expo-router';
import FanDetailsScreen from '@/screens/fan-details';
import { findConversation } from '@/services/mock/conversations';

export default function FanDetailsRoute() {
  const { fanId } = useLocalSearchParams<{ fanId: string }>();
  const conversation = findConversation(fanId);
  if (!conversation) return <Redirect href="/chats" />;
  return <FanDetailsScreen conversation={conversation} />;
}
