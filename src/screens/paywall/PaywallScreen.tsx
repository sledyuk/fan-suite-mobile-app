import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { KV, Pill, Row, Section, Tip } from '@/components/GroupedList';
import { Check, RefreshCw, Sparkles } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStores } from '@/hooks/useStores';
import { formatSchmeckles } from '@/lib/money';
import { colors, radii, spacing } from '@/theme/tokens';

const PaywallScreen = observer(function PaywallScreen() {
  const { billing } = useStores();
  const reduced = useReducedMotion();
  const { product } = billing;
  const [slow, setSlow] = useState(false);
  const wasActive = useRef(billing.isActive);

  useEffect(() => {
    if (!billing.isAwaiting) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [billing.isAwaiting]);

  useEffect(() => {
    if (billing.isActive && !wasActive.current) { const t = setTimeout(() => router.back(), reduced ? 0 : 600); return () => clearTimeout(t); }
  }, [billing.isActive, reduced]);

  const renews = billing.entitlement.expiresAt ? new Date(billing.entitlement.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
  const status = billing.isActive ? { bg: colors.successBg, fg: colors.successText, text: `Pro is active · renews ${renews}` }
    : billing.isAwaiting ? { bg: colors.warningBg, fg: colors.warningText, text: 'Purchase received. Confirming with the server…' }
    : billing.lastError ? { bg: colors.errorSoft, fg: colors.error, text: billing.lastError }
    : billing.lastEvent === 'Purchase cancelled' ? { bg: '#F2F2F7', fg: colors.textSecondary, text: 'Purchase cancelled. Nothing was charged.' }
    : null;

  return (
    <ModalLayout appIcon title={product.title} subtitle="Simulated billing — no real charge" onClose={() => router.back()}>
      <View style={styles.pills}>
        <Pill primary icon={Sparkles} label={billing.isActive ? 'You have Pro' : 'Subscribe'} loading={billing.purchaseInFlight} disabled={billing.isActive} onPress={() => void billing.buy()} />
        <Pill icon={RefreshCw} label="Restore" disabled={billing.purchaseInFlight || billing.isActive} onPress={() => void billing.restore()} />
      </View>

      {status && (
        <View style={[styles.status, { backgroundColor: status.bg }]} accessibilityLiveRegion="polite">
          <AppText variant="caption" color={status.fg} style={styles.statusText}>{status.text}</AppText>
          {billing.isAwaiting && slow && <AppText variant="caption" color={status.fg} style={styles.statusAction} onPress={() => void billing.checkAgain()}>Check again</AppText>}
          {billing.lastError && !billing.isAwaiting && <AppText variant="caption" color={status.fg} style={styles.statusAction} onPress={() => void billing.buy()}>Try again</AppText>}
        </View>
      )}

      <Section title="Plan">
        <KV label="Product" value={`${product.title} · monthly`} />
        <KV label="Price" value={`${formatSchmeckles(product.priceSchmeckles)} / month  ${product.usdHint}`} />
        <KV label="Status" value={billing.isActive ? 'active' : billing.isAwaiting ? 'awaiting confirmation' : 'free plan'} last />
      </Section>

      <Section title="Included">
        {product.perks.map((p, i) => (
          <Row key={p} label={p} leading={<Check size={18} color={colors.primary} strokeWidth={2.5} />} last={i === product.perks.length - 1} />
        ))}
      </Section>

      <Tip title="How this works">
        The store answers first; Pro only switches on once the FanSuite backend confirms the receipt. Cancelling or a failed payment never touches a plan that is still valid.
      </Tip>

      <AppText variant="time" color={colors.textMuted} style={styles.legal}>
        In the real app this goes through the App Store or Google Play and is validated server-side before access is granted.
      </AppText>
    </ModalLayout>
  );
});

export default PaywallScreen;

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', gap: spacing.md },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.card },
  statusText: { flex: 1, fontFamily: 'Inter_500Medium' },
  statusAction: { fontFamily: 'Inter_600SemiBold' },
  legal: { textAlign: 'center' },
});
