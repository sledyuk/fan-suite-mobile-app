import { Stack } from 'expo-router';

/** Chats tab owns a stack: list → thread, so the thread gets a native push and a real back. */
export default function ChatsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
