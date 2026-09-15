import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/theme/tokens';

export function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <AppText variant="caption" color={colors.textSection}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.lg },
});
