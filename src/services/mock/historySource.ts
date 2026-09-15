import type { Page, ServerMessage } from '../api/types';

/**
 * In-memory paged read over an ascending-by-seq array.
 * `beforeSeq === null` means "newest page". Pages come back ascending so the
 * caller can prepend them without re-sorting. This is the seam that the mock
 * chat server will implement in the next step.
 */
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
