import { Send } from '@/components/icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  placeholder?: string;
  maxLength?: number;
  /** Return false to keep the draft (for example when the message could not be persisted). */
  onSend: (text: string) => boolean | void;
  errorText?: string | null;
  autoFocus?: boolean;
}

export function Composer({ placeholder = 'Start typing…', maxLength = 400, onSend, autoFocus, errorText }: Props) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const send = () => { if (!trimmed) return; if (onSend(trimmed) === false) return; setText(''); };

  return (
    <View style={styles.wrap}>
      {errorText ? <AppText variant="time" color={colors.error} accessibilityLiveRegion="polite">{errorText}</AppText> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  field: { flex: 1, minHeight: 54, maxHeight: 132, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  input: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.textPrimary, paddingVertical: spacing.md, paddingTop: spacing.md },
  send: { width: 44, height: 44, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  sendPressed: { backgroundColor: colors.primaryPressed },
  sendDisabled: { opacity: 0.5 },
});
