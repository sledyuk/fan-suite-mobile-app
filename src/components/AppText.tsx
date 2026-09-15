import { Text, type TextProps } from 'react-native';
import { colors, type, type TypeVariant } from '@/theme/tokens';

interface Props extends TextProps {
  variant?: TypeVariant;
  color?: string;
}

/** Text bound to the design tokens so screens never hardcode fonts or colors. */
export function AppText({ variant = 'body', color = colors.textPrimary, style, ...rest }: Props) {
  return <Text {...rest} style={[type[variant], { color }, style]} />;
}
