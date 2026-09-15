import { Pencil } from '@/components/icons';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  icon?: React.ReactNode;
  title?: string;
  editable?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function InfoCard({ icon, title, editable, right, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        {icon}
        <View style={styles.body}>
          {title !== undefined && (
            <View style={styles.titleRow}>
              <AppText variant="name" style={styles.title}>{title}</AppText>
              {right}
              {editable && <Pencil size={16} color={colors.textMuted} strokeWidth={2} />}
            </View>
          )}
          {children}
        </View>
        {title === undefined && right}
        {title === undefined && editable && <Pencil size={16} color={colors.textMuted} strokeWidth={2} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, padding: spacing.lg, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
});
