// usePollScan — polls GET /scans/{id} every ~2s until a terminal status is reached.
// Polling stops automatically on DONE | NEEDS_REVIEW | FAILED.
// Never fakes progress — only reflects what the backend returns.

import { useEffect, useRef, useState } from 'react';
import { getScan, isTerminal } from '../api/scans';
import { ApiRequestError } from '../api/client';
import type { ScanRecord } from '../types/contracts';

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 2000;

export interface UsePollScanResult {
  scan: ScanRecord | null;
  error: ApiRequestError | Error | null;
  isPolling: boolean;
}

export function usePollScan(scanId: string | null): UsePollScanResult {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<ApiRequestError | Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    if (!scanId) return;

    activeRef.current = true;
    setIsPolling(true);
    setError(null);

    async function poll() {
      if (!activeRef.current || !scanId) return;
      try {
        const record = await getScan(scanId);
        if (!activeRef.current) return;
        setScan(record);
        if (isTerminal(record.status)) {
          setIsPolling(false);
          return;
        }
        // Schedule next poll
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!activeRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsPolling(false);
      }
    }

    poll();

    return () => {
      activeRef.current = false;
      setIsPolling(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scanId]);

  return { scan, error, isPolling };
}
