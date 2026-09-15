/** Amounts are in Schmeckles (ʂ), the demo's currency. `usdHint` is display only. */
export interface Product {
  id: string;
  title: string;
  priceSchmeckles: number;
  usdHint: string;
  period: 'month';
  perks: string[];
}

/** What the store SDK would return. Deliberately knows nothing about our backend. */
export type PurchaseResult =
  | { status: 'purchased'; receiptId: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string };

export interface PurchaseService {
  getProduct(): Product;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
}

/** Our backend validating a receipt. Access is granted only on its say-so. */
export interface BackendBilling {
  confirm(receiptId: string): Promise<{ status: 'active'; expiresAt: number }>;
}

export interface Entitlement {
  productId: string;
  status: 'none' | 'awaiting_confirmation' | 'active';
  receiptId?: string;
  expiresAt?: number;
}

export type PurchaseOutcome = 'success' | 'cancelled' | 'failed' | 'success_delayed';
