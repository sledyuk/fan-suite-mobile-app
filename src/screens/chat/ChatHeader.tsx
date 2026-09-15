import { ArrowLeft, MoreVertical, Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { IconButton } from '@/components/IconButton';
import type { Participant } from '@/services/mock/creator';
import { colors, spacing } from '@/theme/tokens';

interface Props {
  creator: Participant;
  onBack?: () => void;
  onMenu?: () => void;
}

export function ChatHeader({ creator, onBack, onMenu }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <IconButton accessibilityLabel="Back" onPress={onBack} size={40}>
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2} />
        </IconButton>
        <AppText variant="title" color={colors.textHeading} style={styles.title}>Chat with</AppText>
        <IconButton accessibilityLabel="More options" onPress={onMenu} size={40}>
          <MoreVertical size={20} color={colors.textPrimary} strokeWidth={2} />
        </IconButton>
      </View>
      <View style={styles.identityRow}>
        <Avatar source={creator.avatar} name={creator.name} size={32} />
        <View style={styles.names}>
          <AppText variant="name" color={colors.textSecondary}>{creator.name}</AppText>
          <AppText variant="caption" color={colors.primary}>{creator.handle}</AppText>
        </View>
        <Badge label="Fan in All Access" icon={<Star size={14} color={colors.primary} fill={colors.primary} />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  topRow: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  title: { flex: 1, marginLeft: spacing.xs },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  names: { flex: 1 },
});
