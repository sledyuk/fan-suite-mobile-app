import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

interface Props {
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const glass = isLiquidGlassAvailable();

/**
 * Round icon button in the iOS 26 toolbar style: Liquid Glass where available,
 * a subtle filled circle elsewhere (Android, older iOS).
 */
export function GlassIconButton({ accessibilityLabel, onPress, size = 36, style, children }: Props) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      {glass ? (
        <GlassView glassEffectStyle="regular" isInteractive style={[styles.center, shape]}>{children}</GlassView>
      ) : (
        <View style={[styles.center, styles.fallback, shape]}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallback: { backgroundColor: colors.bgSubtle, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.6 },
});
