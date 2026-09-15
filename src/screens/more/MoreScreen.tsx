import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';
import { Bell, ChevronRight, CircleHelp, Info, RotateCcw, Shield, type LucideIcon } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { useSecretTap } from '@/hooks/useSecretTap';
import { container } from '@/services/container';
import { ME } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';

const version = `${Constants.expoConfig?.version ?? '1.0.0'} · ${__DEV__ ? 'development' : 'release'}`;

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const secret = useSecretTap(() => router.push('/hire'));

  const reset = () => Alert.alert('Reset demo data?', 'Clears the outbox, the plan and the mock server, then reseeds the history.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: () => container.resetAll() },
  ]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'More' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 88 }]}>
        <View style={styles.profile}>
          <Avatar source={ME.avatar} name={ME.name} size={56} />
          <View style={styles.body}>
            <AppText variant="title" color={colors.textHeading}>{ME.name}</AppText>
            <AppText variant="caption" color={colors.primary}>{ME.handle}</AppText>
          </View>
        </View>

        <Group>
          <Row icon={Bell} label="Notifications" hint="Push, email, quiet hours" />
          <Row icon={Shield} label="Privacy" hint="Blocked fans, visibility" last />
        </Group>

        <Group>
          <Row icon={CircleHelp} label="Help" hint="Guides and support" />
          <Row icon={Info} label="About" hint={version} onPress={secret} last />
        </Group>

        <Group>
          <Row icon={RotateCcw} label="Reset demo data" hint="Outbox, plan, mock server" tone={colors.error} onPress={reset} last />
        </Group>
      </ScrollView>
    </View>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function Row({ icon: Icon, label, hint, onPress, tone = colors.textPrimary, last }: { icon: LucideIcon; label: string; hint: string; onPress?: () => void; tone?: string; last?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}. ${hint}`} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.bgSubtle }]}>
      <Icon size={20} color={tone} strokeWidth={2} />
      <View style={styles.body}>
        <AppText color={tone}>{label}</AppText>
        <AppText variant="time" color={colors.textMuted}>{hint}</AppText>
      </View>
      {onPress && tone === colors.textPrimary && <ChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  body: { flex: 1, gap: 2 },
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
});
