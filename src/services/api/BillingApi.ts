export interface Product {
  id: string;
  title: string;
  priceSchmeckles: number;
  usdHint: string;
  period: 'month';
  perks: string[];
}

export type PurchaseResult =
  | { status: 'purchased'; receiptId: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string };

export interface PurchaseService {
  getProduct(): Product;
  purchase(productId: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
}

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
