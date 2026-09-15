import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Row, Section } from '@/components/GroupedList';
import { ChevronRight, GitHub, LinkedIn, Mail } from '@/components/icons';
import { ModalLayout } from '@/components/ModalLayout';
import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/theme/tokens';

const AUTHOR = {
  name: 'Bogdan Egikov',
  email: 'sledyuk@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bogdan-egikov/',
  github: 'https://github.com/sledyuk',
};
const appSubtitle = `FanSuite Mobile v${Constants.expoConfig?.version ?? '1.0.0'} - ${__DEV__ ? 'development' : 'release'}`;

export default function AboutScreen() {
  const open = (url: string) => void Linking.openURL(url);
  return (
    <ModalLayout title="About" subtitle={appSubtitle} onClose={() => router.back()} scroll={false} bodyGap={spacing.md}>
      <AppText variant="caption" color={colors.textMuted}>
        Built this app for Fans Holdings as the Senior React Native test task: Expo SDK 57, TypeScript, MobX.
      </AppText>

      <Section title="Contact">
        <Row leading={<Avatar name={AUTHOR.name} size={32} />} label={AUTHOR.name} hint="Developer · React Native" />
        <Row icon={Mail} label={AUTHOR.email} onPress={() => open(`mailto:${AUTHOR.email}?subject=FanSuite%20React%20Native`)} right={<ChevronRight size={18} color={colors.textMuted} />} />
        <Row icon={LinkedIn} label="LinkedIn" hint="linkedin.com/in/bogdan-egikov" onPress={() => open(AUTHOR.linkedin)} right={<ChevronRight size={18} color={colors.textMuted} />} />
        <Row icon={GitHub} label="GitHub" hint="github.com/sledyuk" onPress={() => open(AUTHOR.github)} right={<ChevronRight size={18} color={colors.textMuted} />} last />
      </Section>
    </ModalLayout>
  );
}
