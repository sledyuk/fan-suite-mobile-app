import { Gift } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { formatTime } from '@/lib/time';
import type { OutboxItem, ServerMessage } from '@/services/api/types';
import type { Participant } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';
import { StatusLine } from './StatusLine';

type Props =
  | { kind: 'msg'; msg: ServerMessage; mine: boolean; peer: Participant }
  | { kind: 'outbox'; item: OutboxItem; onRetry: (id: string) => void; onDiscard: (id: string) => void };

/**
 * Geometry from the Figma frame (375pt): radius 16, padding 16/12, max width
 * 84%, incoming bubbles sit after a 32pt avatar with a 13pt gap, timestamp
 * lives inside the bubble bottom-left. Gift messages get a 48pt icon box.
 * Outbox bubbles are dimmed while unconfirmed and outlined in red when failed.
 */
export function Bubble(props: Props) {
  const reduced = useReducedMotion();
  const entering = reduced ? undefined : FadeInDown.duration(180);

  if (props.kind === 'outbox') {
    const { item } = props;
    const failed = item.status === 'failed';
    return (
      <Animated.View entering={entering} style={[styles.row, styles.rowMine]}>
        <View style={[styles.bubble, styles.mine, !failed && styles.pending, failed && styles.failed]}>
          <AppText>{item.text}</AppText>
          <StatusLine item={item} onRetry={props.onRetry} onDiscard={props.onDiscard} />
        </View>
      </Animated.View>
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
  failed: { borderWidth: 1, borderColor: colors.error, backgroundColor: colors.errorSoft },
  time: { marginTop: spacing.sm },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  giftIcon: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.bgSubtle, borderWidth: 1, borderColor: colors.gift, alignItems: 'center', justifyContent: 'center' },
  giftText: { flexShrink: 1 },
});
