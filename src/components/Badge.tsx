import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  icon?: React.ReactNode;
  bg?: string;
  color?: string;
}

export function Badge({ label, icon, bg = colors.primarySoft, color = colors.primary }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon}
      <AppText variant="badge" color={color}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
});
