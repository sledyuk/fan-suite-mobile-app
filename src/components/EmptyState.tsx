import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { container } from '@/services/container';
import { colors, spacing } from '@/theme/tokens';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Show the demo-data shortcut (dev only). */
  seedable?: boolean;
}

/** First-run state for a screen: what will appear here, and (in dev) a way to load the demo. */
export function EmptyState({ icon: Icon, title, body, seedable }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><Icon size={26} color={colors.primary} strokeWidth={1.75} /></View>
      <AppText variant="name" color={colors.textHeading} style={styles.title}>{title}</AppText>
      <AppText variant="caption" color={colors.textMuted} style={styles.body}>{body}</AppText>
      {seedable && __DEV__ && <PrimaryButton label="Load demo data" onPress={() => container.seedDemo()} style={styles.cta} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.sm },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 280 },
  cta: { marginTop: spacing.md },
});
