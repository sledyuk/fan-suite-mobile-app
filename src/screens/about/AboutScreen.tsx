import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { KV, Row, Section } from '@/components/GroupedList';
import { ChevronRight, GitHub, LinkedIn, Mail } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { colors, spacing } from '@/theme/tokens';

const AUTHOR = {
  name: 'Bogdan Egikov',
  email: 'sledyuk@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bogdan-egikov/',
  github: 'https://github.com/sledyuk',
};
const version = `${Constants.expoConfig?.version ?? '1.0.0'} · ${__DEV__ ? 'development' : 'release'}`;

/** Who built this and what it covers. Test task for Fans Holdings (FanSuite). */
export default function AboutScreen() {
  const open = (url: string) => void Linking.openURL(url);
  return (
    <ModalLayout title="About" subtitle="FanSuite · React Native test task" onClose={() => router.back()}>
      <View style={styles.author}>
        <Avatar name={AUTHOR.name} size={72} />
        <AppText variant="title" color={colors.textHeading}>{AUTHOR.name}</AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.center}>
          Built this app for Fans Holdings as the Senior React Native test task: Expo SDK 57, TypeScript, MobX.
        </AppText>
      </View>

      <Section title="Contact">
        <Row icon={Mail} label={AUTHOR.email} onPress={() => open(`mailto:${AUTHOR.email}?subject=FanSuite%20React%20Native`)} right={<ChevronRight size={18} color={colors.textMuted} />} />
        <Row icon={LinkedIn} label="LinkedIn" hint="linkedin.com/in/bogdan-egikov" onPress={() => open(AUTHOR.linkedin)} right={<ChevronRight size={18} color={colors.textMuted} />} />
        <Row icon={GitHub} label="GitHub" hint="github.com/sledyuk" onPress={() => open(AUTHOR.github)} right={<ChevronRight size={18} color={colors.textMuted} />} last />
      </Section>

      <Section title="App">
        <KV label="Version" value={version} />
        <KV label="Expo SDK" value={Constants.expoConfig?.sdkVersion ?? '57'} last />
      </Section>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  author: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  center: { textAlign: 'center', maxWidth: 300 },
});
