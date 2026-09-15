import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { GROUP_BG, Row, Section } from '@/components/GroupedList';
import { ChevronRight, GitHub, LinkedIn, Mail } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { colors, radii, spacing } from '@/theme/tokens';

const AUTHOR = {
  name: 'Bogdan Egikov',
  role: 'Senior React Native developer',
  email: 'sledyuk@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bogdan-egikov/',
  linkedinLabel: 'linkedin.com/in/bogdan-egikov',
  github: 'https://github.com/sledyuk',
  githubLabel: 'github.com/sledyuk',
};
const version = Constants.expoConfig?.version ?? '1.0.0';
const appSubtitle = `FanSuite Mobile · v${version} · ${__DEV__ ? 'development' : 'release'}`;
const chevron = <ChevronRight size={18} color={colors.textMuted} />;

export default function AboutScreen() {
  const open = (url: string) => void Linking.openURL(url);
  return (
    <ModalLayout title="About" subtitle={appSubtitle} onClose={() => router.back()} scroll={false} bodyGap={spacing.xl}>
      <View style={styles.author}>
        <Avatar name={AUTHOR.name} size={56} />
        <View style={styles.authorText}>
          <AppText variant="title" color={colors.textHeading}>{AUTHOR.name}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{AUTHOR.role}</AppText>
        </View>
      </View>

      <AppText variant="body" color={colors.textSecondary} style={styles.blurb}>
        Built for Fans Holdings as the Senior React Native test task. Expo SDK 57, TypeScript and MobX, with an offline-first outbox and a local mock server.
      </AppText>

      <Section title="Contact">
        <Row icon={Mail} label="Email" hint={AUTHOR.email} onPress={() => open(`mailto:${AUTHOR.email}?subject=FanSuite%20React%20Native`)} right={chevron} />
        <Row icon={LinkedIn} label="LinkedIn" hint={AUTHOR.linkedinLabel} onPress={() => open(AUTHOR.linkedin)} right={chevron} />
        <Row icon={GitHub} label="GitHub" hint={AUTHOR.githubLabel} onPress={() => open(AUTHOR.github)} right={chevron} last />
      </Section>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, backgroundColor: GROUP_BG, borderRadius: radii.card },
  authorText: { flex: 1, gap: 2 },
  blurb: { lineHeight: 22, paddingHorizontal: spacing.xs },
});
