import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Play } from '@/components/icons';
import type { Attachment } from '@/services/api/types';
import { colors, radii, spacing } from '@/theme/tokens';

const MAX_W = 240;

/** Photo or video inside a bubble. Videos show a poster-less tile with a play badge and duration (no playback in this exercise). */
export function AttachmentView({ attachment }: { attachment: Attachment }) {
  const ratio = attachment.width && attachment.height ? attachment.width / attachment.height : 4 / 3;
  const w = MAX_W, h = Math.min(320, Math.round(w / ratio));
  if (attachment.kind === 'image') {
    return <Image source={{ uri: attachment.uri }} style={[styles.media, { width: w, height: h }]} contentFit="cover" cachePolicy="memory-disk" accessibilityLabel="Photo" />;
  }
  const secs = Math.round((attachment.durationMs ?? 0) / 1000);
  return (
    <View style={[styles.media, styles.video, { width: w, height: Math.max(140, h) }]} accessibilityLabel="Video">
      <View style={styles.play}><Play size={22} color={colors.bg} variant="Bold" /></View>
      {secs > 0 && <AppText variant="time" color={colors.bg} style={styles.duration}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  media: { borderRadius: radii.lg, marginBottom: spacing.sm, backgroundColor: colors.bgSubtle, maxWidth: '100%' },
  video: { backgroundColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  duration: { position: 'absolute', right: spacing.sm, bottom: spacing.sm, fontFamily: 'Inter_500Medium' },
});
