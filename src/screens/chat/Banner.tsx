import { RefreshCw, WifiOff } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { AppText } from '@/components/AppText';
import { useStores } from '@/hooks/useStores';
import { colors, spacing } from '@/theme/tokens';

/** Connectivity strip under the header: offline (amber) or syncing (primary). Nothing when all is well. */
export const Banner = observer(function Banner() {
  const { connectivity } = useStores();
  const reduced = useReducedMotion();
  if (connectivity.online && !connectivity.syncing) return null;
  const offline = !connectivity.online;
  return (
    <Animated.View
      entering={reduced ? undefined : FadeIn.duration(150)}
      exiting={reduced ? undefined : FadeOut.duration(150)}
      style={[styles.strip, { backgroundColor: offline ? colors.warningBg : colors.primarySoft }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {offline ? <WifiOff size={14} color={colors.warningText} strokeWidth={2} /> : <ActivityIndicator size="small" color={colors.primary} />}
      <AppText variant="caption" color={offline ? colors.warningText : colors.primary} style={styles.text}>
        {offline ? "You're offline. Messages will send when you're back." : 'Catching up…'}
      </AppText>
      {!offline && <RefreshCw size={0} />}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  text: { flex: 1, fontFamily: 'Inter_500Medium' },
});
