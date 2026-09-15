import { Gift } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import type { ServerMessage } from '@/services/api/types';
import type { Participant } from '@/services/mock/creator';
import { colors, radii, spacing } from '@/theme/tokens';
import { formatTime } from './rows';

interface Props {
  msg: ServerMessage;
  mine: boolean;
  creator: Participant;
}

/**
 * Geometry from the Figma frame (375pt): radius 16, padding 16/12, max width
 * 84%, incoming bubbles sit after a 32pt avatar with a 13pt gap, timestamp
 * lives inside the bubble bottom-left. Gift messages get a 48pt icon box.
 */
export function Bubble({ msg, mine, creator }: Props) {
  const bg = mine ? colors.primaryTint : colors.bgIncoming;
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      {!mine && <Avatar source={creator.avatar} name={creator.name} size={32} />}
      <View style={[styles.bubble, { backgroundColor: bg }]}>
        {msg.kind === 'gift' ? (
          <View style={styles.giftRow}>
            <View style={styles.giftIcon}>
              <Gift size={22} color={colors.gift} strokeWidth={1.75} />
            </View>
            <AppText style={styles.giftText}>{msg.text}</AppText>
          </View>
        ) : (
          <AppText>{msg.text}</AppText>
        )}
        <AppText variant="time" color={colors.textMuted} style={styles.time}>
          {formatTime(msg.createdAt)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 13, marginBottom: spacing.xl },
  rowTheirs: { justifyContent: 'flex-start' },
  rowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '84%',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  time: { marginTop: spacing.sm },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  giftIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.gift,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftText: { flexShrink: 1 },
});
