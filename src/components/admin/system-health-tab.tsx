"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Database,
  Server,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSystemHealth,
  getTenantHealthBreakdown,
} from "@/actions/system-health";

type HealthData = {
  totalUsers: number;
  totalLoans: number;
  activeTenants: number;
  dbSizeMB: number;
  apiUptime: number;
  queueStatus: {
    pendingLoans: number;
    pendingPayments: number;
    pendingTopUps: number;
  };
};

type TenantHealth = {
  id: number;
  name: string;
  region: string;
  memberCount: number;
  loanCount: number;
  activeLoans: number;
  defaultedLoans: number;
  healthScore: number;
  status: string;
};

export function SystemHealthTab() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [tenantHealth, setTenantHealth] = useState<TenantHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, tenantRes] = await Promise.all([
          getSystemHealth(),
          getTenantHealthBreakdown(),
        ]);

        if (healthRes.success && healthRes.data) {
          setHealthData(healthRes.data);
        }
        if (tenantRes.success && tenantRes.data) {
          setTenantHealth(tenantRes.data);
        }
      } catch (error) {
        console.error("Failed to load health data:", error);
        toast.error("Failed to load system health data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">
          Loading system health...
        </div>
      </div>
    );
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50";
    if (score >= 70) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 70) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-xs font-medium uppercase tracking-wider">
                  Total Users
                </p>
                <p className="text-3xl font-black mt-1">
                  {healthData?.totalUsers.toLocaleString() || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">
                  Active Loans
                </p>
                <p className="text-3xl font-black mt-1">
                  {healthData?.totalLoans.toLocaleString() || 0}
                </p>
              </div>
              <FileText className="w-10 h-10 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">
                  Active Tenants
                </p>
                <p className="text-3xl font-black mt-1">
                  {healthData?.activeTenants || 0}
                </p>
              </div>
              <Server className="w-10 h-10 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium uppercase tracking-wider">
                  Database Size
                </p>
                <p className="text-3xl font-black mt-1">
                  {healthData?.dbSizeMB || 0}{" "}
                  <span className="text-lg font-normal">MB</span>
                </p>
              </div>
              <Database className="w-10 h-10 text-violet-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API & Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              API Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  API Uptime
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-emerald-600">
                    {healthData?.apiUptime || 99.9}%
                  </span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${healthData?.apiUptime || 99.9}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Queue Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  Pending Loans
                </span>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-full ${
                    (healthData?.queueStatus.pendingLoans || 0) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {healthData?.queueStatus.pendingLoans || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  Pending Payments
                </span>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-full ${
                    (healthData?.queueStatus.pendingPayments || 0) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {healthData?.queueStatus.pendingPayments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  Pending Top-Ups
                </span>
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-full ${
                    (healthData?.queueStatus.pendingTopUps || 0) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {healthData?.queueStatus.pendingTopUps || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Health Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-600" />
            Tenant Health Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tenant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Region
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Members
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Loans
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Defaulted
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Health
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenantHealth.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  tenantHealth.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">
                          {tenant.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {tenant.region}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {tenant.memberCount}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {tenant.loanCount}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {tenant.activeLoans}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-red-600">
                        {tenant.defaultedLoans}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getHealthColor(tenant.healthScore)}`}
                        >
                          {getHealthIcon(tenant.healthScore)}
                          {tenant.healthScore}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            tenant.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
