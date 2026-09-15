import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useStores } from '@/hooks/useStores';
import { billingConfig, container } from '@/services/container';
import type { PurchaseOutcome } from '@/services/api/BillingApi';
import type { Faults } from '@/services/mock/faults';
import { colors, radii, spacing } from '@/theme/tokens';

const FAILS: { label: string; value: Faults['failNextSend'] }[] = [
  { label: 'None', value: null }, { label: 'Rate limited', value: 'RATE_LIMITED' }, { label: 'Blocked', value: 'BLOCKED' }, { label: 'Needs payment', value: 'PAYMENT_REQUIRED' },
];

const OUTCOMES: { label: string; value: PurchaseOutcome }[] = [
  { label: 'Success', value: 'success' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'Failed', value: 'failed' }, { label: 'Delayed confirm', value: 'success_delayed' },
];

/** Local mock controls for the failure scenarios in the brief. Never shipped to users. */
const DevScreen = observer(function DevScreen() {
  const root = useStores();
  const { chatId } = useLocalSearchParams<{ chatId?: string }>();
  const { connectivity, outbox, billing, demo } = root;
  const [outcome, setOutcome] = useState<PurchaseOutcome>(billingConfig.outcome);
  const pick = (v: PurchaseOutcome) => { billingConfig.outcome = v; billingConfig.confirmDelayMs = v === 'success_delayed' ? 6000 : 0; setOutcome(v); };
  const [buggy, setBuggy] = useState(container.buggyServer);
  const set = <K extends keyof Faults>(k: K, v: Faults[K]) => runInAction(() => connectivity.setFault(k, v));
  const counts = { pending: outbox.items.filter((i) => i.status === 'pending').length, sending: outbox.items.filter((i) => i.status === 'sending').length, failed: outbox.items.filter((i) => i.status === 'failed').length };
  const convs = demo.conversations;
  const stats = {
    conversations: convs.length,
    unreadChats: convs.filter((c) => c.unreadCount > 0).length,
    unreadMessages: demo.unreadTotal,
    online: convs.filter((c) => c.online).length,
    mineLast: convs.filter((c) => c.last.from === 'creator').length,
    seen: convs.filter((c) => c.last.from === 'creator' && c.last.status === 'seen').length,
  };
  const thread = chatId ? root.chat.thread(chatId) : null;

  return (
    <ModalLayout title="Debug controls" subtitle="Local mock only" onClose={() => router.back()}>
      <View style={styles.seedRow}>
        <PrimaryButton label={demo.seeded ? 'Demo data loaded' : 'Seed demo data'} disabled={demo.seeded} onPress={() => container.seedDemo()} style={styles.seedBtn} />
        <Pressable onPress={() => { container.resetAll(); router.back(); }} accessibilityRole="button" style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}>
          <AppText variant="badge" color={colors.error}>Reset to empty</AppText>
        </Pressable>
      </View>
      <AppText variant="time" color={colors.textMuted}>Empty = fresh account (no chats, zero balance, free plan). Seed = demo conversations, wallet and 50k-message threads.</AppText>
      <Row label="Offline" hint="Sends queue and show “Sending…”">
        <Switch value={!connectivity.online} onValueChange={(v) => runInAction(() => connectivity.setOnline(!v))} trackColor={{ true: colors.primary }} />
      </Row>
      <Row label="Drop next response" hint="Server accepts, client sees a network error">
        <Switch value={connectivity.faults.dropNextResponse} onValueChange={(v) => set('dropNextResponse', v)} trackColor={{ true: colors.primary }} />
      </Row>
      <Row label="Slow network" hint="800 ms latency">
        <Switch value={connectivity.faults.latencyMs > 0} onValueChange={(v) => set('latencyMs', v ? 800 : 0)} trackColor={{ true: colors.primary }} />
      </Row>
      <Row label="Buggy server" hint="No idempotency key → duplicates on retry">
        <Switch value={buggy} onValueChange={(v) => { container.useBuggyServer(v); setBuggy(v); }} trackColor={{ true: colors.error }} />
      </Row>

      <AppText variant="caption" color={colors.textMuted}>Fail next send</AppText>
      <View style={styles.segments}>
        {FAILS.map((f) => {
          const on = connectivity.faults.failNextSend === f.value;
          return (
            <Pressable key={f.label} onPress={() => set('failNextSend', f.value)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.segment, on && styles.segmentOn]}>
              <AppText variant="time" color={on ? colors.bg : colors.textPrimary}>{f.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton label="Inject 4 incoming from the fan" disabled={!chatId} onPress={() => chatId && container.injectIncoming(chatId)} />
      <AppText variant="time" color={colors.textMuted}>Written straight into the mock server. Visible after the next sync (reconnect).</AppText>

      <AppText variant="caption" color={colors.textMuted}>Next purchase outcome</AppText>
      <View style={styles.segments}>
        {OUTCOMES.map((o) => {
          const on = outcome === o.value;
          return (
            <Pressable key={o.value} onPress={() => pick(o.value)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.segment, on && styles.segmentOn]}>
              <AppText variant="time" color={on ? colors.bg : colors.textPrimary}>{o.label}</AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="time" color={colors.textMuted}>Delayed confirm = store says purchased, backend takes 6 s.</AppText>

      <View style={styles.status}>
        <AppText variant="caption">Status</AppText>
        <AppText variant="time" color={colors.textMuted}>account {demo.seeded ? 'demo' : 'empty'} · online {String(connectivity.online)} · syncing {String(connectivity.syncing)}</AppText>
        <AppText variant="time" color={colors.textMuted}>outbox: {counts.pending} pending · {counts.sending} sending · {counts.failed} failed</AppText>
        <AppText variant="time" color={colors.textMuted}>plan: {billing.entitlement.status}{billing.entitlement.receiptId ? ` · ${billing.entitlement.receiptId.slice(-6)}` : ''}</AppText>
        <AppText variant="time" color={colors.textMuted}>chats: {stats.conversations} · unread chats {stats.unreadChats} · unread messages {stats.unreadMessages} · online {stats.online}</AppText>
        <AppText variant="time" color={colors.textMuted}>last message mine: {stats.mineLast} · seen by fan {stats.seen}</AppText>
        {thread && <AppText variant="time" color={colors.textMuted}>this thread: {thread.orderedIds.length} loaded · lastSeq {thread.lastSeq} · server {container.server.messageCount(chatId!)} · outbox {outbox.forChat(chatId!).length}</AppText>}
      </View>

    </ModalLayout>
  );
});

export default DevScreen;

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <AppText>{label}</AppText>
        <AppText variant="time" color={colors.textMuted}>{hint}</AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1, gap: 2 },
  segments: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  segment: { paddingHorizontal: spacing.md, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  status: { padding: spacing.md, borderRadius: radii.card, backgroundColor: colors.bgPanel, gap: 2 },
  seedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  seedBtn: { flex: 1 },
  clearBtn: { height: 44, paddingHorizontal: spacing.md, borderRadius: radii.lg, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
});
