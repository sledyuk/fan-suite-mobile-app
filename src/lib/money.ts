export const CURRENCY_CODE = 'SCH';
export const CURRENCY_NAME = 'Schmeckles';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatSchmeckles(amount: number, { sign = false, code = true }: { sign?: boolean; code?: boolean } = {}): string {
  const prefix = amount < 0 ? '−' : sign ? '+' : '';
  const body = fmt.format(Math.abs(amount));
  return code ? `${prefix}${body} ${CURRENCY_CODE}` : `${prefix}${body}`;
}
