import { Search, SlidersHorizontal } from 'lucide-react-native';
import { StyleSheet, TextInput, View } from 'react-native';
import { IconButton } from '@/components/IconButton';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Search size={18} color={colors.textPlaceholder} strokeWidth={2} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search for conversations"
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search conversations"
        />
      </View>
      <IconButton accessibilityLabel="Filter conversations" size={38} filled>
        <SlidersHorizontal size={18} color={colors.textPrimary} strokeWidth={2} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  field: {
    flex: 1, height: 38, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.bg,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
});
