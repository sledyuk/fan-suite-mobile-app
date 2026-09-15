import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { AlertCircle, Gift, Trash2 } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { formatTime } from '@/lib/time';
import type { OutboxItem, ServerMessage } from '@/services/api/types';
import type { Participant } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';
import { StatusLine, hint } from './StatusLine';

type Props =
  | { kind: 'msg'; msg: ServerMessage; mine: boolean; peer: Participant }
  | { kind: 'outbox'; item: OutboxItem; onRetry: (id: string) => void; onDiscard: (id: string) => void };

/**
 * Geometry from the Figma frame (375pt): radius 16, padding 16/12, max width
 * 84%, incoming bubbles sit after a 32pt avatar with a 13pt gap, timestamp
 * lives inside the bubble bottom-left. Gift messages get a 48pt icon box.
 * Outbox bubbles are dimmed while unconfirmed. A failed one keeps its look, gets a
 * red "!" badge and a "Not delivered" caption; tap = retry (or subscribe), swipe
 * right = delete. Same pattern as iMessage / WhatsApp / Telegram.
 */
export function Bubble(props: Props) {
  const reduced = useReducedMotion();
  const entering = reduced ? undefined : FadeInDown.duration(180);

  if (props.kind === 'outbox') {
    const { item, onRetry, onDiscard } = props;
    const failed = item.status === 'failed';
    const err = item.error;
    const onTap = !failed ? undefined
      : err?.recoverable !== false ? () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRetry(item.clientId); }
      : err.code === 'PAYMENT_REQUIRED' ? () => router.push('/paywall')
      : undefined;
    const bubble = (
      <Animated.View entering={entering} style={[styles.row, styles.rowMine]}>
        {failed && (
          <View style={styles.badge} accessibilityElementsHidden>
            <AlertCircle size={18} color={colors.error} strokeWidth={2.25} />
          </View>
        )}
        <Pressable
          onPress={onTap}
          disabled={!onTap}
          accessibilityRole={onTap ? 'button' : undefined}
          accessibilityLabel={failed ? `Not delivered. ${item.text}. ${hint(item)}. Swipe right to delete.` : `Sending. ${item.text}`}
          style={({ pressed }) => [styles.bubble, styles.mine, !failed && styles.pending, pressed && onTap && styles.pressed]}
        >
          <AppText>{item.text}</AppText>
          <StatusLine item={item} />
        </Pressable>
      </Animated.View>
    );
    if (!failed) return bubble;
    return (
      <ReanimatedSwipeable
        friction={2}
        leftThreshold={40}
        overshootLeft={false}
        renderLeftActions={() => (
          <Pressable onPress={() => onDiscard(item.clientId)} accessibilityRole="button" accessibilityLabel="Delete message" style={styles.deleteAction}>
            <Trash2 size={20} color={colors.bg} strokeWidth={2} />
            <AppText variant="time" color={colors.bg} style={styles.deleteText}>Delete</AppText>
          </Pressable>
        )}
        onSwipeableOpen={(dir) => { if (dir === 'left') onDiscard(item.clientId); }}
      >
        {bubble}
      </ReanimatedSwipeable>
    );
  }

  const { msg, mine, peer } = props;
  return (
    <Animated.View entering={entering} style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      {!mine && <Avatar source={peer.avatar} name={peer.name} size={32} />}
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        {msg.kind === 'gift' ? (
          <View style={styles.giftRow}>
            <View style={styles.giftIcon}><Gift size={22} color={colors.gift} strokeWidth={1.75} /></View>
            <AppText style={styles.giftText}>{msg.text}</AppText>
          </View>
        ) : (
          <AppText>{msg.text}</AppText>
        )}
        <AppText variant="time" color={colors.textMuted} style={styles.time}>{formatTime(msg.createdAt)}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 13, marginBottom: spacing.xl },
  rowTheirs: { justifyContent: 'flex-start' },
  rowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '84%', borderRadius: radii.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  mine: { backgroundColor: colors.primaryTint },
  theirs: { backgroundColor: colors.bgIncoming },
  pending: { opacity: 0.7 },
  pressed: { backgroundColor: colors.primarySoft },
  badge: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  deleteAction: { width: 88, marginBottom: spacing.xl, borderRadius: radii.xl, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', gap: 2 },
  deleteText: { fontFamily: 'Inter_500Medium' },
  time: { marginTop: spacing.sm },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  giftIcon: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.bgSubtle, borderWidth: 1, borderColor: colors.gift, alignItems: 'center', justifyContent: 'center' },
  giftText: { flexShrink: 1 },
});
