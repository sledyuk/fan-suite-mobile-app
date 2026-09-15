import type { PurchaseOutcome } from '@/services/api/BillingApi';
import { MockBackendBilling } from '@/services/mock/MockBackendBilling';
import { MockPurchases } from '@/services/mock/MockPurchases';
import { MemoryKV } from '@/storage/MemoryKV';
import { BillingStore } from '@/stores/BillingStore';

jest.useFakeTimers();

const setup = (kv = new MemoryKV()) => {
  const cfg: { outcome: PurchaseOutcome; confirmDelayMs: number } = { outcome: 'success_delayed', confirmDelayMs: 5000 };
  const purchases = new MockPurchases(() => cfg, kv);
  const backend = new MockBackendBilling(() => cfg);
  const store = new BillingStore(kv, purchases, backend);
  return { cfg, purchases, backend, store, kv };
};

test('access is granted only after the backend confirms; duplicate events and unrelated failures are harmless', async () => {
  const { cfg, store, backend } = setup();
  const confirmSpy = jest.spyOn(backend, 'confirm');

  const p1 = store.buy(); const p2 = store.buy();
  expect(store.purchaseInFlight).toBe(true);
  await jest.advanceTimersByTimeAsync(0);
  expect(store.entitlement.status).toBe('awaiting_confirmation');
  expect(store.isActive).toBe(false);

  await jest.advanceTimersByTimeAsync(5000); await p1; await p2;
  expect(store.isActive).toBe(true);
  expect(confirmSpy).toHaveBeenCalledTimes(1);

  const receipt = store.entitlement.receiptId!;
  await store.checkAgain();
  expect(store.processedReceipts).toEqual([receipt]);

  cfg.outcome = 'failed'; await store.buy();
  expect(store.isActive).toBe(true); expect(store.lastError).toMatch(/declined/i);

  cfg.outcome = 'cancelled'; await store.buy();
  expect(store.isActive).toBe(true); expect(store.lastEvent).toMatch(/cancelled/i);
});

test('restore finds the earlier purchase and re-confirms with the backend', async () => {
  const { cfg, store } = setup();
  cfg.outcome = 'success'; cfg.confirmDelayMs = 0;
  await store.buy();
  store.clear(); expect(store.isActive).toBe(false);
  await store.restore();
  expect(store.isActive).toBe(true);
});

test('awaiting_confirmation survives a restart and resolves on checkAgain', async () => {
  const { store: a, kv, purchases, backend } = setup();
  void a.buy(); await jest.advanceTimersByTimeAsync(0);
  expect(a.entitlement.status).toBe('awaiting_confirmation'); a.dispose();

  const b = new BillingStore(kv, purchases, backend);
  expect(b.entitlement.status).toBe('awaiting_confirmation');
  const p = b.checkAgain(); await jest.advanceTimersByTimeAsync(5000); await p;
  expect(b.isActive).toBe(true);
});
