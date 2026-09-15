import type { Product, PurchaseOutcome, PurchaseResult, PurchaseService } from '../api/BillingApi';
import type { KeyValueStorage } from '@/storage/KeyValueStorage';

export const PRO: Product = {
  id: 'fansuite_pro_monthly',
  title: 'FanSuite Pro',
  priceSchmeckles: 40,
  usdHint: '≈ $9.99',
  period: 'month',
  perks: ['Message many fans at once', 'AI summaries in Fan details', 'Priority payouts'],
};

/**
 * Stand-in for StoreKit / Play Billing: answers immediately with the outcome
 * chosen in the dev sheet, and remembers the last receipt so `restore()` works.
 */
export class MockPurchases implements PurchaseService {
  constructor(private config: () => { outcome: PurchaseOutcome }, private storage: KeyValueStorage) {}

  getProduct() { return PRO; }

  async purchase(productId: string): Promise<PurchaseResult> {
    const o = this.config().outcome;
    if (o === 'cancelled') return { status: 'cancelled' };
    if (o === 'failed') return { status: 'failed', message: 'Payment declined by the store' };
    const receiptId = `rcpt_${productId}_${Date.now()}`;
    this.storage.set('purchases.lastReceipt', receiptId);
    return { status: 'purchased', receiptId };
  }

  async restore(): Promise<PurchaseResult> {
    const r = this.storage.get('purchases.lastReceipt');
    return r ? { status: 'purchased', receiptId: r } : { status: 'failed', message: 'No previous purchase found for this account' };
  }
}
