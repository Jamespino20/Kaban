"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SubTab {
  value: string;
  label: string;
  badge?: number;
}

interface ModuleShellProps {
  title: string;
  subtitle?: string;
  subTabs?: SubTab[];
  /** When subTabs is provided, use this render prop to render per-tab content */
  renderSubTab?: (activeTab: string) => React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function ModuleShell({
  title,
  subtitle,
  subTabs,
  renderSubTab,
  children,
  className,
}: ModuleShellProps) {
  const [active, setActive] = React.useState(subTabs?.[0]?.value ?? "");

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Module Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold italic text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 max-w-2xl">{subtitle}</p>
        )}
      </div>

      {/* Sub-tab selector bar */}
      {subTabs && subTabs.length > 1 && (
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 no-scrollbar">
          {subTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap",
                active === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content area — use renderSubTab when sub-tabs are present */}
      <div className="flex flex-col gap-6">
        {subTabs && renderSubTab ? renderSubTab(active) : children}
      </div>
    </div>
  );
}
