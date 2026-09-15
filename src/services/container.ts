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

const seedFor = (chatId: string) => CONVERSATIONS.find((c) => c.id === chatId)?.seed ?? 42;
const listeners = new Set<() => void>();

/** Dev-sheet knobs for the billing mocks. */
export const billingConfig: { outcome: PurchaseOutcome; confirmDelayMs: number } = { outcome: 'success', confirmDelayMs: 0 };
const purchases = new MockPurchases(() => billingConfig, clientKV);
const backend = new MockBackendBilling(() => billingConfig);

let root = new RootStore(clientKV, purchases, backend);
if (root.billing.isAwaiting) void root.billing.checkAgain();   // purchase confirmed while we were away?
const faults = () => root.connectivity.faults;
let server: MockChatServer = new MockChatServer(serverKV, faults, { seedFor });
let stop = startWorkers(root, server);
let buggy = false;

/**
 * Composition root. Everything the screens need is reachable from here, and
 * `resetAll` rebuilds it over wiped storage (the brief's "reset action").
 */
export const container = {
  get root() { return root; },
  get chatApi(): ChatApi { return server; },
  get server() { return server; },
  get buggyServer() { return buggy; },

  /** Swap in the server without the idempotency key, to reproduce the duplicate live. */
  useBuggyServer(on: boolean) {
    buggy = on; stop();
    server = on ? new NaiveChatServer(serverKV, faults, { seedFor }) : new MockChatServer(serverKV, faults, { seedFor });
    stop = startWorkers(root, server);
  },

  injectIncoming(chatId: string) {
    server.injectIncoming(chatId, ['Morty. MORTY. Where are you?', 'New stream idea. It involves lasers.', 'Tonight, 8pm. Bring the plumbus.', 'Thanks for the support. Do not tell Jerry.']);
  },

  resetAll() {
    stop(); root.dispose();
    clientKV.clear(); serverKV.clear();
    root = new RootStore(clientKV, purchases, backend); buggy = false;
    billingConfig.outcome = 'success'; billingConfig.confirmDelayMs = 0;
    server = new MockChatServer(serverKV, faults, { seedFor });
    stop = startWorkers(root, server);
    listeners.forEach((l) => l());
  },

  onReset(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};
