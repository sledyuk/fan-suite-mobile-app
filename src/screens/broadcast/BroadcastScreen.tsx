import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Composer } from '@/components/Composer';
import { ModalLayout } from '@/components/ModalLayout';
import { CONVERSATIONS } from '@/services/mock/conversations';
import { SUITES } from '@/services/mock/suites';
import { colors, radii, spacing } from '@/theme/tokens';

interface Props {
  fanIds: string[];
  suiteIds: string[];
}

interface Sent { id: string; text: string; at: number }

/**
 * "Separate message to (N) users": one text, delivered into each recipient's own
 * thread. For now the send is local; the outbox step turns it into N queued sends
 * with their own client IDs so each gets offline/retry/idempotency for free.
 */
export default function BroadcastScreen({ fanIds, suiteIds }: Props) {
  const insets = useSafeAreaInsets();
  const fans = CONVERSATIONS.filter((c) => fanIds.includes(c.id));
  const suites = SUITES.filter((s) => suiteIds.includes(s.id));
  const count = fans.length + suites.reduce((n, s) => n + s.fanCount, 0);
  const [sent, setSent] = useState<Sent[]>([]);

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
          {suites.map((s) => (
            <View key={s.id} style={styles.chip}>
              <View style={styles.body}><AppText variant="name">{s.name}</AppText><AppText variant="caption" color={colors.textMuted}>{s.fanCount.toLocaleString()} fans</AppText></View>
            </View>
          ))}
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
              Each person gets this as a private message from you. Replies land in their own chat.
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
          <Composer onSend={(text) => setSent((s) => [...s, { id: `${Date.now()}`, text, at: Date.now() }])} autoFocus />
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
