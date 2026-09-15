import { useLocalSearchParams } from 'expo-router';
import BroadcastScreen from '@/screens/broadcast';

export default function BroadcastRoute() {
  const { fans, suites } = useLocalSearchParams<{ fans?: string; suites?: string }>();
  return <BroadcastScreen fanIds={fans ? fans.split(',') : []} suiteIds={suites ? suites.split(',') : []} />;
}
