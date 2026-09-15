import { router } from 'expo-router';
import { Heart, MapPin, RefreshCw, Sparkles } from '@/components/icons';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { ModalLayout } from '@/components/ModalLayout';
import type { Conversation } from '@/services/mock/conversations';
import { colors, radii, spacing } from '@/theme/tokens';
import { InfoCard } from './InfoCard';

interface Props {
  conversation: Conversation;
}

const money = (n: number) => `$${n.toFixed(2)}`;

export default function FanDetailsScreen({ conversation }: Props) {
  const { fan, profile, online } = conversation;
  return (
    <ModalLayout title="Fan details" onClose={() => router.back()}>
        <View style={styles.identity}>
          <Avatar source={fan.avatar} name={fan.name} size={120} online={online} />
          <AppText variant="title" color={colors.textHeading} style={styles.name}>{fan.name}</AppText>
          <AppText variant="caption" color={colors.primary}>{fan.handle}</AppText>
        </View>

        <InfoCard title="User bio">
          <AppText variant="caption" color={colors.textSecondary}>{profile.bio}</AppText>
          <View style={styles.aiPill}>
            <Sparkles size={12} color={colors.primary} />
            <AppText variant="time" color={colors.primary}>AI</AppText>
          </View>
        </InfoCard>

        <InfoCard icon={<MapPin size={18} color={colors.textSecondary} strokeWidth={1.75} />}>
          <AppText variant="caption">{profile.location}</AppText>
        </InfoCard>

        <InfoCard icon={<Heart size={18} color={colors.textMuted} strokeWidth={1.75} />}>
          <AppText variant="caption" color={profile.preferences ? colors.textPrimary : colors.textPlaceholder}>
            {profile.preferences ?? 'Click to add preferences'}
          </AppText>
        </InfoCard>

        <InfoCard icon={<Sparkles size={18} color={colors.textSecondary} strokeWidth={1.75} />}>
          <AppText variant="caption">Fan in <AppText variant="caption" color={colors.primary}>{profile.suiteName}</AppText></AppText>
          <AppText variant="time" color={colors.textMuted}>Since {profile.fanSince}</AppText>
        </InfoCard>

        <InfoCard
          icon={<RefreshCw size={18} color={colors.textSecondary} strokeWidth={1.75} />}
          right={
            <View style={[styles.togglePill, { backgroundColor: profile.rebill ? colors.online : colors.textMuted }]}>
              <AppText variant="time" color={colors.bg}>{profile.rebill ? 'On' : 'Off'}</AppText>
            </View>
          }
        >
          <AppText variant="caption">Rebill</AppText>
        </InfoCard>

        <InfoCard icon={<View style={[styles.presenceDot, { backgroundColor: online ? colors.online : colors.textMuted }]} />}>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <AppText variant="time" color={colors.textMuted}>Last Online</AppText>
              <AppText variant="caption">{profile.lastOnline}</AppText>
            </View>
            <View style={styles.col}>
              <AppText variant="time" color={colors.textMuted}>Last Response</AppText>
              <AppText variant="caption">{profile.lastResponse}</AppText>
            </View>
          </View>
        </InfoCard>

        <InfoCard title="Buying power" right={<View style={styles.countPill}><AppText variant="time" color={colors.bg}>{profile.purchases}</AppText></View>}>
          <View style={styles.threeCol}>
            <Stat label="Total Spent" value={money(profile.totalSpent)} />
            <Stat label="Av. Tip" value={money(profile.avgTip)} />
            <Stat label="Av. PPV" value={money(profile.avgPpv)} />
          </View>
        </InfoCard>

        <View style={styles.divider} />

        <InfoCard title="Notes">
          <AppText variant="caption" color={profile.note ? colors.textPrimary : colors.textPlaceholder}>{profile.note ?? 'Add a private note'}</AppText>
        </InfoCard>
    </ModalLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.col}>
      <AppText variant="time" color={colors.textMuted}>{label}</AppText>
      <AppText variant="caption">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.xs, paddingBottom: spacing.sm },
  name: { marginTop: spacing.sm, fontSize: 18 },
  aiPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, borderRadius: radii.md, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  togglePill: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: 12 },
  countPill: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.online, alignItems: 'center', justifyContent: 'center' },
  presenceDot: { width: 14, height: 14, borderRadius: 7 },
  twoCol: { flexDirection: 'row', gap: spacing.lg },
  threeCol: { flexDirection: 'row', gap: spacing.lg },
  col: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
