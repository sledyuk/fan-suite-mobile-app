import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoresProvider } from '@/hooks/useStores';

void SplashScreen.preventAutoHideAsync();

/**
 * Anchor the root stack on the tab group: a deep link or dev reload straight
 * into /chat/[id] still mounts the tabs underneath, so Back has somewhere to go.
 */
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
          {/* Thread lives outside the tab group so the tab bar is not shown over a conversation. */}
          <Stack.Screen name="chat/[chatId]" />
          {/* Native iOS page sheet (UIKit modal presentation) for the fan profile. */}
          <Stack.Screen name="fan/[fanId]" options={{ presentation: 'modal' }} />
          {/* New message: a modal with its own stack (picker → broadcast). */}
          <Stack.Screen name="new-message" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="hire" options={{ presentation: 'modal' }} />
          {/* Debug controls: fault injection + reset. Page sheet like the others (formSheet overlapped the header on iOS 26). */}
          <Stack.Screen name="dev" options={{ presentation: 'modal' }} />
        </Stack>
        </StoresProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
