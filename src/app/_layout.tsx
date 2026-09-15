import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DebugFab } from '@/components/DebugButton';
import { StoresProvider } from '@/hooks/useStores';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoresProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/[chatId]" />
          <Stack.Screen name="fan/[fanId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="new-message" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="about" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.75, 1], sheetInitialDetentIndex: 0 }} />
          <Stack.Screen name="dev" options={{ presentation: 'modal' }} />
        </Stack>
        <DebugFab />
        </StoresProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
