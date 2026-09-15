import type { Attachment, ClientId, Page, ServerMessage } from './types';

export interface ChatApi {
  send(input: { chatId: string; clientId: ClientId; text: string; createdAt: number; attachment?: Attachment }): Promise<ServerMessage>;
  sync(chatId: string, sinceSeq: number): Promise<ServerMessage[]>;
  getPage(chatId: string, beforeSeq: number | null, limit: number): Promise<Page<ServerMessage>>;
}
