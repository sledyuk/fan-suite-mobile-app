export type ServerId = string;
export type ClientId = string;
export type AuthorId = 'fan' | 'creator';
export type MessageKind = 'text' | 'gift' | 'image' | 'video';

export interface Attachment { kind: 'image' | 'video'; uri: string; width?: number; height?: number; durationMs?: number }

export interface ServerMessage {
  id: ServerId;
  clientId?: ClientId;
  seq: number;
  authorId: AuthorId;
  text: string;
  createdAt: number;
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

export interface OutboxItem {
  clientId: ClientId;
  chatId: string;
  text: string;
  createdAt: number;
  status: 'pending' | 'sending' | 'failed';
  attempts: number;
  /** Earliest time (ms) the drainer may try again after a network failure. */
  nextAttemptAt?: number;
  error?: OutboxError;
  attachment?: Attachment;
}
