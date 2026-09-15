export interface Faults {
  offline: boolean;
  dropNextResponse: boolean;
  failNextSend: null | 'RATE_LIMITED' | 'BLOCKED' | 'PAYMENT_REQUIRED';
  latencyMs: number;
}

export const defaultFaults = (): Faults => ({ offline: false, dropNextResponse: false, failNextSend: null, latencyMs: 0 });
