import { MockChatServer } from './MockChatServer';

export class NaiveChatServer extends MockChatServer {
  override async send(input: { chatId: string; clientId: string; text: string; createdAt: number; attachment?: import('../api/types').Attachment }) {
    await this.gate();
    this.maybeFail();
    const t = this.thread(input.chatId);
    const msg = this.accept(input.chatId, t, input, false);
    this.maybeDropResponse();
    return msg;
  }
}
