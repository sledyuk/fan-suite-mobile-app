import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Checkbox } from '@/components/Checkbox';
import { GROUP_BG, Row } from '@/components/GroupedList';
import { BadgeCheck, Layers, Search } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ArrowRight } from '@/components/icons';
import { useStores } from '@/hooks/useStores';
import { suitesFor, type Suite } from '@/services/mock/suites';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

// Selection is part of the row data so the list repaints on every toggle.
type Item =
  | { kind: 'header'; key: string; title: string }
  | { kind: 'suite'; key: string; suite: Suite; selected: boolean; first: boolean; last: boolean }
  | { kind: 'fan'; key: string; id: string; selected: boolean; first: boolean; last: boolean };

/**
 * Recipient picker in the grouped-list language. Ticking a suite ticks every
 * fan in it. One fan → open that thread. Several → "Message to (N) users".
 */
const NewMessageScreen = observer(function NewMessageScreen() {
  const insets = useSafeAreaInsets();
  const { billing, demo } = useStores();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const FANS = useMemo(() => demo.conversations.map((c) => ({ id: c.id, fan: c.fan })), [demo.conversations]);
  const SUITES = useMemo(() => suitesFor(demo.conversations), [demo.conversations]);

  const toggleFan = useCallback((id: string) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const toggleSuite = useCallback((suite: Suite) => setSelected((prev) => {
    const next = new Set(prev); const all = suite.fanIds.every((id) => prev.has(id));
    for (const id of suite.fanIds) all ? next.delete(id) : next.add(id);
    return next;
  }), []);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const suites = SUITES.filter((s) => s.fanIds.length > 0 && (!q || s.name.toLowerCase().includes(q)));
    const fans = FANS.filter(({ fan }) => !q || fan.name.toLowerCase().includes(q) || fan.handle.toLowerCase().includes(q));
    const out: Item[] = [];
    if (suites.length) { out.push({ kind: 'header', key: 'h_s', title: 'FanSuites' }); suites.forEach((s, i) => out.push({ kind: 'suite', key: `s_${s.id}`, suite: s, selected: s.fanIds.every((id) => selected.has(id)), first: i === 0, last: i === suites.length - 1 })); }
    if (fans.length) { out.push({ kind: 'header', key: 'h_f', title: 'Fans' }); fans.forEach(({ id }, i) => out.push({ kind: 'fan', key: `f_${id}`, id, selected: selected.has(id), first: i === 0, last: i === fans.length - 1 })); }
    return out;
  }, [query, selected, FANS, SUITES]);

  const count = selected.size;
  const needsPro = count > 1 && !billing.isActive;   // broadcast is a Pro feature
  const cta = count === 0 ? 'Select recipients' : count === 1 ? 'Start Chat' : needsPro ? `Upgrade to message (${count}) users` : `Message to (${count}) Users`;

  const go = () => {
    if (needsPro) { router.push('/paywall'); return; }
    if (count === 1) { const [id] = selected; router.dismissTo('/messages'); router.push({ pathname: '/chat/[chatId]', params: { chatId: id } }); return; }
    router.push({ pathname: '/new-message/broadcast', params: { fans: [...selected].join(',') } });
  };

  const renderItem = useCallback(({ item }: LegendListRenderItemProps<Item>) => {
    if (item.kind === 'header') return <AppText variant="time" color={colors.textMuted} style={styles.header}>{item.title.toUpperCase()}</AppText>;
    const groupStyle = [styles.groupPart, item.first && styles.groupFirst, item.last && styles.groupLast];
    if (item.kind === 'suite') {
      return (
        <View style={groupStyle}>
          <Row leading={<><Checkbox checked={item.selected} /><Layers size={20} color={colors.textSecondary} /></>} label={item.suite.name} hint={`${item.suite.fanIds.length} fans`} selected={item.selected} onPress={() => toggleSuite(item.suite)} last={item.last} />
        </View>
      );
    }
    const fan = FANS.find((f) => f.id === item.id)!.fan;
    return (
      <View style={groupStyle}>
        <Row
          leading={<><Checkbox checked={item.selected} /><Avatar source={fan.avatar} name={fan.name} size={36} /></>}
          label={fan.name}
          hint={fan.handle}
          right={fan.verified ? <BadgeCheck size={16} color={colors.verified} fill={colors.verified} /> : undefined}
          selected={item.selected}
          onPress={() => toggleFan(item.id)}
          last={item.last}
        />
      </View>
    );
  }, [toggleFan, toggleSuite, FANS]);

  return (
    <ModalLayout title="New message" subtitle={count ? `${count} selected` : 'Pick fans or a whole FanSuite'} onClose={() => router.back()} scroll={false}>
      <View style={styles.search}>
        <Search size={18} color={colors.textPlaceholder} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search for users on FanSuite" placeholderTextColor={colors.textPlaceholder} autoCorrect={false} autoCapitalize="none" returnKeyType="search" style={styles.input} accessibilityLabel="Search recipients" />
      </View>
      <LegendList
        data={items}
        renderItem={renderItem}
        keyExtractor={(i) => i.key}
        getItemType={(i) => i.kind}
        estimatedItemSize={56}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        style={styles.list}
        ListEmptyComponent={<AppText variant="caption" color={colors.textMuted} style={styles.empty}>No fans yet. Load demo data from the debug sheet.</AppText>}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <PrimaryButton label={cta} disabled={count === 0} onPress={go} style={styles.cta} icon={<ArrowRight size={18} color={colors.bg} />} />
      </View>
    </ModalLayout>
  );
});

export default NewMessageScreen;

const styles = StyleSheet.create({
  search: { height: 44, borderRadius: radii.card, backgroundColor: GROUP_BG, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  list: { flex: 1, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  header: { letterSpacing: 0.6, marginLeft: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.sm },
  groupPart: { backgroundColor: GROUP_BG, overflow: 'hidden' },
  groupFirst: { borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card },
  groupLast: { borderBottomLeftRadius: radii.card, borderBottomRightRadius: radii.card },
  empty: { textAlign: 'center', paddingTop: spacing.xxl },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  cta: { borderRadius: 22, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});
