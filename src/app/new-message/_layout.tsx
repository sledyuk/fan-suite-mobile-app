import { Stack } from 'expo-router';

/** Modal-internal stack: recipient picker → separate-message composer. */
export default function NewMessageLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
