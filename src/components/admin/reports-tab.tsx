"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  Users,
  LayoutDashboard,
  CreditCard,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { getSuperadminReports } from "@/actions/superadmin-actions";

type ReportsData = {
  totalTenants: number;
  totalUsers: number;
  totalSavingsVolume: number;
  totalActiveLoanVolume: number;
  totalOutstandingBalance: number;
  activeLoansCount: number;
  performance: {
    growthTrends: any[];
    userGrowth: any[];
    acquisition: { active: number; pending: number };
    retention: { total_members: number; members_with_loans: number };
  };
};

export function ReportsTab() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadReports = async () => {
    try {
      const res = await getSuperadminReports();
      if (res.success && res.data) {
        setData(res.data);
        setHasError(false);
      } else {
        setHasError(true);
        toast.error(res.error || "Failed to load reports");
      }
    } catch {
      setHasError(true);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">
          Loading cross-tenant financial reports...
        </div>
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <LayoutDashboard className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-display font-bold text-slate-900">Failed to load reports</h3>
        <p className="text-slate-500 text-sm max-w-md text-center">
          Could not load cross-tenant financial data. The reports service may be temporarily unavailable.
        </p>
        <button
          onClick={() => { setHasError(false); setIsLoading(true); loadReports(); }}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold text-sm transition-all hover:opacity-90 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 mb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-600" />
          Global Financial Reports
        </h2>
        <p className="text-slate-500">
          Consolidated balance sheets and metrics for the entire platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">
                  Total System Savings
                </p>
                <p className="text-4xl font-black">
                  ₱{data?.totalSavingsVolume.toLocaleString() || "0"}
                </p>
              </div>
              <Wallet className="w-10 h-10 text-indigo-300 opacity-80" />
            </div>
            <p className="text-xs text-indigo-200 mt-4 font-medium max-w-[80%]">
              Aggregated from all deposit accounts across all active tenants.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-0 shadow-lg shadow-emerald-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">
                  Active Loan Volume
                </p>
                <p className="text-4xl font-black">
                  ₱{data?.totalActiveLoanVolume.toLocaleString() || "0"}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-emerald-300 opacity-80" />
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-100 bg-black/10 w-max px-3 py-1 rounded-full">
              <span>{data?.activeLoansCount || 0} Open Loans</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 shadow-lg shadow-amber-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">
                  Outstanding Balances
                </p>
                <p className="text-4xl font-black">
                  ₱{data?.totalOutstandingBalance.toLocaleString() || "0"}
                </p>
              </div>
              <LayoutDashboard className="w-10 h-10 text-amber-300 opacity-80" />
            </div>
            <p className="text-xs text-amber-200 mt-4 font-medium max-w-[80%]">
              Total remaining principal plus interest across the platform.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Growth Trends - Tenancy & Users */}
        <Card className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xl font-display font-bold text-slate-900">
                Growth Velocity (6 Months)
              </h3>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Users</p>
            <div className="h-24 w-full bg-slate-50/50 rounded-xl flex items-end justify-between p-4 gap-2 border border-slate-100">
              {data?.performance.userGrowth.map((d: any, i: number) => (
                <div
                  key={i}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all rounded-t-lg relative group"
                  style={{
                    height: `${Math.max(8, (d.new_users / Math.max(...data.performance.userGrowth.map((x: any) => x.new_users), 1)) * 100)}%`,
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {new Date(d.month).toLocaleDateString(undefined, { month: "short" })}: {d.new_users}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Tenants</p>
            <div className="h-24 w-full bg-slate-50/50 rounded-xl flex items-end justify-between p-4 gap-2 border border-slate-100">
              {(data?.performance.growthTrends?.length ? data.performance.growthTrends : []).map((d: any, i: number) => (
                <div
                  key={i}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-lg relative group"
                  style={{
                    height: `${Math.max(8, ((d.new_tenants ?? d.count ?? 1) / Math.max(...(data?.performance.growthTrends ?? []).map((x: any) => x.new_tenants ?? x.count ?? 1), 1)) * 100)}%`,
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {d.month ? new Date(d.month).toLocaleDateString(undefined, { month: "short" }) : `M${i + 1}`}: {d.new_tenants ?? d.count ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-4">
            <span>START</span>
            <span>TENANT & MEMBER GROWTH TRENDS</span>
            <span>NOW</span>
          </div>
        </Card>

        {/* Acquisition & Retention */}
        <div className="space-y-6">
          <Card className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h3 className="text-xl font-display font-bold italic mb-6">
              Retention & Impact
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Active vs Total
                </p>
                <p className="text-3xl font-bold">
                  {data?.performance?.acquisition?.active || 0} /{" "}
                  {data?.totalUsers || 0}
                </p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{
                      width: `${((data?.performance?.acquisition?.active || 0) / (data?.totalUsers || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Loan Penetration
                </p>
                <p className="text-3xl font-bold">
                  {data?.performance?.retention?.members_with_loans || 0}
                </p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${((data?.performance?.retention?.members_with_loans || 0) / (data?.performance?.retention?.total_members || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-6 leading-relaxed">
              Platform-wide retention is measured by members actively utilizing
              loan products relative to total registered user base.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
