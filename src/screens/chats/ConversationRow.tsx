import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { relativeTime, type Conversation } from '@/services/mock/conversations';
import { ME } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  item: Conversation;
  onPress: (id: string) => void;
}

/**
 * 60pt row from the mockup: avatar 40 + presence, name + handle, preview · time,
 * then on the right a 20pt avatar of whoever sent the last message and two
 * status dots (top: unread, bottom: online).
 */
export const ConversationRow = memo(function ConversationRow({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${item.fan.name}, ${item.unread ? 'unread' : 'read'}, ${relativeTime(item.lastAt)}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar source={item.fan.avatar} name={item.fan.name} size={40} online={item.online} />
      <View style={styles.body}>
        <View style={styles.nameLine}>
          <AppText variant="name" numberOfLines={1}>{item.fan.name} </AppText>
          <AppText variant="name" color={colors.primary} numberOfLines={1} style={styles.handle}>{item.fan.handle}</AppText>
        </View>
        <View style={styles.previewLine}>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.preview}>{item.lastMessage}</AppText>
          <AppText variant="time" color={colors.textMuted}> · {relativeTime(item.lastAt)}</AppText>
        </View>
      </View>
      <Avatar
        source={item.lastMessage.startsWith('You:') ? ME.avatar : item.fan.avatar}
        name={item.lastMessage.startsWith('You:') ? ME.name : item.fan.name}
        size={20}
      />
      <View style={styles.dots}>
        <View style={[styles.dot, { backgroundColor: item.unread ? colors.online : colors.divider }]} />
        <View style={[styles.dot, { backgroundColor: item.online ? colors.online : colors.divider }]} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { height: 60, marginHorizontal: spacing.lg, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm },
  pressed: { backgroundColor: colors.primarySoft },
  body: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  handle: { flexShrink: 1 },
  previewLine: { flexDirection: 'row', alignItems: 'center' },
  preview: { flexShrink: 1 },
  dots: { gap: 6, alignItems: 'center', marginLeft: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
