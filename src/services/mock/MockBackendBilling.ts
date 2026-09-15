import type { BackendBilling } from '../api/BillingApi';

const MONTH = 30 * 86_400_000;

/** Stand-in for server-side receipt validation. Idempotent per receipt; delay is configurable. */
export class MockBackendBilling implements BackendBilling {
  private confirmed = new Map<string, number>();
  constructor(private config: () => { confirmDelayMs: number }) {}

  async confirm(receiptId: string) {
    if (!this.confirmed.has(receiptId)) {
      const delay = this.config().confirmDelayMs;
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
      this.confirmed.set(receiptId, Date.now() + MONTH);
    }
    return { status: 'active' as const, expiresAt: this.confirmed.get(receiptId)! };
  }
}
