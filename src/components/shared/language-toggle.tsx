"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();

  const handleToggle = () => {
    const nextLocale = locale === "tl" ? "en" : "tl";
    startTransition(() => {
      // Set the NEXT_LOCALE cookie directly
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 hover:bg-slate-200/50 transition-all border border-slate-200 text-slate-700 font-bold text-xs group"
      title={locale === "tl" ? "Switch to English" : "Lipat sa Tagalog"}
    >
      <Languages
        className={`w-4 h-4 transition-transform ${isPending ? "animate-spin" : "group-hover:rotate-12"}`}
      />
      <span>{locale === "tl" ? "TL | EN" : "EN | TL"}</span>
    </button>
  );
}
