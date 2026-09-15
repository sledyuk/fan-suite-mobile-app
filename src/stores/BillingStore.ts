import { makeAutoObservable, runInAction } from 'mobx';
import type { BackendBilling, Entitlement, Product, PurchaseResult, PurchaseService } from '@/services/api/BillingApi';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';
import { persistSlice } from './persist';

/**
 * Purchase flow + entitlement. Rules from the brief:
 * - one flow at a time (repeated taps are ignored),
 * - a store "purchased" only means awaiting_confirmation,
 * - access is granted when the backend confirms, deduped by receipt,
 * - cancel/fail never touch an entitlement that is still valid,
 * - awaiting_confirmation survives restart and is re-checked on launch.
 */
export class BillingStore {
  product: Product;
  entitlement: Entitlement;
  purchaseInFlight = false;
  lastError: string | null = null;
  lastEvent: string | null = null;
  processedReceipts: string[] = [];
  dispose: () => void;

  constructor(storage: KeyValueStorage, private purchases: PurchaseService, private backend: BackendBilling) {
    this.product = purchases.getProduct();
    this.entitlement = { productId: this.product.id, status: 'none' };
    makeAutoObservable(this, { dispose: false });
    this.dispose = persistSlice(
      storage, 'billing.v1',
      () => ({ entitlement: this.entitlement, processedReceipts: this.processedReceipts }),
      (v) => { this.entitlement = v.entitlement; this.processedReceipts = v.processedReceipts; },
    );
  }

  get isActive() { return this.entitlement.status === 'active' && (this.entitlement.expiresAt ?? Infinity) > Date.now(); }
  get isAwaiting() { return this.entitlement.status === 'awaiting_confirmation'; }

  private async confirm(receiptId: string) {
    runInAction(() => { if (!this.isActive) this.entitlement = { productId: this.product.id, status: 'awaiting_confirmation', receiptId }; });
    const res = await this.backend.confirm(receiptId);
    runInAction(() => {
      if (this.processedReceipts.includes(receiptId)) { this.lastEvent = 'Already confirmed'; return; }
      this.entitlement = { productId: this.product.id, status: 'active', receiptId, expiresAt: res.expiresAt };
      this.processedReceipts.push(receiptId);
      this.lastEvent = 'Pro is active';
    });
  }

  private async run(op: () => Promise<PurchaseResult>) {
    if (this.purchaseInFlight) return;
    runInAction(() => { this.purchaseInFlight = true; this.lastError = null; this.lastEvent = null; });
    try {
      const r = await op();
      if (r.status === 'cancelled') runInAction(() => { this.lastEvent = 'Purchase cancelled'; });
      else if (r.status === 'failed') runInAction(() => { this.lastError = r.message; });
      else await this.confirm(r.receiptId);
    } catch (e) {
      runInAction(() => { this.lastError = (e as Error).message; });
    } finally {
      runInAction(() => { this.purchaseInFlight = false; });
    }
  }

  buy() { return this.run(() => this.purchases.purchase(this.product.id)); }
  restore() { return this.run(() => this.purchases.restore()); }
  /** Re-ask the backend for a receipt we are still waiting on (launch, "Check again"). */
  async checkAgain() { const r = this.entitlement.receiptId; if (r && !this.isActive) await this.confirm(r); }
  clear() { this.entitlement = { productId: this.product.id, status: 'none' }; this.processedReceipts = []; this.lastError = null; this.lastEvent = null; this.purchaseInFlight = false; }
}
