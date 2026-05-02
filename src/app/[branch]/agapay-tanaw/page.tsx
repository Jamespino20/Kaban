import { TabsContent } from "@/components/ui/tabs";
import { TrendingUp, AlertCircle, ShieldAlert } from "lucide-react";
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
import { type ShellNavItem } from "@/components/layout/authenticated-shell";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";
import { getCommunityStaffSummary } from "@/actions/community-actions";
import { CommunityOperationsTab } from "@/components/admin/community-operations-tab";
import { AnalyticsDashboardTab } from "@/components/admin/analytics-dashboard-tab";
import { ReconciliationTab } from "@/components/admin/reconciliation-tab";
import { SubscriptionSettings } from "@/components/admin/subscription-settings";
import { SystemFileManagement } from "@/components/admin/system-file-management";
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
import { getTranslations } from "next-intl/server";

export default async function AgapayTanawPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;
  const t = await getTranslations("dashboard");
  const session = await requireTanawSession();

  if (session.user.role === "member") {
    redirect("/agapay-pintig");
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
  const canViewAnalytics = isAdmin || isSuperAdmin;

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

  const navItems: ShellNavItem[] = [
    { value: "overview", label: "Pangkalahatan", icon: "overview" },
    {
      value: "approvals",
      label: "Mga Pag-apruba",
      icon: "approvals",
      badge: pendingData.loans.length + pendingData.verifications.length,
    },
    { value: "members", label: "Mga Miyembro", icon: "members" },
    { value: "files", label: "Mga Dokumento", icon: "audit" },
  ];

  if (canViewProducts && isFeatureEnabled("advanced_products")) {
    navItems.push({
      value: "products",
      label: t("loan_products"),
      icon: "products",
    });
  }

  if (canViewBranchOps && isFeatureEnabled("multi_tenant_mgmt")) {
    navItems.push({
      value: "branches",
      label: isSuperAdmin ? t("global_mgmt") : t("branch_ops"),
      icon: "branches",
    });
  }

  if (canManageHomepageContent && isFeatureEnabled("content_mgmt")) {
    navItems.push({
      value: "content",
      label: t("homepage_content"),
      icon: "content",
    });
  }

  if (canViewFeedback) {
    navItems.push({
      value: "feedback",
      label: t("feedback"),
      icon: "feedback",
    });
  }

  navItems.push({
    value: "community",
    label: t("community"),
    icon: "community",
  });

  if ((isAdmin || isSuperAdmin) && isFeatureEnabled("eod_reconciliation")) {
    navItems.push({
      value: "reconciliation",
      label: "EOD Reconciliation",
      icon: "reconciliation",
    });
  }

  if (isAdmin || isSuperAdmin) {
    navItems.push({
      value: "compassion",
      label: t("compassion"),
      icon: "compassion",
    });
  }

  if (canViewAnalytics && isFeatureEnabled("advanced_analytics")) {
    navItems.push({
      value: "analytics",
      label: t("analytics"),
      icon: "analytics",
    });
  }

  if (canViewAuditLogs && isFeatureEnabled("audit_logs")) {
    navItems.push({
      value: "audit",
      label: t("audit_logs"),
      icon: "audit",
    });
  }

  navItems.push({
    value: "settings",
    label: "Settings",
    icon: "settings",
  });

  return (
    <DashboardTabsShell
      defaultValue="overview"
      title={t("title")}
      subtitle={
        isLender
          ? t("subtitle_lender")
          : isAdmin
            ? t("subtitle_admin")
            : isGlobalSuperadminView
              ? t("subtitle_superadmin")
              : t("subtitle_branch")
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
                Mayroong imbalance na{" "}
                <span className="font-black">
                  ₱{reconciliation.holdings.imbalance.toLocaleString()}
                </span>{" "}
                sa pagitan ng Co-op Treasury at Member Wallets. Pakisuri ang EOD
                Reconciliation tab.
              </p>
            </div>
          </div>
        )}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-[1.75rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-display font-bold text-slate-900">
                  Trust Index ng Kooperatiba
                </h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">
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

            <div className="bg-slate-900 p-6 rounded-[1.75rem] text-white flex flex-col justify-between overflow-hidden relative group">
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
          <MemberDirectoryTab
            members={members}
            userRole={session?.user?.role}
            branches={tenants.map((t) => ({ id: t.tenant_id, name: t.name }))}
          />
        </TabsContent>

        <TabsContent value="community" className="outline-none">
          <CommunityOperationsTab summary={communitySummary} />
        </TabsContent>

        {(isAdmin || isSuperAdmin) && (
          <TabsContent value="compassion" className="outline-none">
            <CompassionActionsTab actions={pendingData.compassion || []} />
          </TabsContent>
        )}

        {canViewProducts && (
          <TabsContent value="products" className="outline-none">
            {hasTenantScopedProductAccess ? (
              <LoanProductsTab />
            ) : (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-8 shadow-sm">
                <div className="max-w-2xl space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
                    Tenant Context Needed
                  </p>
                  <h2 className="text-2xl font-display font-bold italic text-slate-900">
                    Pumili muna ng branch bago mag-manage ng Loan Products
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Bilang `superadmin`, makakakita ka ng tenant-wide product
                    setup sa oras na may aktibo kang branch context. Gamitin ang
                    branch switcher sa sidebar account area para pumili ng
                    cooperative branch, tapos bumalik dito para mag-review o
                    gumawa ng produkto.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {canViewBranchOps && (
          <TabsContent value="branches" className="outline-none">
            <TenantManagementTab
              initialTenants={tenants}
              role={session?.user?.role as string}
            />
          </TabsContent>
        )}

        <TabsContent value="settings" className="outline-none">
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid w-full max-w-5xl gap-6">
              {currentTenantIdentity ? (
                <TenantNameSettingsCard
                  tenantId={
                    session.user.role === "superadmin"
                      ? currentTenantIdentity.tenant_id
                      : undefined
                  }
                  initialName={currentTenantIdentity.name}
                  title="Tenant Name"
                  description={
                    session.user.role === "superadmin"
                      ? "Maaari mong i-update ang company o branch name ng kasalukuyang tenant context."
                      : "Maaari mong i-update ang company o branch name ng iyong tenant."
                  }
                />
              ) : session.user.role === "superadmin" ? (
                <div className="w-full max-w-2xl rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
                  Pumili muna ng branch sa sidebar kung gusto mong palitan ang
                  tenant name mula sa `Global View`.
                </div>
              ) : null}

              {currentTenantIdentity && (
                <BrandingTabWrapper
                  tenantId={
                    session.user.role === "superadmin"
                      ? currentTenantIdentity.tenant_id
                      : undefined
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

              <div className="flex justify-center -mx-4 md:mx-0">
                {tenantContextId && (
                  <SubscriptionSettings
                    tenantId={tenantContextId}
                    isAdmin={isAdmin || isSuperAdmin}
                    branchSlug={branch}
                  />
                )}
              </div>

              <div className="px-4 text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                  Account Security
                </h2>
                <p className="text-slate-500">
                  I-secure ang iyong administrative access gamit ang 2FA.
                </p>
              </div>
              <div className="flex justify-center">
                <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
              </div>
            </div>
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

        {canViewAuditLogs && (
          <TabsContent value="audit" className="outline-none">
            <AuditLogViewer
              tenantId={
                session?.user?.role === "superadmin"
                  ? (tenantContextId ?? undefined)
                  : Number(session?.user?.tenantId || 0)
              }
            />
          </TabsContent>
        )}

        {(isAdmin || isSuperAdmin) && (
          <TabsContent value="files" className="outline-none">
            <div className="space-y-6">
              <div className="bg-white/40 border border-slate-200/60 p-6 rounded-[2rem] backdrop-blur-md">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 italic">
                    Repository ng mga Dokumento
                  </h2>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">
                  Dito makikita ang lahat ng system-generated reports, SOA, at
                  mga dokumentong ini-upload ng mga miyembro na direktang
                  nakatago sa ating secure database storage.
                </p>
              </div>

              <SystemFileManagement
                tenantId={
                  session?.user?.role === "superadmin"
                    ? (tenantContextId ?? undefined)
                    : Number(session?.user?.tenantId || 0)
                }
              />
            </div>
          </TabsContent>
        )}

        {canViewAnalytics && (
          <TabsContent value="analytics" className="outline-none">
            <AnalyticsDashboardTab />
          </TabsContent>
        )}

        <TabsContent value="reconciliation" className="outline-none">
          <ReconciliationTab />
        </TabsContent>
      </div>
    </DashboardTabsShell>
  );
}
