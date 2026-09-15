import { Stack } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, Banknote, Gift, Lock, RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { listTime } from '@/lib/time';
import { formatSchmeckles } from '@/lib/money';
import { TX_LABEL, WALLET, type TxKind } from '@/services/mock/wallet';
import { colors, radii, spacing } from '@/theme/tokens';

const ICON: Record<TxKind, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  subscription: ArrowDownLeft, tip: Gift, ppv: Lock, refund: RotateCcw, payout: Banknote,
};
const FIXTURE_NOW = Date.UTC(2026, 8, 15, 11, 0, 0);

/** Creator earnings in Schmeckles. Payout is simulated (no real money moves). */
export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState<string | null>(null);
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Wallet' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.balance}>
          <AppText variant="caption" color={colors.primary}>Available balance</AppText>
          <AppText variant="title" color={colors.textHeading} style={styles.amount}>{formatSchmeckles(WALLET.balance)}</AppText>
          <AppText variant="time" color={colors.textMuted}>{formatSchmeckles(WALLET.pendingPayout)} pending payout · Simulated billing</AppText>
          <PrimaryButton label="Request payout" icon={<ArrowUpRight size={18} color={colors.bg} strokeWidth={2.25} />} onPress={() => setNote('Payout requested. In the real app this creates a transfer via the payout provider.')} style={styles.payout} />
          {note && <AppText variant="time" color={colors.successText}>{note}</AppText>}
        </View>

        <AppText variant="caption" color={colors.textSection} style={styles.section}>Recent activity</AppText>
        <View style={styles.list}>
          {WALLET.transactions.map((t) => {
            const Icon = ICON[t.kind];
            const negative = t.amount < 0;
            const tone = t.kind === 'refund' ? colors.error : negative ? colors.textSecondary : colors.successText;
            return (
              <View key={t.id} style={styles.row} accessibilityLabel={`${TX_LABEL[t.kind]} ${t.counterparty} ${formatSchmeckles(t.amount, { sign: true })}`}>
                <View style={[styles.icon, { backgroundColor: t.kind === 'refund' ? colors.errorSoft : colors.bgSubtle }]}><Icon size={18} color={tone} strokeWidth={2} /></View>
                <View style={styles.body}>
                  <AppText variant="name">{TX_LABEL[t.kind]}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>{t.counterparty} · {listTime(t.at, FIXTURE_NOW)}</AppText>
                </View>
                <AppText variant="name" color={tone} style={styles.tx}>{formatSchmeckles(t.amount, { sign: true })}</AppText>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  balance: { backgroundColor: colors.primaryTint, borderRadius: radii.card, padding: spacing.lg, gap: spacing.xs },
  amount: { fontSize: 32, lineHeight: 40, fontVariant: ['tabular-nums'] },
  payout: { marginTop: spacing.md, alignSelf: 'flex-start' },
  section: { marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12 },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  tx: { fontVariant: ['tabular-nums'] },
});
