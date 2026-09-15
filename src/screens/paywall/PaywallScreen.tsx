import { router } from 'expo-router';
import { Check, Sparkles } from '@/components/icons';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AppText } from '@/components/AppText';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useStores } from '@/hooks/useStores';
import { formatSchmeckles } from '@/lib/money';
import { colors, radii, spacing } from '@/theme/tokens';

/**
 * FanSuite Pro paywall. States: idle → purchasing (button busy, taps ignored)
 * → awaiting confirmation (honest amber pill; access not yet granted) → active.
 * Cancel and failure leave any valid plan untouched. Simulated billing.
 */
const PaywallScreen = observer(function PaywallScreen() {
  const { billing } = useStores();
  const reduced = useReducedMotion();
  const { product } = billing;
  const [slow, setSlow] = useState(false);
  const wasActive = useRef(billing.isActive);

  // Offer "Check again" if confirmation drags on.
  useEffect(() => {
    if (!billing.isAwaiting) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [billing.isAwaiting]);

  // Close shortly after Pro becomes active as a result of this sheet.
  useEffect(() => {
    if (billing.isActive && !wasActive.current) {
      const t = setTimeout(() => router.back(), reduced ? 0 : 600);
      return () => clearTimeout(t);
    }
  }, [billing.isActive, reduced]);

  return (
    <ModalLayout title={product.title} subtitle="Simulated billing — no real charge" onClose={() => router.back()}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.badge}><Sparkles size={16} color={colors.primary} /></View>
          <View style={styles.cardTitle}>
            <AppText variant="name">{product.title}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Monthly plan</AppText>
          </View>
          <View style={styles.price}>
            <AppText variant="title" color={colors.textHeading}>{formatSchmeckles(product.priceSchmeckles)}</AppText>
            <AppText variant="time" color={colors.textMuted}>{product.usdHint} / month</AppText>
          </View>
        </View>
        {product.perks.map((p) => (
          <View key={p} style={styles.perk}>
            <Check size={16} color={colors.primary} strokeWidth={2.5} />
            <AppText variant="caption">{p}</AppText>
          </View>
        ))}
      </View>

      {billing.isActive && (
        <Pill bg={colors.successBg} color={colors.successText} text={`Pro is active · renews ${new Date(billing.entitlement.expiresAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`} />
      )}
      {billing.isAwaiting && (
        <Pill bg={colors.warningBg} color={colors.warningText} text="Purchase received. Confirming with the server…" busy
          action={slow ? { label: 'Check again', onPress: () => void billing.checkAgain() } : undefined} />
      )}
      {billing.lastError && (
        <Pill bg={colors.errorSoft} color={colors.error} text={billing.lastError} action={{ label: 'Try again', onPress: () => void billing.buy() }} />
      )}
      {billing.lastEvent === 'Purchase cancelled' && <Pill bg={colors.bgSubtle} color={colors.textSecondary} text="Purchase cancelled. Nothing was charged." />}

      <PrimaryButton
        label={billing.isActive ? 'You have Pro' : `Subscribe · ${formatSchmeckles(product.priceSchmeckles)}/mo`}
        loading={billing.purchaseInFlight}
        disabled={billing.isActive}
        onPress={() => void billing.buy()}
      />
      <Pressable onPress={() => void billing.restore()} disabled={billing.purchaseInFlight || billing.isActive} accessibilityRole="button" style={({ pressed }) => [styles.restore, pressed && { opacity: 0.6 }]}>
        <AppText variant="caption" color={colors.primary} style={styles.restoreText}>Restore purchase</AppText>
      </Pressable>

      <AppText variant="time" color={colors.textMuted} style={styles.legal}>
        Simulated billing. In the real app this goes through the App Store or Google Play and is validated by the FanSuite backend before Pro is switched on.
      </AppText>
    </ModalLayout>
  );
});

export default PaywallScreen;

function Pill({ bg, color, text, busy, action }: { bg: string; color: string; text: string; busy?: boolean; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]} accessibilityLiveRegion="polite">
      <AppText variant="caption" color={color} style={styles.pillText}>{text}</AppText>
      {action && (
        <Pressable onPress={action.onPress} accessibilityRole="button" hitSlop={6}>
          <AppText variant="caption" color={color} style={styles.pillAction}>{action.label}</AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: '#F7F7FD', borderRadius: radii.card, padding: spacing.lg, gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1 },
  price: { alignItems: 'flex-end' },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radii.lg },
  pillText: { flex: 1, fontFamily: 'Inter_500Medium' },
  pillAction: { fontFamily: 'Inter_600SemiBold' },
  restore: { alignItems: 'center', paddingVertical: spacing.xs },
  restoreText: { fontFamily: 'Inter_500Medium' },
  legal: { textAlign: 'center' },
});
