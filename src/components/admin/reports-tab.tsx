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
} from "lucide-react";
import { getSuperadminReports } from "@/actions/superadmin-actions";

type ReportsData = {
  totalTenants: number;
  totalUsers: number;
  totalSavingsVolume: number;
  totalActiveLoanVolume: number;
  totalOutstandingBalance: number;
  activeLoansCount: number;
};

export function ReportsTab() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await getSuperadminReports();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "Failed to load reports");
        }
      } catch (error) {
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">
          Loading cross-tenant financial reports...
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              Tenant Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  Active Tenants
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {data?.totalTenants || 0}
                </p>
              </div>
              <LayoutDashboard className="w-12 h-12 text-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              User Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  Registered Members
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {data?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
