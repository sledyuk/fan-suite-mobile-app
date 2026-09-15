import { Plus, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors, fonts, radii, spacing } from '@/theme/tokens';
import { MAX_LENGTH } from './useChatActions';

const QUICK = ['🔥', '❤️', '😍', '💋', '🥰', '😢', '😂', '👀', '🙏', '💜'];

interface Props {
  onSend: (text: string) => void;
}

/**
 * Creator composer from the Figma: emoji quick-bar (h36, r10, subtle bg),
 * bordered 54pt field with a "+" attach affordance, 44pt primary send, and the
 * "0/400" counter. Draft is local state on purpose: keystrokes never touch MobX.
 */
export function ThreadComposer({ onSend }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const send = () => { if (!trimmed) return; onSend(trimmed); setText(''); };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick} style={styles.quickBar} keyboardShouldPersistTaps="always">
        {QUICK.map((e) => (
          <Pressable key={e} onPress={() => setText((t) => t + e)} accessibilityRole="button" accessibilityLabel={`Add ${e}`} hitSlop={4} style={({ pressed }) => [styles.emoji, pressed && { opacity: 0.5 }]}>
            <AppText style={styles.emojiText}>{e}</AppText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.field}>
          <Pressable accessibilityRole="button" accessibilityLabel="Attach" hitSlop={8} style={styles.attach}>
            <Plus size={16} color={colors.bg} strokeWidth={2.5} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Start typing…"
            placeholderTextColor={colors.textPlaceholder}
            multiline
            maxLength={MAX_LENGTH}
            style={styles.input}
            accessibilityLabel="Message"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          accessibilityState={{ disabled: !trimmed }}
          disabled={!trimmed}
          onPress={send}
          style={({ pressed }) => [styles.send, !trimmed && styles.sendDisabled, pressed && styles.sendPressed]}
        >
          <Send size={20} color={colors.bg} strokeWidth={2} />
        </Pressable>
      </View>

      <AppText variant="time" color={colors.textMuted} style={styles.counter}>{text.length}/{MAX_LENGTH}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider, gap: spacing.sm },
  quickBar: { flexGrow: 0, height: 36, borderRadius: radii.lg, backgroundColor: colors.bgSubtle },
  quick: { alignItems: 'center', paddingHorizontal: spacing.sm, gap: spacing.sm },
  emoji: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 20, lineHeight: 26 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  field: { flex: 1, minHeight: 54, maxHeight: 132, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingLeft: spacing.md, paddingRight: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  attach: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.textPrimary, paddingVertical: spacing.md, paddingTop: spacing.md },
  send: { width: 44, height: 44, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  sendPressed: { backgroundColor: colors.primaryPressed },
  sendDisabled: { opacity: 0.5 },
  counter: { fontVariant: ['tabular-nums'] },
});
