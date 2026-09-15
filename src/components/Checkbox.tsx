import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/theme/tokens';

/** Presentational 20pt checkbox; the parent row owns the press. */
export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.box, checked && styles.checked]} accessibilityElementsHidden>
      {checked && <Check size={14} color={colors.bg} strokeWidth={3} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 20, height: 20, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
});
