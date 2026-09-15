import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { formatSchmeckles } from '@/lib/money';
import { CONVERSATIONS } from '@/services/mock/conversations';
import { WALLET } from '@/services/mock/wallet';
import { colors, radii, spacing } from '@/theme/tokens';
import { PlanCard } from './PlanCard';

const online = CONVERSATIONS.filter((c) => c.online).length;
const unread = CONVERSATIONS.reduce((n, c) => n + c.unreadCount, 0);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <PlanCard />
        <View style={styles.tiles}>
          <Tile label="This month" value={formatSchmeckles(WALLET.thisMonth)} />
          <Tile label="Balance" value={formatSchmeckles(WALLET.balance)} />
          <Tile label="Fans online" value={String(online)} />
          <Tile label="Unread" value={String(unread)} />
        </View>
      </ScrollView>
    </View>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <AppText variant="time" color={colors.textMuted}>{label}</AppText>
      <AppText variant="title" color={colors.textHeading} style={styles.tileValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '47%', flexGrow: 1, padding: spacing.lg, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  tileValue: { fontSize: 20, lineHeight: 26, fontVariant: ['tabular-nums'] },
});
