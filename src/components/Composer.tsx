import { Send } from '@/components/icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

interface Props {
  placeholder?: string;
  maxLength?: number;
  onSend: (text: string) => void;
  autoFocus?: boolean;
}

export function Composer({ placeholder = 'Start typing…', maxLength = 400, onSend, autoFocus }: Props) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const send = () => { if (!trimmed) return; onSend(trimmed); setText(''); };

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          multiline
          maxLength={maxLength}
          autoFocus={autoFocus}
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
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  field: { flex: 1, minHeight: 54, maxHeight: 132, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  input: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.textPrimary, paddingVertical: spacing.md, paddingTop: spacing.md },
  send: { width: 44, height: 44, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  sendPressed: { backgroundColor: colors.primaryPressed },
  sendDisabled: { opacity: 0.5 },
});
