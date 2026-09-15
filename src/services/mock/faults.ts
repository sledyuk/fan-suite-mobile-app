/** Failure switches the dev panel flips. Read by the mock server on every call. */
export interface Faults {
  offline: boolean;
  /** Server accepts the next send, then the response is "lost" (client sees a network error). */
  dropNextResponse: boolean;
  failNextSend: null | 'RATE_LIMITED' | 'BLOCKED' | 'PAYMENT_REQUIRED';
  latencyMs: number;
}

export const defaultFaults = (): Faults => ({ offline: false, dropNextResponse: false, failNextSend: null, latencyMs: 0 });
