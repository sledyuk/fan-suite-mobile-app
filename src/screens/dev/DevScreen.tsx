import { router, useLocalSearchParams } from 'expo-router';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KV, Pill, Row, Section, Tip } from '@/components/GroupedList';
import { Check, Clock, Cpu, Layers, MessageNotif, RotateCcw, Slash, Wallet, WifiOff } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { useStores } from '@/hooks/useStores';
import { billingConfig, container } from '@/services/container';
import type { PurchaseOutcome } from '@/services/api/BillingApi';
import type { Faults } from '@/services/mock/faults';
import { colors, spacing } from '@/theme/tokens';

const FAILS: { label: string; value: Faults['failNextSend'] }[] = [
  { label: 'None', value: null }, { label: 'Rate limited (recoverable)', value: 'RATE_LIMITED' }, { label: 'Blocked', value: 'BLOCKED' }, { label: 'Needs payment', value: 'PAYMENT_REQUIRED' },
];
const OUTCOMES: { label: string; value: PurchaseOutcome }[] = [
  { label: 'Success', value: 'success' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Failed', value: 'failed' }, { label: 'Success, backend confirms after 6 s', value: 'success_delayed' },
];

/** Debug sheet in the language of Expo's dev menu: header, pill actions, grouped inset lists, tip, status. Local mock only. */
const DevScreen = observer(function DevScreen() {
  const root = useStores();
  const insets = useSafeAreaInsets();
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const { connectivity, outbox, billing, demo } = root;
  const [buggy, setBuggy] = useState(container.buggyServer);
  const [outcome, setOutcome] = useState<PurchaseOutcome>(billingConfig.outcome);
  const set = <K extends keyof Faults>(k: K, v: Faults[K]) => runInAction(() => connectivity.setFault(k, v));
  const pick = (v: PurchaseOutcome) => { billingConfig.outcome = v; billingConfig.confirmDelayMs = v === 'success_delayed' ? 6000 : 0; setOutcome(v); };
  const counts = { pending: outbox.items.filter((i) => i.status === 'pending').length, sending: outbox.items.filter((i) => i.status === 'sending').length, failed: outbox.items.filter((i) => i.status === 'failed').length };
  const thread = chatId ? root.chat.thread(chatId) : null;

  return (
    <ModalLayout appIcon title="FanSuite" subtitle="Debug controls · local mock only" onClose={() => router.back()} scroll={false}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false} style={styles.scroll}>
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
          <Row icon={MessageNotif} label="Inject 4 incoming from the fan" hint={chatId ? 'Written to the mock server; shows after the next sync' : 'Open a thread first'} disabled={!chatId} onPress={() => chatId && container.injectIncoming(chatId)} last />
        </Section>

        <Section title="Next purchase outcome">
          {OUTCOMES.map((o, i) => (
            <Row key={o.value} icon={i === 0 ? Wallet : undefined} label={o.label} onPress={() => pick(o.value)} right={outcome === o.value ? <Check size={18} color={colors.primary} strokeWidth={2.5} /> : null} last={i === OUTCOMES.length - 1} />
          ))}
        </Section>

        <Tip>Offline on → send three → offline off: incoming messages sync first, then the queue drains in order.</Tip>

        <Section title="Status">
          <KV label="Account" value={demo.seeded ? 'demo' : 'empty'} />
          <KV label="Connection" value={connectivity.syncing ? 'syncing' : connectivity.online ? 'online' : 'offline'} />
          <KV label="Outbox" value={`${counts.pending} pending · ${counts.sending} sending · ${counts.failed} failed`} />
          <KV label="Plan" value={billing.entitlement.status.replace('_', ' ')} />
          <KV label="Unread" value={`${demo.conversations.filter((c) => c.unreadCount > 0).length} chats · ${demo.unreadTotal} messages`} />
          {thread ? <KV label="This thread" value={`${thread.orderedIds.length} loaded · seq ${thread.lastSeq} · server ${container.server.messageCount(chatId!)}`} last /> : <KV label="Fans online" value={String(demo.conversations.filter((c) => c.online).length)} last />}
        </Section>
      </ScrollView>
    </ModalLayout>
  );
});

export default DevScreen;

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  content: { paddingTop: spacing.xs, gap: spacing.xl },
  pills: { flexDirection: 'row', gap: spacing.md },
});
