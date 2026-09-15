import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { router } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CONVERSATIONS } from '@/services/mock/conversations';
import { SUITES, type Suite } from '@/services/mock/suites';
import { colors, fonts, radii, spacing } from '@/theme/tokens';
import { PickerRow } from './PickerRow';

type Item = { kind: 'suite'; key: string; suite: Suite } | { kind: 'fan'; key: string; id: string } | { kind: 'divider'; key: string };

const FANS = CONVERSATIONS.map((c) => ({ id: c.id, fan: c.fan }));

/**
 * Recipient picker. One fan → open that thread. Several fans and/or a suite →
 * "Separate message to (N) users": the same text delivered into each thread.
 */
export default function NewMessageScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [fans, setFans] = useState<Set<string>>(new Set());
  const [suites, setSuites] = useState<Set<string>>(new Set());

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const suiteRows = SUITES.filter((s) => !q || s.name.toLowerCase().includes(q)).map<Item>((s) => ({ kind: 'suite', key: `s_${s.id}`, suite: s }));
    const fanRows = FANS.filter(({ fan }) => !q || fan.name.toLowerCase().includes(q) || fan.handle.toLowerCase().includes(q)).map<Item>(({ id }) => ({ kind: 'fan', key: `f_${id}`, id }));
    return suiteRows.length && fanRows.length ? [...suiteRows, { kind: 'divider', key: 'div' }, ...fanRows] : [...suiteRows, ...fanRows];
  }, [query]);

  const toggle = (set: Set<string>, id: string) => { const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); return next; };

  const recipientCount = fans.size + [...suites].reduce((n, id) => n + (SUITES.find((s) => s.id === id)?.fanCount ?? 0), 0);
  const single = fans.size === 1 && suites.size === 0;
  const cta = recipientCount === 0 ? 'Select recipients' : single ? 'Start Chat' : `Message to (${recipientCount}) Users`;

  const go = () => {
    if (single) { const [id] = fans; router.dismissTo('/chats'); router.push({ pathname: '/chat/[chatId]', params: { chatId: id } }); return; }
    router.push({ pathname: '/new-message/broadcast', params: { fans: [...fans].join(','), suites: [...suites].join(',') } });
  };

  const renderItem = useCallback(({ item }: LegendListRenderItemProps<Item>) => {
    if (item.kind === 'divider') return <View style={styles.divider} />;
    if (item.kind === 'suite') return <PickerRow kind="suite" suite={item.suite} selected={suites.has(item.suite.id)} onToggle={() => setSuites((s) => toggle(s, item.suite.id))} />;
    const fan = FANS.find((f) => f.id === item.id)!.fan;
    return <PickerRow kind="fan" id={item.id} fan={fan} selected={fans.has(item.id)} onToggle={() => setFans((s) => toggle(s, item.id))} />;
  }, [fans, suites]);

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
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <PrimaryButton
          label={cta}
          disabled={recipientCount === 0}
          onPress={go}
          icon={<ArrowRight size={18} color={colors.bg} strokeWidth={2.25} />}
        />
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  search: { height: 44, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
  list: { flex: 1, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'flex-end', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
