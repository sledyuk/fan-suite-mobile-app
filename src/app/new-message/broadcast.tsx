import { useLocalSearchParams } from 'expo-router';
import BroadcastScreen from '@/screens/broadcast';

export default function BroadcastRoute() {
  const { fans } = useLocalSearchParams<{ fans?: string }>();
  return <BroadcastScreen fanIds={fans ? fans.split(',') : []} />;
}
