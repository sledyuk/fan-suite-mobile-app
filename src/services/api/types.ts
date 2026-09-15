export type ServerId = string;
export type ClientId = string;
export type AuthorId = 'fan' | 'creator';
export type MessageKind = 'text' | 'gift' | 'image' | 'video';

/** A picked photo or video. `uri` is a local file copied into the app's documents (survives restarts). */
export interface Attachment { kind: 'image' | 'video'; uri: string; width?: number; height?: number; durationMs?: number }

/** A message as the backend sees it: it owns the id and the final order (seq). */
export interface ServerMessage {
  id: ServerId;
  /** Idempotency key supplied by the client for its own sends. */
  clientId?: ClientId;
  seq: number;
  authorId: AuthorId;
  text: string;
  createdAt: number; // epoch ms
  kind: MessageKind;
  attachment?: Attachment;
}

export interface Page<T> {
  messages: T[];
  hasMore: boolean;
}

export type SendErrorCode = 'NETWORK' | 'RATE_LIMITED' | 'PAYMENT_REQUIRED' | 'BLOCKED';

export class SendError extends Error {
  constructor(public code: SendErrorCode, public recoverable: boolean, message: string) {
    super(message);
    this.name = 'SendError';
  }
}

export interface OutboxError { code: SendErrorCode; recoverable: boolean; message: string }

/** A send the client owns until the server confirms it. Persisted before it is shown as queued. */
export interface OutboxItem {
  clientId: ClientId;
  chatId: string;
  text: string;
  createdAt: number;
  status: 'pending' | 'sending' | 'failed';
  attempts: number;
  error?: OutboxError;
  attachment?: Attachment;
}
