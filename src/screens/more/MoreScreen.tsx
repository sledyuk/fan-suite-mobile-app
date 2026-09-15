import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';
import { Bell, Bug, ChevronRight, CircleHelp, Info, Shield, type IconComponent } from '@/components/icons';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { useSecretTap } from '@/hooks/useSecretTap';
import { useStores } from '@/hooks/useStores';
import { ME } from '@/services/mock/participants';
import { colors, radii, spacing } from '@/theme/tokens';

const version = `${Constants.expoConfig?.version ?? '1.0.0'} · ${__DEV__ ? 'development' : 'release'}`;

const MoreScreen = observer(function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useStores();
  const secret = useSecretTap(() => router.push('/hire'));

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
          <Row icon={Bug} label="Developer mode" hint="Floating debug button on every screen" last
            right={<Switch value={settings.developerMode} onValueChange={(v) => runInAction(() => settings.setDeveloperMode(v))} trackColor={{ true: colors.primary }} />} />
        </Group>
      </ScrollView>
    </View>
  );
});

export default MoreScreen;

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function Row({ icon: Icon, label, hint, onPress, tone = colors.textPrimary, last, right }: { icon: IconComponent; label: string; hint: string; onPress?: () => void; tone?: string; last?: boolean; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}. ${hint}`} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.bgSubtle }]}>
      <Icon size={20} color={tone} strokeWidth={2} />
      <View style={styles.body}>
        <AppText color={tone}>{label}</AppText>
        <AppText variant="time" color={colors.textMuted}>{hint}</AppText>
      </View>
      {right ?? (onPress && tone === colors.textPrimary && <ChevronRight size={18} color={colors.textMuted} />)}
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
