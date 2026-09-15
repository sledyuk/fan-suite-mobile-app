import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Check, Clock, Cpu, Lamp, Layers, MessageNotif, RotateCcw, Slash, Wallet, WifiOff, X, type IconComponent } from '@/components/icons';
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
const GROUP_BG = '#F2F2F7';

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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
        <View style={styles.titles}>
          <AppText variant="title" color={colors.textHeading}>FanSuite</AppText>
          <AppText variant="caption" color={colors.textMuted}>Debug controls · local mock only</AppText>
        </View>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}>
          <X size={18} color={colors.textMuted} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false}>
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

        <View style={styles.tip}>
          <View style={styles.tipHead}><Lamp size={16} color={colors.verified} /><AppText variant="name" color={colors.verified}>Tip</AppText></View>
          <AppText variant="caption" color={colors.textSecondary}>Offline on → send three → offline off: incoming messages sync first, then the queue drains in order.</AppText>
        </View>

        <Section title="Status">
          <KV label="Account" value={demo.seeded ? 'demo' : 'empty'} />
          <KV label="Connection" value={connectivity.syncing ? 'syncing' : connectivity.online ? 'online' : 'offline'} />
          <KV label="Outbox" value={`${counts.pending} pending · ${counts.sending} sending · ${counts.failed} failed`} />
          <KV label="Plan" value={billing.entitlement.status.replace('_', ' ')} />
          <KV label="Unread" value={`${demo.conversations.filter((c) => c.unreadCount > 0).length} chats · ${demo.unreadTotal} messages`} />
          {thread ? <KV label="This thread" value={`${thread.orderedIds.length} loaded · seq ${thread.lastSeq} · server ${container.server.messageCount(chatId!)}`} last /> : <KV label="Fans online" value={String(demo.conversations.filter((c) => c.online).length)} last />}
        </Section>
      </ScrollView>
    </View>
  );
});

export default DevScreen;

function Pill({ icon: Icon, label, onPress, disabled }: { icon: IconComponent; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled }} style={({ pressed }) => [styles.pill, pressed && { opacity: 0.7 }, disabled && { opacity: 0.45 }]}>
      <Icon size={20} color={colors.textPrimary} />
      <AppText variant="body" color={colors.textPrimary} style={styles.pillLabel}>{label}</AppText>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="time" color={colors.textMuted} style={styles.sectionTitle}>{title.toUpperCase()}</AppText>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Row({ icon: Icon, label, hint, right, onPress, disabled, last }: { icon?: IconComponent; label: string; hint?: string; right?: React.ReactNode; onPress?: () => void; disabled?: boolean; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress || disabled} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={hint ? `${label}. ${hint}` : label} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && onPress && styles.rowPressed, disabled && { opacity: 0.45 }]}>
      {Icon && <Icon size={20} color={colors.textSecondary} />}
      <View style={styles.rowText}>
        <AppText>{label}</AppText>
        {hint && <AppText variant="time" color={colors.textMuted}>{hint}</AppText>}
      </View>
      {right}
    </Pressable>
  );
}

function KV({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <AppText style={styles.rowText}>{label}</AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.kv}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  appIcon: { width: 44, height: 44, borderRadius: 22 },
  titles: { flex: 1 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: GROUP_BG, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.xl },
  pills: { flexDirection: 'row', gap: spacing.md },
  pill: { flex: 1, height: 64, borderRadius: radii.card, backgroundColor: GROUP_BG, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  pillLabel: { fontSize: 16 },
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 0.6, marginLeft: spacing.xs },
  group: { backgroundColor: GROUP_BG, borderRadius: radii.card, overflow: 'hidden' },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowPressed: { backgroundColor: colors.divider },
  rowText: { flex: 1, gap: 1 },
  kv: { flexShrink: 1, textAlign: 'right' },
  tip: { backgroundColor: '#E8F3FD', borderRadius: radii.card, padding: spacing.lg, gap: spacing.xs },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
