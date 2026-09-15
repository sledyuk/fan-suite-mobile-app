import { Stack } from 'expo-router';
import { colors, fonts } from '@/theme/tokens';

/** Native (Liquid Glass on iOS 26) header for the Chats list. The thread itself lives in the root stack. */
export default function ChatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.textHeading },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    />
  );
}
