"use client";

import { useEffect, useCallback } from "react";

/**
 * useFormPersistence
 * Saves form data to localStorage as the user types.
 * @param key - The unique localStorage key for this form.
 * @param data - The current state of the form.
 * @param onRestore - A callback to update the form state with the saved data.
 * @param enabled - Whether persistence is active.
 */
export function useFormPersistence<T>(
  key: string,
  data: T,
  onRestore: (data: T) => void,
  enabled: boolean = true,
) {
  // Restore from sessionStorage on mount
  useEffect(() => {
    if (!enabled) return;

    const saved = sessionStorage.getItem(`agapay_form_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        onRestore(parsed);
      } catch (e) {
        console.error("Failed to restore form state", e);
      }
    }
  }, [key, onRestore, enabled]);

  // Save to sessionStorage when data changes
  useEffect(() => {
    if (!enabled) return;

    if (data && Object.keys(data as object).length > 0) {
      sessionStorage.setItem(`agapay_form_${key}`, JSON.stringify(data));
    }
  }, [key, data, enabled]);

  // Clear storage manually (e.g., on successful submit)
  const clearPersistence = useCallback(() => {
    sessionStorage.removeItem(`agapay_form_${key}`);
  }, [key]);

  return { clearPersistence };
}
