import type { IconComponent } from '@/components/icons';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  icon: IconComponent;
  title: string;
  body: string;
}

export function EmptyState({ icon: Icon, title, body }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><Icon size={26} color={colors.primary} strokeWidth={1.75} /></View>
      <AppText variant="name" color={colors.textHeading} style={styles.title}>{title}</AppText>
      <AppText variant="caption" color={colors.textMuted} style={styles.body}>{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.sm },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 280 },
});
