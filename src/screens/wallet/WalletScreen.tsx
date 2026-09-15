import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { Stack } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, Banknote, Gift, Lock, RotateCcw, Wallet } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { useStores } from '@/hooks/useStores';
import { PrimaryButton } from '@/components/PrimaryButton';
import { listTime } from '@/lib/time';
import { CURRENCY_NAME, formatSchmeckles } from '@/lib/money';
import { TX_LABEL, type Transaction, type TxKind } from '@/services/mock/wallet';
import { colors, radii, spacing } from '@/theme/tokens';

const ICON: Record<TxKind, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  subscription: ArrowDownLeft, tip: Gift, ppv: Lock, refund: RotateCcw, payout: Banknote,
};
const FIXTURE_NOW = Date.UTC(2026, 8, 15, 11, 0, 0);
const keyExtractor = (t: Transaction) => t.id;

/** Creator earnings in Schmeckles. Balance card stays put; activity scrolls beneath it. Payout is simulated. */
const WalletScreen = observer(function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { wallet } = useStores().demo;
  const [note, setNote] = useState<string | null>(null);

  const renderItem = useCallback(({ item: t }: LegendListRenderItemProps<Transaction>) => {
    const Icon = ICON[t.kind];
    const negative = t.amount < 0;
    const tone = t.kind === 'refund' ? colors.error : negative ? colors.textSecondary : colors.successText;
    return (
      <View style={styles.row} accessibilityLabel={`${TX_LABEL[t.kind]} ${t.counterparty} ${formatSchmeckles(t.amount, { sign: true })}`}>
        <View style={[styles.icon, { backgroundColor: t.kind === 'refund' ? colors.errorSoft : colors.bgSubtle }]}><Icon size={18} color={tone} strokeWidth={2} /></View>
        <View style={styles.body}>
          <AppText variant="name">{TX_LABEL[t.kind]}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{t.counterparty} · {listTime(t.at, FIXTURE_NOW)}</AppText>
        </View>
        <AppText variant="name" color={tone} style={styles.tx}>{formatSchmeckles(t.amount, { sign: true })}</AppText>
      </View>
    );
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Wallet' }} />
      <View style={styles.top}>
        <View style={styles.balance}>
          <AppText variant="caption" color={colors.primary}>Available balance</AppText>
          <View style={styles.amountRow}>
            <AppText variant="title" color={colors.textHeading} style={styles.amount}>{formatSchmeckles(wallet.balance, { code: false })}</AppText>
            <AppText variant="name" color={colors.textMuted}>{CURRENCY_NAME}</AppText>
          </View>
          <AppText variant="time" color={colors.textMuted}>{formatSchmeckles(wallet.pendingPayout)} pending payout · Simulated billing</AppText>
          <PrimaryButton label="Request payout" icon={<ArrowUpRight size={18} color={colors.bg} strokeWidth={2.25} />} disabled={wallet.balance <= 0} onPress={() => setNote('Payout requested. In the real app this creates a transfer via the payout provider.')} style={styles.payout} />
          {note && <AppText variant="time" color={colors.successText}>{note}</AppText>}
        </View>
        <AppText variant="caption" color={colors.textSection} style={styles.section}>Recent activity</AppText>
      </View>
      <LegendList
        data={wallet.transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={56}
        recycleItems
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 88 }}
        style={styles.list}
        ListEmptyComponent={<EmptyState icon={Wallet} title="Nothing earned yet" body="Subscriptions, tips and PPV unlocks from fans land here." />}
      />
    </View>
  );
});

export default WalletScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, backgroundColor: colors.bg },
  balance: { backgroundColor: colors.primaryTint, borderRadius: radii.card, padding: spacing.lg, gap: spacing.xs },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  amount: { fontSize: 32, lineHeight: 40, fontVariant: ['tabular-nums'] },
  payout: { marginTop: spacing.md, alignSelf: 'flex-start' },
  section: { marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  tx: { fontVariant: ['tabular-nums'] },
});
