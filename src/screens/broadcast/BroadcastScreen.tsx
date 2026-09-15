import { router } from 'expo-router';
import { runInAction } from 'mobx';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Composer } from '@/components/Composer';
import { ModalLayout } from '@/components/ModalLayout';
import { useStores } from '@/hooks/useStores';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  fanIds: string[];
}

interface Sent { id: string; text: string; at: number }

export default function BroadcastScreen({ fanIds }: Props) {
  const insets = useSafeAreaInsets();
  const { demo, outbox } = useStores();
  const fans = demo.conversations.filter((c) => fanIds.includes(c.id));
  const count = fans.length;
  const [sent, setSent] = useState<Sent[]>([]);
  // Each fan gets a normal outbox item, so the broadcast is persisted, drained in order, retried and de-duplicated
  // exactly like a message typed in that fan's chat.
  const broadcast = (text: string) => {
    try { runInAction(() => { for (const c of fans) outbox.enqueue(c.id, text); }); }
    catch { return; }
    setSent((s) => [...s, { id: `${Date.now()}`, text, at: Date.now() }]);
  };

  return (
    <ModalLayout
      title={`Message to (${count}) users`}
      subtitle="Sent separately to each person"
      onClose={() => router.dismiss()}
      onBack={() => router.back()}
      scroll={false}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill} keyboardVerticalOffset={insets.top + 60}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsRow}>
          {fans.map((c) => (
            <View key={c.id} style={styles.chip}>
              <Avatar source={c.fan.avatar} name={c.fan.name} size={40} />
              <View style={styles.body}><AppText variant="name">{c.fan.name}</AppText><AppText variant="caption" color={colors.textMuted}>{c.fan.handle}</AppText></View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.rule} />
        <ScrollView style={styles.fill} contentContainerStyle={styles.thread} keyboardDismissMode="interactive">
          {sent.length === 0 ? (
            <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
              Each person gets this as a private message from you, queued and delivered like any other send. Replies land in their own chat.
            </AppText>
          ) : (
            sent.map((m) => (
              <View key={m.id} style={styles.bubble}>
                <AppText>{m.text}</AppText>
                <AppText variant="time" color={colors.textMuted} style={styles.time}>Now</AppText>
              </View>
            ))
          )}
        </ScrollView>
        <View style={styles.composer}>
          <Composer onSend={broadcast} autoFocus />
        </View>
      </KeyboardAvoidingView>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chipsRow: { flexGrow: 0 },
  chips: { gap: spacing.md, paddingVertical: spacing.xs },
  chip: { minWidth: 160, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg },
  body: { justifyContent: 'center' },
  rule: { height: 1, backgroundColor: colors.border, marginTop: spacing.md, marginHorizontal: -spacing.lg },
  thread: { paddingVertical: spacing.lg, gap: spacing.md },
  hint: { textAlign: 'center', paddingHorizontal: spacing.xl },
  bubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: colors.primaryTint, borderRadius: radii.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  time: { marginTop: spacing.sm },
  composer: { paddingTop: spacing.sm },
});
