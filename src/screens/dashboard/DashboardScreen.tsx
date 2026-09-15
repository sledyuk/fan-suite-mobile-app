import { Stack } from 'expo-router';
import { LayoutDashboard } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { DebugButton } from '@/components/DebugButton';
import { EmptyState } from '@/components/EmptyState';
import { useStores } from '@/hooks/useStores';
import { formatSchmeckles } from '@/lib/money';
import { colors, radii, spacing } from '@/theme/tokens';
import { PlanCard } from './PlanCard';

const DashboardScreen = observer(function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { demo } = useStores();
  const online = demo.conversations.filter((c) => c.online).length;
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Dashboard', headerRight: () => <DebugButton /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <PlanCard />
        <View style={styles.tiles}>
          <Tile label="This month" value={formatSchmeckles(demo.wallet.thisMonth)} />
          <Tile label="Balance" value={formatSchmeckles(demo.wallet.balance)} />
          <Tile label="Fans online" value={String(online)} />
          <Tile label="Unread" value={String(demo.unreadTotal)} />
        </View>
        {!demo.seeded && <EmptyState icon={LayoutDashboard} title="Your studio is empty" body="Earnings and fan activity appear here once fans subscribe. Load the demo to see it populated." seedable />}
      </ScrollView>
    </View>
  );
});

export default DashboardScreen;

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
