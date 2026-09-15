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
/** Empty account → empty threads; demo account → 50k history per thread. */
const seedCount = () => (root.demo.seeded ? 50_000 : 0);
const listeners = new Set<() => void>();

/** Dev-sheet knobs for the billing mocks. */
export const billingConfig: { outcome: PurchaseOutcome; confirmDelayMs: number } = { outcome: 'success', confirmDelayMs: 0 };
const purchases = new MockPurchases(() => billingConfig, clientKV);
const backend = new MockBackendBilling(() => billingConfig);

let root = new RootStore(clientKV, purchases, backend);
if (root.billing.isAwaiting) void root.billing.checkAgain();   // purchase confirmed while we were away?
const faults = () => root.connectivity.faults;
let server: MockChatServer = new MockChatServer(serverKV, faults, { seedFor, seedCount });
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
    server = on ? new NaiveChatServer(serverKV, faults, { seedFor, seedCount }) : new MockChatServer(serverKV, faults, { seedFor, seedCount });
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
    server = new MockChatServer(serverKV, faults, { seedFor, seedCount });
    stop = startWorkers(root, server);
    listeners.forEach((l) => l());
  },

  /**
   * Fill the account with demo data: conversations, wallet, 50k-message threads,
   * and make every row's "last message" real: fan-last rows end with that fan
   * message, delivered/seen rows end with our message, failed/sending rows get a
   * genuine outbox item. So the list, the thread and the outbox always agree.
   */
  seedDemo() {
    serverKV.clear(); root.chat.clear(); server.reset(); root.outbox.clear();
    root.demo.seed();
    for (const c of root.demo.conversations) {
      const { last } = c;
      if (last.from === 'fan') { server.injectMessage(c.id, { authorId: 'fan', text: last.text, createdAt: last.at }); continue; }
      if (last.status === 'delivered' || last.status === 'seen') { server.injectMessage(c.id, { authorId: 'creator', text: last.text, createdAt: last.at }); continue; }
      const item = root.outbox.enqueue(c.id, last.text);
      item.createdAt = last.at;
      if (last.status === 'failed') root.outbox.markFailed(item.clientId, { code: 'NETWORK', recoverable: true, message: "Couldn't reach the server" });
    }
  },

  onReset(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};
