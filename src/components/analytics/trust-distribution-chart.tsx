"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TrustDistributionChartProps {
  distribution: {
    elite: number;
    growth: number;
    starter: number;
    atRisk: number;
  };
}

export function TrustDistributionChart({
  distribution,
}: TrustDistributionChartProps) {
  const total =
    distribution.elite +
    distribution.growth +
    distribution.starter +
    distribution.atRisk;

  const segments = [
    {
      label: "Elite (85+)",
      value: distribution.elite,
      color: "bg-emerald-500",
    },
    {
      label: "Growth (70-84)",
      value: distribution.growth,
      color: "bg-indigo-500",
    },
    {
      label: "Starter (50-69)",
      value: distribution.starter,
      color: "bg-amber-500",
    },
    {
      label: "At Risk (<50)",
      value: distribution.atRisk,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Member Trust Distribution
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            Population breakdown by trust tier
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-bold text-slate-900">
            {total}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Total Members
          </p>
        </div>
      </div>

      <div className="h-4 w-full flex bg-slate-100 rounded-full overflow-hidden">
        {segments.map((s: any, i) => (
          <div
            key={i}
            className={cn("h-full transition-all duration-1000", s.color)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        {segments.map((s: any, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", s.color)} />
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {s.label}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-900">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
