import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ServerMessage } from '@/services/api/types';
import type { HistorySource } from '@/services/mock/historySource';
import { buildRows } from './rows';

export const PAGE_SIZE = 50;

/**
 * Owns the loaded window of the thread and paging state. Messages are kept
 * ascending by seq; older pages are prepended. Later this will read from the
 * chat store, but the returned shape (rows / loadOlder / loadingOlder) stays.
 */
export function useThread(source: HistorySource) {
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const inFlight = useRef(false);

  const loadPage = useCallback(async (beforeSeq: number | null) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoadingOlder(true);
    try {
      const page = await source.getPage(beforeSeq, PAGE_SIZE);
      setMessages((prev) => (beforeSeq === null ? page.messages : [...page.messages, ...prev]));
      setHasMore(page.hasMore);
    } finally {
      inFlight.current = false;
      setLoadingOlder(false);
    }
  }, [source]);

  useEffect(() => { void loadPage(null); }, [loadPage]);

  const loadOlder = useCallback(() => {
    if (!hasMore || messages.length === 0) return;
    void loadPage(messages[0].seq);
  }, [hasMore, messages, loadPage]);

  const rows = useMemo(() => buildRows(messages), [messages]);

  return { rows, loadOlder, loadingOlder, hasMore };
}
