"use client";

import { useEffect, useState } from "react";
import { getTenantPerformanceReports } from "@/actions/superadmin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Target } from "lucide-react";

type GrowthTrend = {
  tenant_id: number;
  tenant_name: string;
  month: Date;
  new_members: number;
  new_loans: number;
};

type MemberAcquisition = {
  tenant_id: number;
  tenant_name: string;
  total_members: number;
  active_members: number;
  pending_members: number;
  activation_rate_percent: number;
};

type RetentionRate = {
  tenant_id: number;
  tenant_name: string;
  total_members: number;
  members_with_loans: number;
  loan_penetration_percent: number;
};

export function TenantPerformanceReportsTab() {
  const [loading, setLoading] = useState(true);
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([]);
  const [memberAcquisition, setMemberAcquisition] = useState<MemberAcquisition[]>([]);
  const [retentionRates, setRetentionRates] = useState<RetentionRate[]>([]);

  useEffect(() => {
    async function load() {
      const res = await getTenantPerformanceReports({});
      if (res.success && res.data) {
        setGrowthTrends(res.data.growthTrends as GrowthTrend[]);
        setMemberAcquisition(res.data.memberAcquisition as MemberAcquisition[]);
        setRetentionRates(res.data.retentionRates as RetentionRate[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[1.75rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-display font-bold text-slate-900">
            Tenant Performance Reports
          </h3>
          <p className="text-sm text-slate-500">
            Growth trends, member acquisition, and retention rates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {memberAcquisition.map((ta) => (
          <Card key={ta.tenant_id} className="rounded-[1.75rem] border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-bold">
                  {ta.tenant_name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    ta.activation_rate_percent >= 70
                      ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                      : ta.activation_rate_percent >= 40
                        ? "border-amber-200 text-amber-700 bg-amber-50"
                        : "border-red-200 text-red-700 bg-red-50"
                  }
                >
                  {ta.activation_rate_percent.toFixed(1)}% active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                  <p className="text-2xl font-bold text-slate-900">
                    {ta.total_members}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                    Total
                  </p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                  <p className="text-2xl font-bold text-emerald-700">
                    {ta.active_members}
                  </p>
                  <p className="text-[10px] text-emerald-600 uppercase tracking-wider mt-1">
                    Active
                  </p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-2xl">
                  <p className="text-2xl font-bold text-amber-700">
                    {ta.pending_members}
                  </p>
                  <p className="text-[10px] text-amber-600 uppercase tracking-wider mt-1">
                    Pending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {retentionRates.length > 0 && (
        <Card className="rounded-[1.75rem] border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-base font-display font-bold">
                Loan Penetration & Retention
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {retentionRates.map((rr) => (
                <div
                  key={rr.tenant_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl"
                >
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {rr.tenant_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {rr.members_with_loans} of {rr.total_members} members have loans
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {rr.loan_penetration_percent.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      penetration
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {growthTrends.length > 0 && (
        <Card className="rounded-[1.75rem] border-slate-200/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-base font-display font-bold">
                Monthly Growth Trends
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Tenant</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Month</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">New Members</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">New Loans</th>
                  </tr>
                </thead>
                <tbody>
                  {growthTrends.map((gt, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-900">{gt.tenant_name}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {new Date(gt.month).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-900">{gt.new_members}</td>
                      <td className="py-2 px-3 text-right text-slate-900">{gt.new_loans}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {memberAcquisition.length === 0 && retentionRates.length === 0 && (
        <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium mb-2">No performance data yet</h3>
          <p className="text-slate-500 text-sm">
            Performance reports will populate as tenants onboard and members become active.
          </p>
        </div>
      )}
    </div>
  );
}