import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '@/theme/tokens';

interface Props extends Omit<PressableProps, 'style'> {
  accessibilityLabel: string;
  size?: number;
  filled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ size = 44, filled, children, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, opacity: pressed ? 0.6 : 1 },
        filled && styles.filled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radii.lg },
  filled: { backgroundColor: colors.bgSubtle, borderWidth: 1, borderColor: colors.border },
});
