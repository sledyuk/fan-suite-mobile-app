import { router } from 'expo-router';
import { AlertCircle, Clock } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { formatTime } from '@/lib/time';
import type { OutboxItem } from '@/services/api/types';
import { colors, spacing } from '@/theme/tokens';

interface Props {
  item: OutboxItem;
  onRetry: (clientId: string) => void;
  onDiscard: (clientId: string) => void;
}

/**
 * The line under an unconfirmed bubble. Pending/sending: clock + "Sending…".
 * Failed: the reason, then Retry for recoverable errors or the action that
 * would actually fix it (e.g. Subscribe) for the others. Text is never lost.
 */
export function StatusLine({ item, onRetry, onDiscard }: Props) {
  if (item.status !== 'failed') {
    return (
      <View style={styles.line} accessibilityLiveRegion="polite">
        <Clock size={12} color={colors.textMuted} strokeWidth={2} />
        <AppText variant="time" color={colors.textMuted}>Sending…</AppText>
      </View>
    );
  }
  const err = item.error!;
  return (
    <View style={styles.failed} accessibilityLiveRegion="assertive">
      <View style={styles.line}>
        <AlertCircle size={12} color={colors.error} strokeWidth={2} />
        <AppText variant="time" color={colors.error} style={styles.reason}>{err.message}</AppText>
        <AppText variant="time" color={colors.textMuted}> · {formatTime(item.createdAt)}</AppText>
      </View>
      <View style={styles.actions}>
        {err.recoverable ? (
          <Link label="Retry" onPress={() => onRetry(item.clientId)} />
        ) : err.code === 'PAYMENT_REQUIRED' ? (
          <Link label="Subscribe" onPress={() => router.push('/paywall')} />
        ) : null}
        <Link label="Delete" muted onPress={() => onDiscard(item.clientId)} />
      </View>
    </View>
  );
}

function Link({ label, onPress, muted }: { label: string; onPress: () => void; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      <AppText variant="time" color={muted ? colors.textMuted : colors.primary} style={styles.link}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  failed: { gap: spacing.xs },
  reason: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: spacing.lg },
  link: { fontFamily: 'Inter_500Medium' },
});
