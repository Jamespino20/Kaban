"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Polls a fetch function at a given interval.
 * Call `trigger` to force an immediate fetch.
 */
export function usePolling(
  fetcher: () => Promise<void>,
  intervalMs: number = 30_000,
  enabled: boolean = true,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    try {
      await fetcherRef.current();
    } catch {
      // silent — individual toasts handle errors
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(run, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [run, intervalMs, enabled]);

  return { trigger: run };
}
