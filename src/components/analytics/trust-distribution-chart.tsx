"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TrustDistributionChartProps {
  distribution: {
    t1_5Percent: number;
    t2_4_5Percent: number;
    t3_4Percent: number;
    t4_3_5Percent: number;
    t5_3Percent: number;
    overdueMembers: number;
  };
}

export function TrustDistributionChart({
  distribution,
}: TrustDistributionChartProps) {
  const total =
    distribution.t1_5Percent +
    distribution.t2_4_5Percent +
    distribution.t3_4Percent +
    distribution.t4_3_5Percent +
    distribution.t5_3Percent;

  const segments = [
    {
      label: "Starter (5.0%)",
      value: distribution.t1_5Percent,
      color: "bg-rose-500",
    },
    {
      label: "Bridge (4.5%)",
      value: distribution.t2_4_5Percent,
      color: "bg-orange-500",
    },
    {
      label: "Build (4.0%)",
      value: distribution.t3_4Percent,
      color: "bg-amber-500",
    },
    {
      label: "Growth (3.5%)",
      value: distribution.t4_3_5Percent,
      color: "bg-indigo-500",
    },
    {
      label: "Elite (3.0%)",
      value: distribution.t5_3Percent,
      color: "bg-emerald-500",
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
            style={{ width: `${total === 0 ? 0 : (s.value / total) * 100}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-y-3 gap-x-8 md:grid-cols-2">
        {segments.map((s: any, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", s.color)} />
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {s.label}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-900">
              {total === 0 ? 0 : Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
          Overdue Members
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {distribution.overdueMembers} miyembro ang may overdue schedules sa
          kasalukuyan.
        </p>
      </div>
    </div>
  );
}
