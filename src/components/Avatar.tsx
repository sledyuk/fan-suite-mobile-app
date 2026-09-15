import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  source?: number | string;
  /** Used for the initials fallback and its color when `source` is missing. */
  name?: string;
  size?: number;
  online?: boolean;
}

const PALETTE = ['#5863DE', '#8258DE', '#16A34A', '#2563EB', '#DB2777', '#EA580C', '#0D9488'];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
}
function colorFor(name: string) {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({ source, name = '', size = 32, online }: Props) {
  const dot = Math.max(8, Math.round(size * 0.3));
  const radius = size / 2;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={name || undefined}>
      {/* Initials sit underneath; the image paints over them once cached (no fade: recycled list rows swap sources often), so offline/first paint still shows something. */}
      <View style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: colorFor(name) }]}>
        <AppText variant="name" color={colors.bg} style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>
          {initialsFor(name)}
        </AppText>
      </View>
      {source !== undefined && (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey={typeof source === 'string' ? source : undefined}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      )}
      {online !== undefined && (
        <View style={[styles.dot, { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: online ? colors.online : colors.textMuted }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2, borderColor: colors.bg },
});
