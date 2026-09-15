/**
 * Schmeckles: the demo currency (Rick and Morty). No real glyph exists, so we
 * use a currency code after the amount, the way CHF or SEK are written.
 */
export const CURRENCY_CODE = 'SCH';
export const CURRENCY_NAME = 'Schmeckles';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatSchmeckles(amount: number, { sign = false, code = true }: { sign?: boolean; code?: boolean } = {}): string {
  const prefix = amount < 0 ? '−' : sign ? '+' : '';
  const body = fmt.format(Math.abs(amount));
  return code ? `${prefix}${body} ${CURRENCY_CODE}` : `${prefix}${body}`;
}
