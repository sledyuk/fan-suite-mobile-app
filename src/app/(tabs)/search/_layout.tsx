import { Stack } from 'expo-router';
import { colors, fonts } from '@/theme/tokens';

export default function SearchLayout() {
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
