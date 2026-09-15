import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { ChatStore } from './ChatStore';
import { ConnectivityStore } from './ConnectivityStore';
import { OutboxStore } from './OutboxStore';

export class RootStore {
  connectivity: ConnectivityStore;
  outbox: OutboxStore;
  chat: ChatStore;

  constructor(client: KeyValueStorage) {
    this.connectivity = new ConnectivityStore(client);
    this.outbox = new OutboxStore(client);
    this.chat = new ChatStore();
  }

  dispose() { this.connectivity.dispose(); this.outbox.dispose(); }
}
