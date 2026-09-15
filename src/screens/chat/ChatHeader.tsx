import { ArrowLeft, Star } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import type { Participant } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  peer: Participant;
  online: boolean;
  onBack?: () => void;
  onDetails?: () => void;
}

/** Creator-side header: the fan's identity and a "Full Details" button that opens their profile sheet. */
export function ChatHeader({ peer, online, onBack, onDetails }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to messages" hitSlop={8} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
          <ArrowLeft size={22} color={colors.primary} strokeWidth={2} />
          <AppText variant="body" color={colors.primary} style={styles.backLabel}>Messages</AppText>
        </Pressable>
        <AppText variant="title" color={colors.textHeading} style={styles.title}>Chat with</AppText>
        <View style={styles.right} />
      </View>
      <View style={styles.identityRow}>
        <Avatar source={peer.avatar} name={peer.name} size={32} online={online} />
        <View style={styles.names}>
          <AppText variant="name" color={colors.textSecondary}>{peer.name}</AppText>
          <AppText variant="caption" color={colors.primary}>{peer.handle}</AppText>
        </View>
        <Pressable
          onPress={onDetails}
          accessibilityRole="button"
          accessibilityLabel={`Full details for ${peer.name}`}
          style={({ pressed }) => [styles.details, pressed && { opacity: 0.7 }]}
        >
          <Star size={14} color={colors.primary} fill={colors.primary} />
          <AppText variant="badge" color={colors.primary}>Full Details</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  topRow: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  back: { width: 92, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
  backLabel: { fontFamily: 'Inter_500Medium' },
  title: { flex: 1, textAlign: 'center' },
  right: { width: 92, alignItems: 'flex-end', paddingRight: spacing.xs },
  identityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.xs, gap: spacing.sm },
  names: { flex: 1 },
  details: { height: 32, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
