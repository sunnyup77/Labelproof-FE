// usePagination — manages opaque cursor pagination for GET /scans
// The last_key cursor from the backend is opaque (base64); never parse it.

import { useState, useCallback } from 'react';
import { listScans } from '../api/scans';
import type { ScanRecord, ScansListParams } from '../types/contracts';

export interface UsePaginationResult {
  items: ScanRecord[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadNext: () => void;
  reset: (params?: ScansListParams) => void;
}

export function usePagination(initialParams?: ScansListParams): UsePaginationResult {
  const [items, setItems] = useState<ScanRecord[]>([]);
  const [lastKey, setLastKey] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ScansListParams | undefined>(initialParams);

  const fetch = useCallback(
    async (currentParams: ScansListParams | undefined, cursor: string | null | undefined, replace: boolean) => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await listScans({
          ...currentParams,
          ...(cursor ? { last_key: cursor } : {}),
        });
        setItems(prev => (replace ? res.items : [...prev, ...res.items]));
        setLastKey(res.last_key);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const loadNext = useCallback(() => {
    if (lastKey === null) return; // no more pages
    fetch(params, lastKey, false);
  }, [fetch, params, lastKey]);

  const reset = useCallback(
    (newParams?: ScansListParams) => {
      setItems([]);
      setLastKey(undefined);
      setParams(newParams);
      fetch(newParams, undefined, true);
    },
    [fetch],
  );

  return {
    items,
    isLoading,
    error,
    hasMore: lastKey !== null && lastKey !== undefined,
    loadNext,
    reset,
  };
}
