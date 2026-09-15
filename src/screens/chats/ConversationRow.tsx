import { AlertCircle, Check, Clock } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { listTime } from '@/lib/time';
import { FIXTURE_NOW, type Conversation } from '@/services/mock/conversations';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  item: Conversation;
  onPress: (id: string) => void;
}

const ICON = 16;

/**
 * 60pt row. Left: 40pt avatar with presence. Middle: name + handle, preview.
 * Right column: time on top, exactly one status mark below —
 * fan's unread count, or for our own last message: sending / delivered / seen (fan avatar) / failed.
 * Spec: docs/context/07-chat-row-states (artifact "Chat Row States").
 */
export const ConversationRow = memo(function ConversationRow({ item, onPress }: Props) {
  const { last, fan, unreadCount, online } = item;
  const mine = last.from === 'creator';
  const unread = !mine && unreadCount > 0;
  const failed = mine && last.status === 'failed';
  const stamp = mine && last.status === 'sending' ? 'now' : listTime(last.at, FIXTURE_NOW);

  const preview = failed ? `Not sent · ${last.text}` : mine ? `You: ${last.text}` : last.text;
  const previewColor = failed ? colors.error : unread ? colors.textSecondary : colors.textMuted;

  const a11y = [
    `Chat with ${fan.name}`,
    online ? 'online' : 'offline',
    unread ? `${unreadCount} unread` : mine ? `your message ${last.status}` : 'read',
    stamp,
  ].join(', ');

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar source={fan.avatar} name={fan.name} size={40} online={online} />

      <View style={styles.body}>
        <View style={styles.nameLine}>
          <AppText variant="name" numberOfLines={1} style={styles.nameText}>
            {fan.name} <AppText variant="name" color={colors.primary}>{fan.handle}</AppText>
          </AppText>
        </View>
        <AppText variant="caption" color={previewColor} numberOfLines={1} style={unread && styles.previewUnread}>
          {preview}
        </AppText>
      </View>

      <View style={styles.right}>
        <AppText variant="time" color={unread ? colors.primary : colors.textMuted} style={[styles.time, unread && styles.timeHot]}>
          {stamp}
        </AppText>
        <View style={styles.mark}>
          {unread && (
            <View style={styles.badge} accessibilityElementsHidden>
              <AppText variant="time" color={colors.bg} style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</AppText>
            </View>
          )}
          {mine && last.status === 'seen' && <Avatar source={fan.avatar} name={fan.name} size={18} />}
          {mine && last.status === 'delivered' && <Check size={ICON} color={colors.textMuted} strokeWidth={2.25} />}
          {mine && last.status === 'sending' && <Clock size={ICON} color={colors.textMuted} strokeWidth={2} />}
          {failed && <AlertCircle size={ICON} color={colors.error} strokeWidth={2} />}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 60,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: { backgroundColor: colors.primarySoft },
  body: { flex: 1, gap: 1 },
  nameLine: { flexDirection: 'row' },
  nameText: { flexShrink: 1 },
  previewUnread: { fontFamily: 'Inter_500Medium' },
  right: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 44, gap: spacing.xs },
  time: { fontVariant: ['tabular-nums'] },
  timeHot: { fontFamily: 'Inter_500Medium' },
  mark: { height: 18, minWidth: 18, alignItems: 'flex-end', justifyContent: 'center' },
  badge: { minWidth: 18, height: 18, paddingHorizontal: 6, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, lineHeight: 14, fontFamily: 'Inter_600SemiBold' },
});
