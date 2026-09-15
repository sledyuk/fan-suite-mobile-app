import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';

interface Props {
  source: number | string;
  size?: number;
  online?: boolean;
}

export function Avatar({ source, size = 32, online }: Props) {
  const dot = Math.max(8, Math.round(size * 0.3));
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={source}
        cachePolicy="memory-disk"
        transition={0}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityIgnoresInvertColors
      />
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: online ? colors.online : colors.textMuted },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2, borderColor: colors.bg },
});
