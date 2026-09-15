import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { ModalLayout } from '@/components/ModalLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radii, spacing } from '@/theme/tokens';

const EMAIL = 'sledyuk@gmail.com';

/** Easter egg: five taps on the version row in More. Just for fun. */
export default function HireScreen() {
  return (
    <ModalLayout title="Next hire" subtitle="You found the secret screen" onClose={() => router.back()}>
      <View style={styles.card}>
        <Avatar name="Bogdan Egikov" size={88} />
        <AppText variant="title" color={colors.textHeading} style={styles.name}>Bogdan Egikov</AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.line}>
          Built the chat you just tested: offline outbox, idempotent sends, native iOS 26 navigation, simulated billing.
        </AppText>
        <AppText variant="caption" color={colors.primary}>{EMAIL}</AppText>
      </View>
      <PrimaryButton label="Email Bogdan" icon={<Mail size={18} color={colors.bg} strokeWidth={2} />} onPress={() => void Linking.openURL(`mailto:${EMAIL}?subject=FanSuite%20React%20Native`)} />
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderRadius: radii.card, backgroundColor: colors.primaryTint },
  name: { marginTop: spacing.xs },
  line: { textAlign: 'center' },
});
