"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPIMetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: "glass" | "solid" | "ghost";
}

export function KPIMetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "glass",
}: KPIMetricCardProps) {
  return (
    <div
      className={cn(
        "group relative p-6 rounded-3xl border transition-all duration-300 hover:shadow-lg",
        variant === "glass" &&
          "bg-white/70 backdrop-blur-xl border-slate-200/60 shadow-sm",
        variant === "solid" && "bg-white border-slate-100 shadow-sm",
        variant === "ghost" && "bg-transparent border-dashed border-slate-200",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600",
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            vs. last month
          </span>
        </div>
      )}

      {description && (
        <p className="mt-4 text-xs text-slate-500 leading-relaxed font-sans">
          {description}
        </p>
      )}

      {/* Subtle border reflection effect for glassmorphism */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
