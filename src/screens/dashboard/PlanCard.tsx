import { router } from 'expo-router';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { useStores } from '@/hooks/useStores';
import { colors, radii, spacing } from '@/theme/tokens';

/** The creator's plan at a glance: Free → Upgrade, Confirming…, or Pro with renewal date. */
export const PlanCard = observer(function PlanCard() {
  const { billing } = useStores();
  const state = billing.isActive ? 'active' : billing.isAwaiting ? 'awaiting' : 'free';
  const title = state === 'active' ? 'FanSuite Pro' : state === 'awaiting' ? 'Confirming your purchase…' : 'Free plan';
  const sub = state === 'active'
    ? `Renews ${new Date(billing.entitlement.expiresAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
    : state === 'awaiting' ? 'Pro switches on when the server confirms' : 'Upgrade to message many fans at once';
  const bg = state === 'active' ? colors.successBg : state === 'awaiting' ? colors.warningBg : colors.primarySoft;
  const fg = state === 'active' ? colors.successText : state === 'awaiting' ? colors.warningText : colors.primary;

  return (
    <Pressable onPress={() => router.push('/paywall')} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`} style={({ pressed }) => [styles.card, { backgroundColor: bg }, pressed && { opacity: 0.85 }]}>
      <View style={[styles.icon, { backgroundColor: colors.bg }]}><Sparkles size={18} color={fg} /></View>
      <View style={styles.body}>
        <AppText variant="name" color={fg}>{title}</AppText>
        <AppText variant="caption" color={fg}>{sub}</AppText>
      </View>
      <ChevronRight size={18} color={fg} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radii.card },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
});
