import { TabsContent } from "@/components/ui/tabs";
import { TrendingUp, AlertCircle, ShieldAlert, HeartPulse } from "lucide-react";
import { TenantNameSettingsCard } from "@/components/admin/tenant-name-settings-card";
import { BrandingTabWrapper } from "@/components/admin/tenant-branding-card";
import { getEndOfDayReconciliation } from "@/actions/reconciliation";

import { LoanProductsTab } from "@/components/admin/loan-products-tab";
import { TenantManagementTab } from "@/components/admin/tenant-management-tab";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { getTenants } from "@/actions/tenant-management";
import { auth } from "@/lib/auth";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentSubscription } from "@/actions/subscription-actions";

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
import { CompassionActionsTab } from "@/components/admin/compassion-actions-tab";
import {
  getFeedbackEntries,
  getHomepageContentAdmin,
} from "@/actions/site-content";
import {
  type ShellNavItem,
  type ShellIconName,
} from "@/components/layout/authenticated-shell";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";
import { getCommunityStaffSummary } from "@/actions/community-actions";
import { CommunityOperationsTab } from "@/components/admin/community-operations-tab";
import { AnalyticsDashboardTab } from "@/components/admin/analytics-dashboard-tab";
import { ReconciliationTab } from "@/components/admin/reconciliation-tab";
import { SubscriptionSettings } from "@/components/admin/subscription-settings";
import { SystemFileManagement } from "@/components/admin/system-file-management";
import { TopUpQueueTab } from "@/components/admin/topup-queue-tab";
import { getPendingTopUps } from "@/actions/wallet-actions";
import { SystemHealthTab } from "@/components/admin/system-health-tab";
function SystemFileManagementSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      <div className="animate-pulse flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>
      <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" />
    </div>
  );
}

import { requireTanawSession } from "@/lib/authorization";

export default async function AgapayTanawPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;
  const session = await requireTanawSession();

  if (session.user.role === "member") {
    redirect(`/${branch}/agapay-pintig`);
  }

  const userName = session?.user?.username || "Admin";
  const userRole = session?.user?.role || "lender";
  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";
  const isLender = userRole === "lender";
  const tenantContextId = session.user.tenantId ?? null;
  const isGlobalSuperadminView = isSuperAdmin && tenantContextId === null;
  const canViewProducts = isAdmin || isSuperAdmin;
  const hasTenantScopedProductAccess =
    isAdmin || (isSuperAdmin && !!tenantContextId);
  const canViewBranchOps = isSuperAdmin;
  const canViewAuditLogs = isAdmin || isSuperAdmin;
  const canManageHomepageContent = isAdmin || isSuperAdmin;
  const canViewFeedback = isAdmin || isSuperAdmin;
  const canViewAnalytics = (isAdmin || isSuperAdmin) && !isLender;

  const reconciliation =
    tenantContextId !== null
      ? await getEndOfDayReconciliation(
          new Date().toISOString().split("T")[0],
          tenantContextId,
        )
      : null;

  const userWith2FA = await prisma.user.findUnique({
    where: { user_id: session?.user?.user_id },
    include: { two_factor_auth: true },
  });
  const is2FAEnabled = userWith2FA?.two_factor_auth?.is_enabled || false;
  const tenants = canViewBranchOps ? await getTenants() : [];

  // Data fetching for administrative views
  const members = await getTenantMembers();
  const pendingData = await getPendingApprovals();
  const metrics = await getDashboardMetrics();
  const trustData = await getTenantTrustMetrics();
  const pendingTopUps = isAdmin || isSuperAdmin ? await getPendingTopUps() : [];

  const homepageContent = canManageHomepageContent
    ? await getHomepageContentAdmin()
    : { faqs: [], testimonials: [] };
  const feedbackEntries = canViewFeedback ? await getFeedbackEntries() : [];
  const communitySummary = await getCommunityStaffSummary();
  const currentTenantIdentity =
    tenantContextId !== null
      ? await prisma.tenant.findUnique({
          where: { tenant_id: tenantContextId },
          select: {
            tenant_id: true,
            name: true,
            brand_color: true,
            accent_color: true,
            font_pairing: true,
            logo_url: true,
            entitlement_status: true,
          },
        })
      : null;

  // Fetch current subscription for feature gating
  const currentSubRes = tenantContextId
    ? await getCurrentSubscription(tenantContextId)
    : { success: false, subscription: null };
  const currentPlanFeatures =
    currentSubRes.success && currentSubRes.subscription?.plan?.features
      ? (currentSubRes.subscription.plan.features as string[])
      : ["core_approvals", "core_members"]; // Default minimal features

  const isFeatureEnabled = (feature: string) => {
    if (isSuperAdmin) return true; // Superadmins override plan limits
    return currentPlanFeatures.includes(feature);
  };

  // Define role-specific navigation based on PRD
  const superadminNav: ShellNavItem[] = [
    { value: "overview", label: "Overview", icon: "overview" },
    {
      value: "approvals",
      label: "Approvals",
      icon: "approvals",
      badge: pendingData.verifications.length || undefined, // SA specifically looks at tenant doc verifications (SA-03)
    },
    {
      value: "branches",
      label: "Global Management",
      icon: "branches",
    },
    { value: "content", label: "Homepage Content", icon: "content" },
    { value: "feedback", label: "Feedback", icon: "feedback" },
    { value: "audit", label: "Audit Logs", icon: "audit" },
    { value: "reports", label: "Reports", icon: "reconciliation" }, // SA-15/16/17 placeholder
    { value: "health", label: "System Health", icon: "activity" }, // SA-18
    { value: "risk", label: "Fraud & Risk", icon: "shield" }, // SA-19 placeholder
    { value: "community", label: "Community", icon: "community" },
    { value: "settings", label: "Settings", icon: "settings" },
  ];

  const adminNav: ShellNavItem[] = [
    { value: "overview", label: "Overview", icon: "overview" },
    {
      value: "approvals",
      label: "Approvals",
      icon: "approvals",
      badge: pendingData.loans.length + pendingData.verifications.length,
    },
    { value: "members", label: "Member Directory", icon: "members" },
    { value: "files", label: "Documents", icon: "audit" },
    {
      value: "topup",
      label: "Top-Up Queue",
      icon: "wallet",
      badge: pendingTopUps.length || undefined,
    },
    { value: "products", label: "Loan Products", icon: "products" },
    { value: "branches", label: "Branch Operations", icon: "branches" }, // TA-13
    { value: "content", label: "Homepage Content", icon: "content" },
    { value: "feedback", label: "Feedback", icon: "feedback" },
    { value: "community", label: "Community", icon: "community" },
    {
      value: "reconciliation",
      label: "EOD Reconciliation",
      icon: "reconciliation",
    },
    { value: "compassion", label: "Compassion Actions", icon: "compassion" },
    { value: "analytics", label: "Analytics", icon: "analytics" },
    { value: "audit", label: "Audit Logs", icon: "audit" },
    { value: "settings", label: "Settings", icon: "settings" },
  ];

  const lenderNav: ShellNavItem[] = [
    { value: "overview", label: "Overview", icon: "overview" },
    { value: "marketplace", label: "Funding Marketplace", icon: "products" }, // TL-02 placeholder
    { value: "investments", label: "My Investments", icon: "reconciliation" }, // TL-04 placeholder
    { value: "topup", label: "Top-Up / Wallet", icon: "wallet" }, // TL-05
    { value: "risk_insights", label: "Risk & Insights", icon: "activity" }, // TL-06 placeholder
    { value: "ledger_docs", label: "Agreements & Docs", icon: "audit" }, // TL-07 placeholder
    { value: "community", label: "Community", icon: "community" },
    { value: "settings", label: "Settings", icon: "settings" },
  ];

  const navItems = isSuperAdmin
    ? superadminNav
    : isAdmin
      ? adminNav
      : lenderNav;

  return (
    <DashboardTabsShell
      defaultValue="overview"
      title="Agapay Tanaw"
      subtitle={
        isLender
          ? "Lender dashboard — manage your assigned member accounts."
          : isAdmin
            ? "Admin dashboard — full oversight of your cooperative."
            : isGlobalSuperadminView
              ? "Global Superadmin view — system-wide oversight."
              : "Branch Superadmin view — manage this cooperative branch."
      }
      portalLabel={`${userRole} portal`}
      accountName={userName}
      accountRole={userRole}
      tenantName={currentTenantIdentity?.name}
      tenantLogoUrl={currentTenantIdentity?.logo_url || undefined}
      tenantBrandColor={currentTenantIdentity?.brand_color}
      tenantAccentColor={currentTenantIdentity?.accent_color}
      tenantFontPairing={currentTenantIdentity?.font_pairing}
      navItems={navItems}
      branchSlug={branch}
    >
      <div className="space-y-5">
        {reconciliation && !reconciliation.holdings.isTreasuryHealthy && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-[1.75rem] border border-red-200 bg-red-50 p-6 shadow-lg shadow-red-500/10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-4 ring-white shadow-sm">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h3 className="text-xl font-display font-bold text-red-900 italic">
                Imbalance Alert: Treasury Pulse Check Failed
              </h3>
              <p className="text-red-700 font-medium">
                There is an imbalance of{" "}
                <span className="font-black">
                  ₱{reconciliation.holdings.imbalance.toLocaleString()}
                </span>{" "}
                between the Co-op Treasury and Member Wallets. Please review the
                EOD Reconciliation tab.
              </p>
            </div>
          </div>
        )}
        {/* Shared / Role-Specific TabsContent */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* ... existing overview content ... */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPIMetricCard
              label="Total Funds"
              value={`₱${(metrics.totalLiquidity / 1000000).toFixed(1)}M`}
              description={`Total: ₱${metrics.totalLiquidity.toLocaleString()}`}
              iconName="wallet"
              trend={{ value: 12.5, isPositive: true }}
            />
            <KPIMetricCard
              label="Active Loans"
              value={metrics.activeLoans}
              iconName="activity"
              trend={{ value: 8.2, isPositive: true }}
            />
            <KPIMetricCard
              label="Repayment Rate"
              value={`${metrics.repaymentRate.toFixed(1)}%`}
              iconName="check"
              trend={{ value: 1.4, isPositive: true }}
            />
            <KPIMetricCard
              label="Risk Exposure"
              value={`₱${(metrics.riskExposure / 1000).toFixed(0)}K`}
              description={`Delinquent: ₱${metrics.riskExposure.toLocaleString()}`}
              iconName="alert"
              trend={{ value: 3.1, isPositive: false }}
              variant="ghost"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[1.75rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-display font-bold text-slate-900">
                  Cooperative Trust Index
                </h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">
                  Current status of the trust network
                </p>
                {isAdmin || isSuperAdmin ? (
                  <TrustDistributionChart
                    distribution={trustData.distribution}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs">
                      &ldquo;Grow your investment portfolio by endorsing trusted
                      members.&rdquo;
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase text-center">
                          My Share
                        </p>
                        <p className="text-lg font-bold text-slate-900 text-center">
                          ₱{(metrics.totalLiquidity * 0.15).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase text-center">
                          Yield
                        </p>
                        <p className="text-lg font-bold text-slate-900 text-center">
                          +5.2%
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

            <div className="bg-slate-900 p-6 rounded-[1.75rem] text-white flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-display font-medium leading-tight">
                  Portfolio <br />
                  Status
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  {isLender
                    ? "Your investments are performing well. 98% of your endorsed loans are on track."
                    : "This month's collection increased 12% due to implementation of Trust-Based Incentives."}
                </p>
              </div>

              <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {isLender ? "Trust Level" : "Platform Health"}
                </p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                    style={{ width: isLender ? "92%" : "88%" }}
                  />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            </div>
          </div>
        </TabsContent>

        {/* Superadmin & Admin Shared Approvals (But separate badging in nav) */}
        {(isAdmin || isSuperAdmin) && (
          <TabsContent value="approvals" className="outline-none">
            <VerificationQueueTab data={pendingData} />
          </TabsContent>
        )}

        {/* Tenant Admin Only Modules */}
        {isAdmin && (
          <>
            <TabsContent value="topup" className="outline-none">
              <TopUpQueueTab requests={pendingTopUps as any} />
            </TabsContent>
            <TabsContent value="members" className="outline-none">
              <MemberDirectoryTab
                members={members}
                userRole={session?.user?.role}
                branches={tenants.map((t) => ({
                  id: t.tenant_id,
                  name: t.name,
                }))}
              />
            </TabsContent>
            <TabsContent value="products" className="outline-none">
              <LoanProductsTab />
            </TabsContent>
            <TabsContent value="reconciliation" className="outline-none">
              <ReconciliationTab />
            </TabsContent>
            <TabsContent value="compassion" className="outline-none">
              <CompassionActionsTab actions={pendingData.compassion || []} />
            </TabsContent>
            <TabsContent value="analytics" className="outline-none">
              <AnalyticsDashboardTab />
            </TabsContent>
            <TabsContent value="files" className="outline-none">
              <div className="space-y-6">
                <div className="bg-white/40 border border-slate-200/60 p-6 rounded-[2rem] backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 italic">
                      Document Repository
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 max-w-2xl">
                    All system-generated reports, SOAs, and documents uploaded
                    by members are stored directly in our secure database
                    storage.
                  </p>
                </div>
                <SystemFileManagement
                  tenantId={Number(session?.user?.tenantId || 0)}
                />
              </div>
            </TabsContent>
          </>
        )}

        {/* Superadmin Only Modules */}
        {isSuperAdmin && (
          <>
            <TabsContent value="health" className="outline-none">
              <SystemHealthTab />
            </TabsContent>
            <TabsContent value="branches" className="outline-none">
              <TenantManagementTab
                initialTenants={tenants}
                role={session?.user?.role as string}
              />
            </TabsContent>
            <TabsContent value="reports" className="outline-none">
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  Global Financial Reports (SA-15/16/17)
                </h3>
                <p className="text-slate-500 max-w-sm">
                  This module is currently being finalized. It will provide
                  consolidated balance sheets for the entire platform.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="risk" className="outline-none">
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  Fraud & Risk Monitoring (SA-19)
                </h3>
                <p className="text-slate-500 max-w-sm">
                  AI-driven fraud detection and multi-tenant risk assessment is
                  coming in the next update.
                </p>
              </div>
            </TabsContent>
          </>
        )}

        {/* Lender Only Modules */}
        {isLender && (
          <>
            <TabsContent value="marketplace" className="outline-none">
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  Funding Marketplace (TL-02)
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Browse loan applications from trusted co-op members and choose
                  where to allocate your capital.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="investments" className="outline-none">
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <HeartPulse className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  My Investments (TL-04)
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Track your portfolio performance, yield rates, and repayment
                  statuses in real-time.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="topup" className="outline-none">
              <div className="p-8 text-center bg-white rounded-[2rem] border border-slate-200">
                <h3 className="text-xl font-bold">Lender Wallet / Top-Up</h3>
                <p className="text-slate-500 mt-2">
                  Wallet features for Lenders are currently using the standard
                  Top-Up system.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="risk_insights" className="outline-none">
              <div className="py-20 text-center">
                <h3 className="text-2xl font-display font-bold">
                  Risk & Insights (TL-06)
                </h3>
                <p className="text-slate-500">
                  Analyze the risk scores of potential borrowers before funding.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="ledger_docs" className="outline-none">
              <div className="py-20 text-center">
                <h3 className="text-2xl font-display font-bold">
                  Agreements & Docs (TL-07)
                </h3>
                <p className="text-slate-500">
                  Access your digital contracts and investment agreements here.
                </p>
              </div>
            </TabsContent>
          </>
        )}

        {/* Shared Management Modules */}
        <TabsContent value="community" className="outline-none">
          <CommunityOperationsTab summary={communitySummary} />
        </TabsContent>

        <TabsContent value="content" className="outline-none">
          <HomepageContentTab
            role={userRole}
            faqs={homepageContent.faqs}
            testimonials={homepageContent.testimonials}
          />
        </TabsContent>

        <TabsContent value="feedback" className="outline-none">
          <FeedbackTab role={userRole} entries={feedbackEntries} />
        </TabsContent>

        <TabsContent value="audit" className="outline-none">
          <AuditLogViewer
            tenantId={
              isSuperAdmin
                ? (tenantContextId ?? undefined)
                : Number(session?.user?.tenantId || 0)
            }
          />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid w-full max-w-5xl gap-6">
              {currentTenantIdentity ? (
                <TenantNameSettingsCard
                  tenantId={
                    isSuperAdmin ? currentTenantIdentity.tenant_id : undefined
                  }
                  initialName={currentTenantIdentity.name}
                  title="Tenant Name"
                  description={
                    isSuperAdmin
                      ? "Update the name for the current tenant context."
                      : "Update your tenant's company or branch name."
                  }
                />
              ) : isSuperAdmin ? (
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
                  Select a branch from the sidebar if you want to change the
                  tenant name from `Global View`.
                </div>
              ) : null}

              {currentTenantIdentity && (isAdmin || isSuperAdmin) && (
                <BrandingTabWrapper
                  tenantId={
                    isSuperAdmin ? currentTenantIdentity.tenant_id : undefined
                  }
                  initialBranding={{
                    brand_color: currentTenantIdentity.brand_color,
                    accent_color: currentTenantIdentity.accent_color,
                    font_pairing: currentTenantIdentity.font_pairing,
                    logo_url: currentTenantIdentity.logo_url,
                  }}
                  displayName={currentTenantIdentity.name}
                />
              )}

              {tenantContextId && (isAdmin || isSuperAdmin) && (
                <div className="flex justify-center -mx-4 md:mx-0">
                  <SubscriptionSettings
                    tenantId={tenantContextId}
                    isAdmin={isAdmin || isSuperAdmin}
                    branchSlug={branch}
                  />
                </div>
              )}

              <div className="px-4 text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                  Account Security
                </h2>
                <p className="text-slate-500">Secure your access with 2FA.</p>
              </div>
              <div className="flex justify-center">
                <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </DashboardTabsShell>
  );
}
