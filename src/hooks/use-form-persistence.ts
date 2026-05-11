"use client";

import { useEffect, useCallback, useRef, useState } from "react";

const STORAGE_PREFIX = "agapay_draft_";
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000;

type DraftPayload<T> = {
  data: T;
  savedAt: number;
};

export function useFormPersistence<T extends Record<string, unknown>>(
  key: string,
  data: T,
  onRestore: (data: T) => void,
  enabled: boolean = true,
) {
  const [draftFound, setDraftFound] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef<T>(data);
  const storageKey = `${STORAGE_PREFIX}${key}`;

  // Restore from localStorage on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const payload: DraftPayload<T> = JSON.parse(raw);
      if (Date.now() - payload.savedAt > MAX_DRAFT_AGE_MS) {
        localStorage.removeItem(storageKey);
        return;
      }
      if (payload.data && Object.keys(payload.data).length > 0) {
        onRestore(payload.data);
        setDraftFound(true);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [key, enabled]);

  // Debounced save to localStorage when data changes
  useEffect(() => {
    if (!enabled) return;
    if (!data || Object.keys(data).length === 0) return;
    if (JSON.stringify(data) === JSON.stringify(prevRef.current)) return;
    prevRef.current = data;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const payload: DraftPayload<T> = { data, savedAt: Date.now() };
      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // localStorage full or unavailable
      }
    }, 800);
  }, [key, data, enabled]);

  // Warn on accidental exit
  useEffect(() => {
    if (!enabled) return;
    if (!data || Object.keys(data).length === 0) return;
    const hasValues = Object.values(data).some(
      (v) => v !== "" && v !== null && v !== undefined,
    );
    if (!hasValues) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [data, enabled]);

  const clearPersistence = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setDraftFound(false);
  }, [storageKey]);

  const dismissDraftNotice = useCallback(() => {
    setDraftFound(false);
  }, []);

  return {
    clearPersistence,
    draftFound,
    dismissDraftNotice,
  };
}
