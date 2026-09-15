import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import { ArrowRight, Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { suitesFor, type Suite } from '@/services/mock/suites';
import { colors, fonts, radii, spacing } from '@/theme/tokens';
import { PickerRow } from './PickerRow';

// Selection is part of the row data so the list repaints on every toggle.
type Item =
  | { kind: 'suite'; key: string; suite: Suite; selected: boolean }
  | { kind: 'fan'; key: string; id: string; selected: boolean }
  | { kind: 'divider'; key: string; selected: false };

/**
 * Recipient picker. Ticking a suite ticks every fan in it. One fan → open that
 * thread. Several → "Message to (N) users", delivered separately to each.
 */
const NewMessageScreen = observer(function NewMessageScreen() {
  const insets = useSafeAreaInsets();
  const { billing, demo } = useStores();
  const FANS = useMemo(() => demo.conversations.map((c) => ({ id: c.id, fan: c.fan })), [demo.conversations]);
  const SUITES = useMemo(() => suitesFor(demo.conversations), [demo.conversations]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggleFan = useCallback((id: string) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const toggleSuite = useCallback((suite: Suite) => setSelected((prev) => {
    const next = new Set(prev); const all = suite.fanIds.every((id) => prev.has(id));
    for (const id of suite.fanIds) all ? next.delete(id) : next.add(id);
    return next;
  }), []);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const suiteRows = SUITES
      .filter((s) => s.fanIds.length > 0 && (!q || s.name.toLowerCase().includes(q)))
      .map<Item>((s) => ({ kind: 'suite', key: `s_${s.id}`, suite: s, selected: s.fanIds.every((id) => selected.has(id)) }));
    const fanRows = FANS
      .filter(({ fan }) => !q || fan.name.toLowerCase().includes(q) || fan.handle.toLowerCase().includes(q))
      .map<Item>(({ id }) => ({ kind: 'fan', key: `f_${id}`, id, selected: selected.has(id) }));
    return suiteRows.length && fanRows.length ? [...suiteRows, { kind: 'divider', key: 'div', selected: false }, ...fanRows] : [...suiteRows, ...fanRows];
  }, [query, selected, FANS, SUITES]);

  const count = selected.size;
  const needsPro = count > 1 && !billing.isActive;   // broadcast is a Pro feature
  const cta = count === 0 ? 'Select recipients' : count === 1 ? 'Start Chat' : needsPro ? `Upgrade to message (${count}) users` : `Message to (${count}) Users`;

  const go = () => {
    if (needsPro) { router.push('/paywall'); return; }
    if (count === 1) { const [id] = selected; router.dismissTo('/chats'); router.push({ pathname: '/chat/[chatId]', params: { chatId: id } }); return; }
    router.push({ pathname: '/new-message/broadcast', params: { fans: [...selected].join(',') } });
  };

  const renderItem = useCallback(({ item }: LegendListRenderItemProps<Item>) => {
    if (item.kind === 'divider') return <View style={styles.divider} />;
    if (item.kind === 'suite') return <PickerRow kind="suite" suite={item.suite} selected={item.selected} onToggle={() => toggleSuite(item.suite)} />;
    return <PickerRow kind="fan" id={item.id} fan={FANS.find((f) => f.id === item.id)!.fan} selected={item.selected} onToggle={() => toggleFan(item.id)} />;
  }, [toggleFan, toggleSuite, FANS]);

  return (
    <ModalLayout title="New message" onClose={() => router.back()} scroll={false}>
      <View style={styles.search}>
        <Search size={18} color={colors.textPlaceholder} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for users on FanSuite"
          placeholderTextColor={colors.textPlaceholder}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={styles.input}
          accessibilityLabel="Search recipients"
        />
      </View>
      <LegendList
        data={items}
        renderItem={renderItem}
        keyExtractor={(i) => i.key}
        getItemType={(i) => i.kind}
        estimatedItemSize={76}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: spacing.md, paddingBottom: 96 + insets.bottom }}
        style={styles.list}
        ListEmptyComponent={<AppText variant="caption" color={colors.textMuted} style={styles.empty}>No fans yet. Load demo data from the debug sheet.</AppText>}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <PrimaryButton
          label={cta}
          disabled={count === 0}
          onPress={go}
          style={styles.cta}
          icon={<ArrowRight size={18} color={colors.bg} strokeWidth={2.25} />}
        />
      </View>
    </ModalLayout>
  );
});

export default NewMessageScreen;

const styles = StyleSheet.create({
  search: { height: 44, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  list: { flex: 1, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  empty: { textAlign: 'center', paddingTop: spacing.xxl },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  // iOS 26 capsule with a soft shadow so it reads as floating over the list.
  cta: { borderRadius: 22, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});
