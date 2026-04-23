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
import { HomepageContentTab } from "@/components/admin/homepage-content-tab";
import { FeedbackTab } from "@/components/admin/feedback-tab";
import {
  getFeedbackEntries,
  getHomepageContentAdmin,
} from "@/actions/site-content";
import {
  AuthenticatedShell,
  type ShellNavItem,
} from "@/components/layout/authenticated-shell";

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
  const canManageHomepageContent = isAdmin || isSuperAdmin;
  const canViewFeedback = isAdmin || isSuperAdmin;

  const homepageContent = canManageHomepageContent
    ? await getHomepageContentAdmin()
    : { faqs: [], testimonials: [] };
  const feedbackEntries = canViewFeedback ? await getFeedbackEntries() : [];
  const navItems: ShellNavItem[] = [
    { value: "overview", label: "Pangkalahatan", icon: "overview" },
    {
      value: "approvals",
      label: "Mga Pag-apruba",
      icon: "approvals",
      badge: pendingData.loans.length + pendingData.verifications.length,
    },
    { value: "members", label: "Mga Miyembro", icon: "members" },
  ];

  if (canManageTenantProducts) {
    navItems.push({
      value: "products",
      label: "Produkto ng Loan",
      icon: "products",
    });
  }

  if (canViewBranchOps) {
    navItems.push({
      value: "branches",
      label: isSuperAdmin ? "Global Tenant Mgmt" : "Branch Ops",
      icon: "branches",
    });
  }

  if (canManageHomepageContent) {
    navItems.push({
      value: "content",
      label: "Homepage Content",
      icon: "content",
    });
  }

  if (canViewFeedback) {
    navItems.push({
      value: "feedback",
      label: "Feedback Inbox",
      icon: "feedback",
    });
  }

  navItems.push({
    value: "settings",
    label: "Settings",
    icon: "settings",
  });

  if (canViewAuditLogs) {
    navItems.push({
      value: "audit",
      label: "Audit Logs",
      icon: "audit",
    });
  }

  return (
    <Tabs defaultValue="overview" className="min-h-screen">
      <AuthenticatedShell
        title="Pangkalahatan"
        subtitle={
          isLender
            ? "Tenant-level operations, borrower oversight, at trust monitoring."
            : isAdmin
              ? "Tenant-level administration para sa approvals, member safety, at portfolio health."
              : "Global oversight para sa tenant cooperatives, fraud monitoring, at system health."
        }
        portalLabel={`${userRole} portal`}
        accountName={userName}
        accountRole={userRole}
        navItems={navItems}
      >
        <div className="space-y-6">
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

          {canManageHomepageContent && (
            <TabsContent value="content" className="outline-none">
              <HomepageContentTab
                role={userRole}
                faqs={homepageContent.faqs}
                testimonials={homepageContent.testimonials}
              />
            </TabsContent>
          )}

          {canViewFeedback && (
            <TabsContent value="feedback" className="outline-none">
              <FeedbackTab role={userRole} entries={feedbackEntries} />
            </TabsContent>
          )}

          <TabsContent value="audit" className="outline-none">
            <AuditLogViewer
              tenantId={
                session?.user?.role === "superadmin"
                  ? undefined
                  : Number(session?.user?.tenantId || 0)
              }
            />
          </TabsContent>
        </div>
      </AuthenticatedShell>
    </Tabs>
  );
}
