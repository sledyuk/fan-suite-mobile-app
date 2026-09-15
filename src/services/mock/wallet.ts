export type TxKind = 'subscription' | 'tip' | 'ppv' | 'refund' | 'payout';

export interface Transaction {
  id: string;
  kind: TxKind;
  amount: number;
  counterparty: string;
  at: number;
}

const NOW = Date.UTC(2026, 8, 15, 11, 0, 0);
const h = (n: number) => NOW - n * 3_600_000;

export const WALLET = {
  balance: 1_284.5,
  pendingPayout: 320,
  thisMonth: 2_140,
  transactions: [
    { id: 't1', kind: 'tip', amount: 25, counterparty: 'Rick Sanchez', at: h(1) },
    { id: 't2', kind: 'subscription', amount: 40, counterparty: 'Unity', at: h(5) },
    { id: 't3', kind: 'ppv', amount: 60, counterparty: 'Birdperson', at: h(9) },
    { id: 't4', kind: 'refund', amount: -9.99, counterparty: 'Jerry Smith', at: h(26) },
    { id: 't5', kind: 'payout', amount: -500, counterparty: 'Bank', at: h(48) },
    { id: 't6', kind: 'subscription', amount: 40, counterparty: 'Beth Smith', at: h(70) },
    { id: 't7', kind: 'tip', amount: 5, counterparty: 'Summer Smith', at: h(96) },
    ...history(),
  ] satisfies Transaction[],
};

function history(): Transaction[] {
  const fans = ['Rick Sanchez', 'Unity', 'Birdperson', 'Beth Smith', 'Summer Smith', 'Mr. Meeseeks', 'Noob-Noob', 'Squanchy'];
  const kinds: TxKind[] = ['subscription', 'tip', 'ppv', 'subscription', 'tip'];
  const amounts: Record<TxKind, number> = { subscription: 40, tip: 10, ppv: 30, refund: 0, payout: 0 };
  return Array.from({ length: 24 }, (_, i) => {
    const kind = kinds[i % kinds.length];
    return { id: `h${i}`, kind, amount: amounts[kind] + (i % 3) * 5, counterparty: fans[i % fans.length], at: h(120 + i * 19) };
  });
}

export const TX_LABEL: Record<TxKind, string> = { subscription: 'Subscription', tip: 'Tip', ppv: 'PPV unlock', refund: 'Refund', payout: 'Payout' };
