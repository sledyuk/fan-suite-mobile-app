import { Redirect, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import FanDetailsScreen from '@/screens/fan-details';

const FanDetailsRoute = observer(function FanDetailsRoute() {
  const { fanId } = useLocalSearchParams<{ fanId: string }>();
  const conversation = useStores().demo.find(fanId);
  if (!conversation) return <Redirect href="/messages" />;
  return <FanDetailsScreen conversation={conversation} />;
});

export default FanDetailsRoute;
