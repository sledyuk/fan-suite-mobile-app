import { AlertCircle, Bell, BellOff, Check, Clock, MailOpen, Mail, Pin, PinOff } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { listTime } from '@/lib/time';
import { FIXTURE_NOW, type Conversation } from '@/services/mock/conversations';
import { colors, radii, spacing } from '@/theme/tokens';
import { ACTION_WIDTH, SwipeActions, type SwipeAction } from './SwipeActions';
import type { ConversationActions } from './useConversations';

interface Props {
  item: Conversation;
  onPress: (id: string) => void;
  actions: ConversationActions;
}

const ICON = 16;

/**
 * 60pt row. Left: 40pt avatar with presence. Middle: name, preview (handle lives in the thread header / fan details).
 * Right column: time on top, exactly one status mark below —
 * fan's unread count, or for our own last message: sending / delivered / seen (fan avatar) / failed.
 * Swipe right: pin. Swipe left: mark read/unread, mute.
 * Spec: docs/context/07-chat-row-states.html
 */
export const ConversationRow = memo(function ConversationRow({ item, onPress, actions }: Props) {
  const { last, fan, unreadCount, online, pinned, muted } = item;
  const swipe = useRef<SwipeableMethods>(null);
  const close = () => swipe.current?.close();

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
    pinned ? 'pinned' : null,
    muted ? 'muted' : null,
  ].filter(Boolean).join(', ');

  const leading: SwipeAction[] = [
    { key: 'pin', label: pinned ? 'Unpin' : 'Pin', icon: pinned ? PinOff : Pin, color: colors.gift, onPress: () => actions.togglePin(item.id) },
  ];
  const trailing: SwipeAction[] = [
    { key: 'read', label: unread ? 'Read' : 'Unread', icon: unread ? MailOpen : Mail, color: colors.primary, onPress: () => actions.toggleRead(item.id) },
    { key: 'mute', label: muted ? 'Unmute' : 'Mute', icon: muted ? Bell : BellOff, color: colors.textSecondary, onPress: () => actions.toggleMute(item.id) },
  ];

  return (
    <ReanimatedSwipeable
      ref={swipe}
      friction={2}
      leftThreshold={ACTION_WIDTH / 2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => <SwipeActions actions={leading} onDone={close} />}
      renderRightActions={() => <SwipeActions actions={trailing} onDone={close} />}
    >
      <Pressable
        onPress={() => onPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Avatar source={fan.avatar} name={fan.name} size={40} online={online} />

        <View style={styles.body}>
          <View style={styles.nameLine}>
            <AppText variant="name" numberOfLines={1} style={styles.name}>{fan.name}</AppText>
            {muted && <BellOff size={12} color={colors.textMuted} strokeWidth={2} />}
          </View>
          <AppText variant="caption" color={previewColor} numberOfLines={1} style={unread && styles.previewUnread}>
            {preview}
          </AppText>
        </View>

        <View style={styles.right}>
          <View style={styles.timeLine}>
            {pinned && <Pin size={11} color={colors.textMuted} strokeWidth={2} />}
            <AppText variant="time" color={unread ? colors.primary : colors.textMuted} style={[styles.time, unread && styles.timeHot]}>
              {stamp}
            </AppText>
          </View>
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
    </ReanimatedSwipeable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 60,
    paddingHorizontal: spacing.lg + spacing.sm,
    backgroundColor: colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: { backgroundColor: colors.primarySoft, borderRadius: radii.lg },
  body: { flex: 1, gap: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
  previewUnread: { fontFamily: 'Inter_500Medium' },
  right: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 44, gap: spacing.xs },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  time: { fontVariant: ['tabular-nums'] },
  timeHot: { fontFamily: 'Inter_500Medium' },
  mark: { height: 18, minWidth: 18, alignItems: 'flex-end', justifyContent: 'center' },
  badge: { minWidth: 18, height: 18, paddingHorizontal: 6, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, lineHeight: 14, fontFamily: 'Inter_600SemiBold' },
});
