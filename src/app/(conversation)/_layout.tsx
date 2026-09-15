import { Stack } from "expo-router";

/** EXPERIMENT: chat + fan sheet in their own stack. */
export default function ConversationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat/[chatId]" />
      <Stack.Screen name="fan/[fanId]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
