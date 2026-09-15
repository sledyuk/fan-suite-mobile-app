import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import type { IconComponent } from './icons';

/**
 * iOS grouped-inset list language (as in Expo's dev menu): uppercase section
 * label, rounded #F2F2F7 group, 56pt rows with icon / label / hint / accessory.
 */
export const GROUP_BG = '#F2F2F7';

export function Section({ title, children, style }: { title?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.section, style]}>
      {title && <AppText variant="time" color={colors.textMuted} style={styles.sectionTitle}>{title.toUpperCase()}</AppText>}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

interface RowProps {
  icon?: IconComponent;
  leading?: React.ReactNode;
  label: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  last?: boolean;
  tone?: string;
}

export function Row({ icon: Icon, leading, label, hint, right, onPress, disabled, selected, last, tone = colors.textPrimary }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled, selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, selected && styles.rowSelected, pressed && onPress && styles.rowPressed, disabled && { opacity: 0.45 }]}
    >
      {leading ?? (Icon && <Icon size={20} color={tone === colors.textPrimary ? colors.textSecondary : tone} />)}
      <View style={styles.rowText}>
        <AppText color={tone}>{label}</AppText>
        {hint && <AppText variant="time" color={colors.textMuted}>{hint}</AppText>}
      </View>
      {right}
    </Pressable>
  );
}

export function KV({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <AppText style={styles.rowText}>{label}</AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.kv}>{value}</AppText>
    </View>
  );
}

/** Big pill action (Expo's "Reload" / "Go home"). `primary` fills it with the brand colour. */
export function Pill({ icon: Icon, label, onPress, disabled, primary, loading }: { icon?: IconComponent; label: string; onPress: () => void; disabled?: boolean; primary?: boolean; loading?: boolean }) {
  const fg = primary ? colors.bg : colors.textPrimary;
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} style={({ pressed }) => [styles.pill, primary && styles.pillPrimary, pressed && { opacity: 0.7 }, (disabled || loading) && { opacity: 0.45 }]}>
      {Icon && <Icon size={20} color={fg} />}
      <AppText variant="body" color={fg} style={styles.pillLabel}>{loading ? '…' : label}</AppText>
    </Pressable>
  );
}

export function Tip({ title = 'Tip', children }: { title?: string; children: string }) {
  return (
    <View style={styles.tip}>
      <AppText variant="name" color={colors.verified}>💡 {title}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 0.6, marginLeft: spacing.xs },
  group: { backgroundColor: GROUP_BG, borderRadius: radii.card, overflow: 'hidden' },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowSelected: { backgroundColor: colors.primarySoft },
  rowPressed: { backgroundColor: colors.divider },
  rowText: { flex: 1, gap: 1 },
  kv: { flexShrink: 1, textAlign: 'right' },
  pill: { flex: 1, height: 60, borderRadius: radii.card, backgroundColor: GROUP_BG, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  pillPrimary: { backgroundColor: colors.primary },
  pillLabel: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  tip: { backgroundColor: '#E8F3FD', borderRadius: radii.card, padding: spacing.lg, gap: spacing.xs },
});
