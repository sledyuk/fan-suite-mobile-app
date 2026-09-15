import { router, usePathname } from 'expo-router';
import { Bug } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@/hooks/useStores';
import { colors } from '@/theme/tokens';
import { GlassIconButton } from './GlassIconButton';

/**
 * Floating debug button, shown on every screen while More → Developer mode is on.
 * Passes the open thread's id to the debug sheet so per-thread actions work.
 */
export const DebugFab = observer(function DebugFab() {
  const { settings } = useStores();
  const insets = useSafeAreaInsets();
  const path = usePathname();
  if (!settings.developerMode) return null;
  const chatId = path.startsWith('/chat/') ? path.slice('/chat/'.length) : undefined;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 200 }]}>
      <GlassIconButton size={44} accessibilityLabel="Debug controls" onPress={() => router.push({ pathname: '/dev', params: chatId ? { chatId } : {} })}>
        <Bug size={20} color={colors.textPrimary} strokeWidth={2} />
      </GlassIconButton>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 12 },
});
