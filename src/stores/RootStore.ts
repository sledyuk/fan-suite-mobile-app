import type { BackendBilling, PurchaseService } from '@/services/api/BillingApi';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { BillingStore } from './BillingStore';
import { ChatStore } from './ChatStore';
import { ConnectivityStore } from './ConnectivityStore';
import { OutboxStore } from './OutboxStore';

export class RootStore {
  connectivity: ConnectivityStore;
  outbox: OutboxStore;
  chat: ChatStore;
  billing: BillingStore;

  constructor(client: KeyValueStorage, purchases: PurchaseService, backend: BackendBilling) {
    this.connectivity = new ConnectivityStore(client);
    this.outbox = new OutboxStore(client);
    this.chat = new ChatStore();
    this.billing = new BillingStore(client, purchases, backend);
  }

  dispose() { this.connectivity.dispose(); this.outbox.dispose(); this.billing.dispose(); }
}
