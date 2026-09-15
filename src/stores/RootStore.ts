import type { BackendBilling, PurchaseService } from '@/services/api/BillingApi';
import { configure, reaction } from 'mobx';
import type { ServerMessage } from '@/services/api/types';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { BillingStore } from './BillingStore';
import { ChatStore } from './ChatStore';
import { ConnectivityStore } from './ConnectivityStore';
import { DemoDataStore } from './DemoDataStore';
import { OutboxStore } from './OutboxStore';
import { SettingsStore } from './SettingsStore';

configure({ enforceActions: 'never' });

export class RootStore {
  connectivity: ConnectivityStore;
  outbox: OutboxStore;
  chat: ChatStore;
  billing: BillingStore;
  demo: DemoDataStore;
  settings: SettingsStore;
  private stopAccessWatch: () => void;

  constructor(client: KeyValueStorage, purchases: PurchaseService, backend: BackendBilling) {
    this.connectivity = new ConnectivityStore(client);
    this.outbox = new OutboxStore(client);
    this.chat = new ChatStore(client);
    this.billing = new BillingStore(client, purchases, backend);
    this.demo = new DemoDataStore(client);
    this.settings = new SettingsStore(client);
    // Once the backend confirms access, every send that failed with PAYMENT_REQUIRED becomes sendable again.
    // The item keeps its clientId, so a retry after an earlier lost response still resolves to one server copy.
    this.stopAccessWatch = reaction(() => this.billing.isActive, (active) => { if (active) this.requeuePaymentBlocked(); });
  }

  requeuePaymentBlocked() {
    for (const i of this.outbox.items) if (i.status === 'failed' && i.error?.code === 'PAYMENT_REQUIRED') this.outbox.retry(i.clientId);
  }

  applyServerMessages(chatId: string, msgs: ServerMessage[], opts: { page?: { hasMore: boolean } } = {}) {
    const t = this.chat.thread(chatId);
    if (opts.page) t.setPage(msgs, opts.page.hasMore); else t.upsert(msgs);
    for (const m of msgs) if (m.clientId && this.outbox.items.some((i) => i.clientId === m.clientId)) this.outbox.remove(m.clientId);
  }

  dispose() { this.stopAccessWatch(); this.connectivity.dispose(); this.outbox.dispose(); this.billing.dispose(); this.demo.dispose(); this.chat.dispose(); this.settings.dispose(); }
}
