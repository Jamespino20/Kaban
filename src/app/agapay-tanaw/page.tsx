import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Settings2,
  Users2,
  FileText,
  ShieldAlert,
  History,
  TrendingUp,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { LoanProductsTab } from "@/components/admin/loan-products-tab";
import { TenantManagementTab } from "@/components/admin/tenant-management-tab";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { getTenants } from "@/actions/tenant-management";
import { auth } from "@/lib/auth";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import { TrustDistributionChart } from "@/components/analytics/trust-distribution-chart";
import { MemberDirectoryTab } from "@/components/admin/member-directory-tab";
import { VerificationQueueTab } from "@/components/admin/verification-queue-tab";
import {
  getTenantMembers,
  getPendingApprovals,
  getDashboardMetrics,
  getTenantTrustMetrics,
} from "@/actions/admin-actions";

import { TrustMeter } from "@/components/analytics/trust-meter";
import { KPIMetricCard } from "@/components/analytics/kpi-metric-card";

export default async function AgapayTanawPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  if (session.user.role === "member") {
    redirect("/agapay-pintig");
  }

  const tenants = await getTenants();
  const userName = session?.user?.username || "Admin";
  const userRole = session?.user?.role || "lender";

  const userWith2FA = await prisma.user.findUnique({
    where: { user_id: session?.user?.user_id },
    include: { two_factor_auth: true },
  });
  const is2FAEnabled = userWith2FA?.two_factor_auth?.is_enabled || false;

  // Data fetching for administrative views
  const members = await getTenantMembers();
  const pendingData = await getPendingApprovals();
  const metrics = await getDashboardMetrics();
  const trustData = await getTenantTrustMetrics();

  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const isLender = userRole === "lender";
  const canManageTenantProducts = isAdmin;
  const canViewBranchOps = isAdmin || isSuperAdmin;
  const canViewAuditLogs = isAdmin || isSuperAdmin;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight italic">
              Agapay Tanaw Command Center
            </h1>
            <p className="text-slate-500 font-sans">
              {isLender
                ? "Tenant-level operations, borrower oversight, at trust monitoring."
                : isAdmin
                  ? "Tenant-level administration para sa approvals, member safety, at portfolio health."
                  : "Global oversight para sa tenant cooperatives, fraud monitoring, at system health."}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 text-emerald-600 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                {userRole.toUpperCase()} PORTAL
              </span>
            </div>
            <UserAccountNav name={userName} />
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-1.5 border border-slate-200/60 rounded-2xl shadow-sm overflow-x-auto">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger
                value="overview"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Pangkalahatan</span>
              </TabsTrigger>

              <TabsTrigger
                value="approvals"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Mga Pag-apruba</span>
                {pendingData.loans.length + pendingData.verifications.length >
                  0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
              </TabsTrigger>

              <TabsTrigger
                value="members"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <Users2 className="w-4 h-4" />
                <span>Mga Miyembro</span>
              </TabsTrigger>

              {canManageTenantProducts && (
                <>
                  <TabsTrigger
                    value="products"
                    className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>Produkto ng Loan</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="branches"
                    className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>
                      {isSuperAdmin ? "Global Tenant Mgmt" : "Branch Ops"}
                    </span>
                  </TabsTrigger>
                </>
              )}
              {!canManageTenantProducts && canViewBranchOps && (
                <TabsTrigger
                  value="branches"
                  className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isSuperAdmin ? "Global Tenant Mgmt" : "Branch Ops"}</span>
                </TabsTrigger>
              )}

              <TabsTrigger
                value="settings"
                className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>

              {canViewAuditLogs && (
                <TabsTrigger
                  value="audit"
                  className="rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all px-6 py-2.5 flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span>Audit Logs</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPIMetricCard
                label="Kabuuang Pondo"
                value={`₱${(metrics.totalLiquidity / 1000000).toFixed(1)}M`}
                description={`Kabuuan: ₱${metrics.totalLiquidity.toLocaleString()}`}
                iconName="wallet"
                trend={{ value: 12.5, isPositive: true }}
              />
              <KPIMetricCard
                label="Aktibong Loan"
                value={metrics.activeLoans}
                iconName="activity"
                trend={{ value: 8.2, isPositive: true }}
              />
              <KPIMetricCard
                label="Antas ng Pagbabayad"
                value={`${metrics.repaymentRate.toFixed(1)}%`}
                iconName="check"
                trend={{ value: 1.4, isPositive: true }}
              />
              <KPIMetricCard
                label="Panganib sa Pondo"
                value={`₱${(metrics.riskExposure / 1000).toFixed(0)}K`}
                description={`Delinquent: ₱${metrics.riskExposure.toLocaleString()}`}
                iconName="alert"
                trend={{ value: 3.1, isPositive: false }}
                variant="ghost"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-display font-bold text-slate-900">
                    Trust Index ng Kooperatiba
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 mb-8">
                    Kasalukuyang katayuan ng trust network
                  </p>
                  {canViewBranchOps ? (
                    <TrustDistributionChart
                      distribution={trustData.distribution}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs">
                        "Ang iyong branch ay lumalago. Patuloy na i-verify ang
                        trust status ng mga miyembro."
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">
                            Singilin
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            ₱42.5K
                          </p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase">
                            Paglago
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            +8 Miyembro
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 scale-110 md:scale-125">
                  <TrustMeter data={trustData.aggregateTrust} />
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-medium leading-tight">
                    Katayuan ng <br />
                    Portfolio
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                    Ang koleksyon ngayong buwan ay tumaas ng 12% dahil sa
                    implementasyon ng Trust-Based Incentives. Ang elite tier ay
                    lumaki ng 5%.
                  </p>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Kalusugan ng Platform
                  </p>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[88%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>

                {/* Abstract background shape */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="outline-none">
            <VerificationQueueTab data={pendingData} />
          </TabsContent>

          <TabsContent value="members" className="outline-none">
            <MemberDirectoryTab members={members} />
          </TabsContent>

          <TabsContent value="products" className="outline-none">
            <LoanProductsTab />
          </TabsContent>

          <TabsContent value="branches" className="outline-none">
            <TenantManagementTab
              initialTenants={tenants}
              role={session?.user?.role as string}
            />
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                  Account Security
                </h2>
                <p className="text-slate-500">
                  I-secure ang iyong administrative access gamit ang 2FA.
                </p>
              </div>
              <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
            </div>
          </TabsContent>

          <TabsContent value="audit" className="outline-none">
            <AuditLogViewer
              tenantId={
                session?.user?.role === "superadmin"
                  ? undefined
                  : Number(session?.user?.tenantId || 0)
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
