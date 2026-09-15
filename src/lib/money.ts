/** Schmeckles: the demo currency (Rick and Morty). Symbol ʂ, shown before the amount. */
export const SCHMECKLE = 'ʂ';

export function formatSchmeckles(amount: number, { sign = false }: { sign?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const body = Number.isInteger(abs) ? abs.toLocaleString() : abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = amount < 0 ? '−' : sign ? '+' : '';
  return `${prefix}${SCHMECKLE} ${body}`;
}
