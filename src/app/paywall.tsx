import { router } from 'expo-router';
import { AppText } from '@/components/AppText';
import { ModalLayout } from '@/components/ModalLayout';
import { colors } from '@/theme/tokens';

/** Placeholder until the billing step lands (see spec §2). */
export default function PaywallRoute() {
  return (
    <ModalLayout title="Subscription" subtitle="Simulated billing" onClose={() => router.back()}>
      <AppText variant="caption" color={colors.textMuted}>Paywall coming in the billing step.</AppText>
    </ModalLayout>
  );
}
