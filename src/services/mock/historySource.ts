import type { Page, ServerMessage } from '../api/types';

export interface HistorySource {
  getPage(beforeSeq: number | null, limit: number): Promise<Page<ServerMessage>>;
}

export function pageOf(all: ReadonlyArray<ServerMessage>, beforeSeq: number | null, limit: number): Page<ServerMessage> {
  let end = all.length;
  if (beforeSeq !== null) {
    const idx = all.findIndex((m) => m.seq >= beforeSeq);
    end = idx === -1 ? all.length : idx;
  }
  const start = Math.max(0, end - limit);
  return { messages: all.slice(start, end), hasMore: start > 0 };
}

export function createInMemoryHistory(all: ReadonlyArray<ServerMessage>, latencyMs = 0): HistorySource {
  return {
    async getPage(beforeSeq, limit) {
      if (latencyMs) await new Promise((r) => setTimeout(r, latencyMs));
      return pageOf(all, beforeSeq, limit);
    },
  };
}
