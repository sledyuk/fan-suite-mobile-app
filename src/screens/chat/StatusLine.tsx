import { router } from 'expo-router';
import { AlertCircle, Clock, RotateCcw, Sparkles, Trash2, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { formatTime } from '@/lib/time';
import type { OutboxItem } from '@/services/api/types';
import { colors, radii, spacing } from '@/theme/tokens';

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
          <ActionButton label="Retry" icon={RotateCcw} primary onPress={() => onRetry(item.clientId)} />
        ) : err.code === 'PAYMENT_REQUIRED' ? (
          <ActionButton label="Subscribe" icon={Sparkles} primary onPress={() => router.push('/paywall')} />
        ) : null}
        <ActionButton label="Delete" icon={Trash2} onPress={() => onDiscard(item.clientId)} />
      </View>
    </View>
  );
}

/** 32pt pill with a 44pt hit target: big enough to tap on a failed bubble without hitting the text. */
function ActionButton({ label, icon: Icon, onPress, primary }: { label: string; icon: LucideIcon; onPress: () => void; primary?: boolean }) {
  const fg = primary ? colors.primary : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      style={({ pressed }) => [styles.action, primary ? styles.actionPrimary : styles.actionNeutral, pressed && { opacity: 0.7 }]}
    >
      <Icon size={14} color={fg} strokeWidth={2.25} />
      <AppText variant="caption" color={fg} style={styles.actionText}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  failed: { gap: spacing.xs },
  reason: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: { height: 32, paddingHorizontal: spacing.md, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionPrimary: { backgroundColor: colors.primarySoft },
  actionNeutral: { backgroundColor: colors.bgSubtle, borderWidth: 1, borderColor: colors.border },
  actionText: { fontFamily: 'Inter_500Medium' },
});
