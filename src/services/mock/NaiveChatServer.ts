import { MockChatServer } from './MockChatServer';

/**
 * THE BUG, kept on purpose for the failing test and the walkthrough:
 * no idempotency key, so a retry after a lost response inserts the message again.
 */
export class NaiveChatServer extends MockChatServer {
  override async send(input: { chatId: string; clientId: string; text: string; createdAt: number; attachment?: import('../api/types').Attachment }) {
    await this.gate();
    this.maybeFail();
    const t = this.thread(input.chatId);
    const msg = this.accept(input.chatId, t, input);
    this.maybeDropResponse();
    return msg;
  }
}
