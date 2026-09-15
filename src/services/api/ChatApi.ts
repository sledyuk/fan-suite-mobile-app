import type { Attachment, ClientId, Page, ServerMessage } from './types';

/** What a real chat backend client would implement. The mock server implements it in-process. */
export interface ChatApi {
  /** Idempotent on clientId: retrying a send returns the already accepted message. */
  send(input: { chatId: string; clientId: ClientId; text: string; createdAt: number; attachment?: Attachment }): Promise<ServerMessage>;
  /** Messages with seq > sinceSeq, ascending. */
  sync(chatId: string, sinceSeq: number): Promise<ServerMessage[]>;
  /** Older page: seq < beforeSeq (null = newest), ascending. */
  getPage(chatId: string, beforeSeq: number | null, limit: number): Promise<Page<ServerMessage>>;
}
