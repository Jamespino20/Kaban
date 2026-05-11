"use client";

import { FileText, X } from "lucide-react";

export function DraftBanner({
  visible,
  onDismiss,
  onClear,
}: {
  visible: boolean;
  onDismiss: () => void;
  onClear: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200">
      <FileText className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">
        A saved draft was restored. Your previous edits have been recovered.
      </span>
      <button
        onClick={onClear}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-800/50"
      >
        Clear
      </button>
      <button
        onClick={onDismiss}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800/50"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
