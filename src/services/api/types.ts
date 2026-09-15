export type ServerId = string;
export type AuthorId = 'fan' | 'creator';
export type MessageKind = 'text' | 'gift';

/** A message as the backend sees it: it owns the id and the final order (seq). */
export interface ServerMessage {
  id: ServerId;
  seq: number;
  authorId: AuthorId;
  text: string;
  createdAt: number; // epoch ms
  kind: MessageKind;
}

export interface Page<T> {
  messages: T[];
  hasMore: boolean;
}
