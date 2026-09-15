import { router, useLocalSearchParams } from 'expo-router';
import { runInAction } from 'mobx';
import { useEffect } from 'react';
import { useStores } from '@/hooks/useStores';
import DevScreen from '@/screens/dev';
import { billingConfig, container } from '@/services/container';

type Run = 'seed' | 'reset' | 'offline' | 'online' | 'send' | 'inject' | 'drop' | 'buggy' | 'fail' | 'outcome';

/**
 * Debug sheet. With `?run=` it executes one scripted action and closes, so the
 * demo flows can be driven from deep links (recordings, simulator automation):
 *   dev?run=seed | reset | offline | online | inject&chatId=rick | drop
 *   dev?run=send&chatId=rick&text=hello   dev?run=buggy&on=1
 *   dev?run=fail&code=BLOCKED             dev?run=outcome&value=success_delayed
 */
export default function DevRoute() {
  const p = useLocalSearchParams<{ run?: Run; chatId?: string; text?: string; on?: string; code?: string; value?: string }>();
  const root = useStores();

  useEffect(() => {
    if (!p.run) return;
    runInAction(() => {
      switch (p.run) {
        case 'seed': container.seedDemo(); break;
        case 'reset': container.resetAll(); break;
        case 'offline': root.connectivity.setOnline(false); break;
        case 'online': root.connectivity.setOnline(true); break;
        case 'send': if (p.chatId && p.text) root.outbox.enqueue(p.chatId, p.text); break;
        case 'inject': if (p.chatId) container.injectIncoming(p.chatId); break;
        case 'drop': root.connectivity.setFault('dropNextResponse', true); break;
        case 'buggy': container.useBuggyServer(p.on === '1'); break;
        case 'fail': root.connectivity.setFault('failNextSend', (p.code as never) ?? null); break;
        case 'outcome': billingConfig.outcome = (p.value as never) ?? 'success'; billingConfig.confirmDelayMs = p.value === 'success_delayed' ? 6000 : 0; break;
      }
    });
    router.back();
  }, [p.run, p.chatId, p.text, p.on, p.code, p.value, root]);

  if (p.run) return null;
  return <DevScreen />;
}
