import { router } from 'expo-router';
import { Bug } from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import { GlassIconButton } from './GlassIconButton';

/** Opens the debug sheet. Present on every tab header so the mock is reachable from anywhere. */
export function DebugButton({ chatId }: { chatId?: string }) {
  return (
    <GlassIconButton accessibilityLabel="Debug controls" onPress={() => router.push({ pathname: '/dev', params: chatId ? { chatId } : {} })}>
      <Bug size={18} color={colors.textPrimary} strokeWidth={2} />
    </GlassIconButton>
  );
}
