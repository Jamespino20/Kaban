"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  Wallet,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Building2,
  MessagesSquare,
  BadgeCheck,
} from "lucide-react";

interface KPIMetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  iconName?:
    | "wallet"
    | "activity"
    | "check"
    | "alert"
    | "trending"
    | "users"
    | "piggy-bank"
    | "tenants"
    | "feedback"
    | "repayment";

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
  iconName,
  trend,
  className,
  variant = "glass",
}: KPIMetricCardProps) {
  const IconMap = {
    wallet: Wallet,
    activity: Activity,
    check: CheckCircle2,
    alert: AlertTriangle,
    trending: TrendingUp,
    users: Users,
    "piggy-bank": PiggyBank,
    tenants: Building2,
    feedback: MessagesSquare,
    repayment: BadgeCheck,
  };

  const Icon = iconName ? IconMap[iconName] : null;
  return (
    <div
      className={cn(
        "group relative p-6 rounded-3xl border transition-all duration-300 hover:shadow-lg",
        variant === "glass" &&
          "bg-white/70 backdrop-blur-xl border-border/60 shadow-sm",
        variant === "solid" && "bg-white border-border shadow-sm",
        variant === "ghost" && "bg-transparent border-dashed border-border",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {label}
          </p>
          <p className="text-3xl font-numbers font-bold text-foreground tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
          <span className="text-[10px] font-medium text-muted-foreground">
            vs. last month
          </span>
        </div>
      )}

      {description && (
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>
      )}

      {/* Subtle border reflection effect for glassmorphism */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
