"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-100 dark:bg-slate-800",
        className,
      )}
      {...props}
    />
  );
}

export function KPICardSkeleton() {
  return (
    <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="w-12 h-12 rounded-2xl" />
      </div>
      <Skeleton className="h-3 w-40 mt-4" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-[1.75rem] border border-slate-100 bg-white shadow-sm space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ManagementCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="p-5 space-y-6">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <Skeleton className="h-full min-h-[300px] rounded-[1.75rem]" />
      </div>
    </div>
  );
}
