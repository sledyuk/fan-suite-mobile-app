import { Stack } from 'expo-router';
import { colors, fonts } from '@/theme/tokens';

/** Native (Liquid Glass on iOS 26) header, same options as the Chats tab. */
export default function TabStackLayout() {
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
