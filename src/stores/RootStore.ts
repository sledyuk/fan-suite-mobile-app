import type { BackendBilling, PurchaseService } from '@/services/api/BillingApi';
import type { ServerMessage } from '@/services/api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { BillingStore } from './BillingStore';
import { ChatStore } from './ChatStore';
import { ConnectivityStore } from './ConnectivityStore';
import { DemoDataStore } from './DemoDataStore';
import { OutboxStore } from './OutboxStore';

export class RootStore {
  connectivity: ConnectivityStore;
  outbox: OutboxStore;
  chat: ChatStore;
  billing: BillingStore;
  demo: DemoDataStore;

  constructor(client: KeyValueStorage, purchases: PurchaseService, backend: BackendBilling) {
    this.connectivity = new ConnectivityStore(client);
    this.outbox = new OutboxStore(client);
    this.chat = new ChatStore(client);
    this.billing = new BillingStore(client, purchases, backend);
    this.demo = new DemoDataStore(client);
  }

  /**
   * Every server message enters the client here. If it carries a clientId that is
   * still in the outbox (response lost, or sync raced the send), the outbox item is
   * done: the server has it. Prevents a message showing as both sent and sending.
   */
  applyServerMessages(chatId: string, msgs: ServerMessage[], opts: { page?: { hasMore: boolean } } = {}) {
    const t = this.chat.thread(chatId);
    if (opts.page) t.setPage(msgs, opts.page.hasMore); else t.upsert(msgs);
    for (const m of msgs) if (m.clientId && this.outbox.items.some((i) => i.clientId === m.clientId)) this.outbox.remove(m.clientId);
  }

  dispose() { this.connectivity.dispose(); this.outbox.dispose(); this.billing.dispose(); this.demo.dispose(); this.chat.dispose(); }
}
