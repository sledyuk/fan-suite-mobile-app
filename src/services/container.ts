import { runInAction } from 'mobx';
import type { ChatApi } from '@/services/api/ChatApi';
import { CONVERSATIONS } from '@/services/mock/conversations';
import type { PurchaseOutcome } from '@/services/api/BillingApi';
import { MockBackendBilling } from '@/services/mock/MockBackendBilling';
import { MockChatServer } from '@/services/mock/MockChatServer';
import { MockPurchases } from '@/services/mock/MockPurchases';
import { NaiveChatServer } from '@/services/mock/NaiveChatServer';
import { clientKV, serverKV } from '@/storage/kvStorage';
import { RootStore } from '@/stores/RootStore';
import { startWorkers } from '@/workers/startWorkers';
import { syncOnce } from '@/workers/syncWorker';

const seedFor = (chatId: string) => CONVERSATIONS.find((c) => c.id === chatId)?.seed ?? 42;
const seedCount = () => (root.demo.seeded ? 50_000 : 0);
const tailFor = (chatId: string) => {
  const c = root.demo.find(chatId);
  if (!c) return [];
  const { last } = c;
  if (last.from === 'fan') return [{ authorId: 'fan' as const, text: last.text, createdAt: last.at }];
  if (last.status === 'delivered' || last.status === 'seen') return [{ authorId: 'creator' as const, text: last.text, createdAt: last.at }];
  return [];
};
const listeners = new Set<() => void>();

export const billingConfig: { outcome: PurchaseOutcome; confirmDelayMs: number } = { outcome: 'success', confirmDelayMs: 0 };
const purchases = new MockPurchases(() => billingConfig, clientKV);
const backend = new MockBackendBilling(() => billingConfig);

let root = new RootStore(clientKV, purchases, backend);
if (root.billing.isAwaiting) void root.billing.checkAgain();
const faults = () => root.connectivity.faults;
let server: MockChatServer = new MockChatServer(serverKV, faults, { seedFor, seedCount, tailFor });
let stop = startWorkers(root, server);
let buggy = false;

export const container = {
  get root() { return root; },
  get chatApi(): ChatApi { return server; },
  get server() { return server; },
  get buggyServer() { return buggy; },

  useBuggyServer(on: boolean) {
    buggy = on; stop();
    server = on ? new NaiveChatServer(serverKV, faults, { seedFor, seedCount, tailFor }) : new MockChatServer(serverKV, faults, { seedFor, seedCount, tailFor });
    stop = startWorkers(root, server);
  },

  injectIncoming(chatId: string) {
    server.injectIncoming(chatId, ['Morty. MORTY. Where are you?', 'New stream idea. It involves lasers.', 'Tonight, 8pm. Bring the plumbus.', 'Thanks for the support. Do not tell Jerry.']);
    if (root.connectivity.online) void syncOnce(root, server);
  },

  resetAll() {
    stop(); root.dispose();
    clientKV.clear(); serverKV.clear();
    root = new RootStore(clientKV, purchases, backend); buggy = false;
    billingConfig.outcome = 'success'; billingConfig.confirmDelayMs = 0;
    server = new MockChatServer(serverKV, faults, { seedFor, seedCount, tailFor });
    stop = startWorkers(root, server);
    listeners.forEach((l) => l());
  },

  seedDemo() {
    runInAction(() => {
      serverKV.clear(); root.chat.clear(); server.reset(); root.outbox.clear();
      root.demo.seed();
      for (const c of root.demo.conversations) {
        const { last } = c;
        if (last.from !== 'creator' || last.status === 'delivered' || last.status === 'seen') continue;
        const item = root.outbox.enqueue(c.id, last.text, { createdAt: last.at });
        if (last.status === 'failed') root.outbox.markFailed(item.clientId, { code: 'NETWORK', recoverable: true, message: "Couldn't reach the server" });
      }
    });
  },

  onReset(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};
