import { Clock } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import type { OutboxItem } from '@/services/api/types';
import { colors, spacing } from '@/theme/tokens';

/**
 * Caption under an unconfirmed bubble. Pending: clock + "Sending…".
 * Failed: "Not delivered" plus what the user can do, in the iMessage /
 * WhatsApp style. The actions themselves are a tap (retry / subscribe) and a
 * swipe right (delete) on the bubble, see Bubble.
 */
export function StatusLine({ item }: { item: OutboxItem }) {
  if (item.status !== 'failed') {
    return (
      <View style={styles.line} accessibilityLiveRegion="polite">
        <Clock size={12} color={colors.textMuted} strokeWidth={2} />
        <AppText variant="time" color={colors.textMuted}>Sending…</AppText>
      </View>
    );
  }
  return (
    <View style={styles.line} accessibilityLiveRegion="assertive">
      <AppText variant="time" color={colors.error} style={styles.bold}>Not delivered</AppText>
      <AppText variant="time" color={colors.textMuted}> · {hint(item)}</AppText>
    </View>
  );
}

export function hint(item: OutboxItem): string {
  const err = item.error;
  if (!err) return 'Tap to retry';
  if (err.recoverable) return 'Tap to retry';
  if (err.code === 'PAYMENT_REQUIRED') return 'Tap to subscribe';
  return err.message;
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  bold: { fontFamily: 'Inter_500Medium' },
});
