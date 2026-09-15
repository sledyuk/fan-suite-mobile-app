import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/theme/tokens';

export interface SwipeAction {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}

export const ACTION_WIDTH = 76;

/** Full-height coloured action buttons revealed behind a swiped row. */
export function SwipeActions({ actions, onDone }: { actions: SwipeAction[]; onDone: () => void }) {
  return (
    <View style={styles.wrap}>
      {actions.map(({ key, label, icon: Icon, color, onPress }) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => { onPress(); onDone(); }}
          style={({ pressed }) => [styles.action, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}
        >
          <Icon size={20} color={colors.bg} strokeWidth={2} />
          <AppText variant="time" color={colors.bg} style={styles.label}>{label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', height: '100%' },
  action: { width: ACTION_WIDTH, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  label: { fontFamily: 'Inter_500Medium' },
});
