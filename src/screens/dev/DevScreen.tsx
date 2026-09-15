import { router, useLocalSearchParams } from 'expo-router';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pill, Row, Section, Tip } from '@/components/GroupedList';
import { AppText } from '@/components/AppText';
import { Check, Clock, Cpu, Layers, MessageNotif, RotateCcw, Slash, Wallet, WifiOff } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { useStores } from '@/hooks/useStores';
import { billingConfig, container } from '@/services/container';
import type { PurchaseOutcome } from '@/services/api/BillingApi';
import type { Faults } from '@/services/mock/faults';
import { colors, radii, spacing } from '@/theme/tokens';

const FAILS: { label: string; value: Faults['failNextSend'] }[] = [
  { label: 'None', value: null }, { label: 'Rate limited (recoverable)', value: 'RATE_LIMITED' }, { label: 'Blocked', value: 'BLOCKED' }, { label: 'Needs payment', value: 'PAYMENT_REQUIRED' },
];
const OUTCOMES: { label: string; value: PurchaseOutcome }[] = [
  { label: 'Success', value: 'success' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Failed', value: 'failed' }, { label: 'Success, backend confirms after 6 s', value: 'success_delayed' },
];

const INTRO: [string, string][] = [
  ['Seed demo / Reset', 'Load the Rick and Morty demo with 50,000-message histories, or wipe client and server storage.'],
  ['Network', 'Go offline, lose the next response, add latency, or swap in the buggy server that duplicates retried sends.'],
  ['Fail next send', 'Make the next send fail with a typed error: rate limited (retryable), blocked, or payment required.'],
  ['Messages', 'Inject four incoming fan messages into the open thread, as if they arrived while you were away.'],
  ['Next purchase outcome', 'Choose what the simulated store answers on the paywall: success, cancelled, failed, or delayed confirmation.'],
];

const DevScreen = observer(function DevScreen() {
  const root = useStores();
  const insets = useSafeAreaInsets();
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const { connectivity, demo, settings } = root;
  const [buggy, setBuggy] = useState(container.buggyServer);
  const [outcome, setOutcome] = useState<PurchaseOutcome>(billingConfig.outcome);
  const set = <K extends keyof Faults>(k: K, v: Faults[K]) => runInAction(() => connectivity.setFault(k, v));
  const pick = (v: PurchaseOutcome) => { billingConfig.outcome = v; billingConfig.confirmDelayMs = v === 'success_delayed' ? 6000 : 0; setOutcome(v); };

  return (
    <ModalLayout appIcon title="FanSuite" subtitle="Debug controls · local mock only" onClose={() => router.back()} scroll={false}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false} style={styles.scroll}>
        {!settings.debugIntroSeen && (
          <View style={styles.intro} accessibilityRole="summary">
            <AppText variant="name" color={colors.textHeading}>What this console does</AppText>
            <AppText variant="caption" color={colors.textSecondary}>Everything here talks to the local mock server only. Nothing leaves the phone.</AppText>
            {INTRO.map(([title, body]) => (
              <View key={title} style={styles.introRow}>
                <AppText variant="caption" color={colors.textPrimary} style={styles.introTitle}>{title}</AppText>
                <AppText variant="caption" color={colors.textSecondary} style={styles.introBody}>{body}</AppText>
              </View>
            ))}
            <Pill primary label="Got it" onPress={() => runInAction(() => settings.dismissDebugIntro())} />
          </View>
        )}

        <View style={styles.pills}>
          <Pill icon={Layers} label={demo.seeded ? 'Demo loaded' : 'Seed demo'} disabled={demo.seeded} onPress={() => container.seedDemo()} />
          <Pill icon={RotateCcw} label="Reset to empty" onPress={() => { container.resetAll(); router.back(); }} />
        </View>

        <Section title="Network">
          <Row icon={WifiOff} label="Offline" right={<Switch value={!connectivity.online} onValueChange={(v) => runInAction(() => connectivity.setOnline(!v))} />} />
          <Row icon={Slash} label="Drop next response" hint="Server accepts, client sees a network error" right={<Switch value={connectivity.faults.dropNextResponse} onValueChange={(v) => set('dropNextResponse', v)} />} />
          <Row icon={Clock} label="Slow network" hint="800 ms latency" right={<Switch value={connectivity.faults.latencyMs > 0} onValueChange={(v) => set('latencyMs', v ? 800 : 0)} />} />
          <Row icon={Cpu} label="Buggy server" hint="No idempotency key → duplicates on retry" right={<Switch value={buggy} onValueChange={(v) => { container.useBuggyServer(v); setBuggy(v); }} trackColor={{ true: colors.error }} />} last />
        </Section>

        <Section title="Fail next send">
          {FAILS.map((f, i) => (
            <Row key={f.label} label={f.label} onPress={() => set('failNextSend', f.value)} right={connectivity.faults.failNextSend === f.value ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null} last={i === FAILS.length - 1} />
          ))}
        </Section>

        <Section title="Messages">
          <Row icon={MessageNotif} label="Inject 4 incoming from the fan" hint={chatId ? 'Written to the mock server and synced right away' : 'Open a thread first'} disabled={!chatId} onPress={() => chatId && container.injectIncoming(chatId)} last />
        </Section>

        <Section title="Next purchase outcome">
          {OUTCOMES.map((o, i) => (
            <Row key={o.value} icon={i === 0 ? Wallet : undefined} label={o.label} onPress={() => pick(o.value)} right={outcome === o.value ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null} last={i === OUTCOMES.length - 1} />
          ))}
        </Section>

        <Tip>Offline on → send three → offline off: incoming messages sync first, then the queue drains in order.</Tip>

      </ScrollView>
    </ModalLayout>
  );
});

export default DevScreen;

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  content: { paddingTop: spacing.xs, gap: spacing.xl },
  pills: { flexDirection: 'row', gap: spacing.md },
  intro: { backgroundColor: colors.primaryTint, borderRadius: radii.card, padding: spacing.lg, gap: spacing.sm },
  introRow: { flexDirection: 'row', gap: spacing.sm },
  introTitle: { width: 120, fontFamily: 'Inter_500Medium' },
  introBody: { flex: 1 },
});
