import { TabsContent } from "@/components/ui/tabs";
import { TrendingUp, AlertCircle, ShieldAlert, HeartPulse } from "lucide-react";
import { TenantNameSettingsCard } from "@/components/admin/tenant-name-settings-card";
import { BrandingTabWrapper } from "@/components/admin/tenant-branding-card";
import { getEndOfDayReconciliation } from "@/actions/reconciliation";

import {
  FileText,
  BarChart3,
  CloudIcon,
  Server,
  Database,
  Activity,
} from "lucide-react";
import { LoanProductsTab } from "@/components/admin/loan-products-tab";
import { TenantManagementTab } from "@/components/admin/tenant-management-tab";
import { ReportsTab } from "@/components/admin/reports-tab";
import { FraudRiskTab } from "@/components/admin/fraud-risk-tab";
import { getTenants } from "@/actions/tenant-management";
import { auth } from "@/lib/auth";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentSubscription } from "@/actions/subscription-actions";

import { TrustDistributionChart } from "@/components/analytics/trust-distribution-chart";
import { MemberDirectoryTab } from "@/components/admin/member-directory-tab";
import {
  getTenantMembers,
  getPendingApprovals,
  getDashboardMetrics,
  getTenantTrustMetrics,
} from "@/actions/admin-actions";

import { TrustMeter } from "@/components/analytics/trust-meter";
import { KPIMetricCard } from "@/components/analytics/kpi-metric-card";
import { HomepageContentTab } from "@/components/admin/homepage-content-tab";
import {
  getFeedbackEntries,
  getHomepageContentAdmin,
} from "@/actions/site-content";
import {
  type ShellNavItem,
  type ShellIconName,
} from "@/components/layout/authenticated-shell";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";
import { getCommunityStaffSummary, getCommunityDashboardData } from "@/actions/community-actions";
import { SuperadminCommunityTab } from "@/components/admin/superadmin-community-tab";
import { CommunityOperationsTab } from "@/components/admin/community-operations-tab";
import { CommunityTab } from "@/components/member/community-tab";
import { AnalyticsDashboardTab } from "@/components/admin/analytics-dashboard-tab";
import { ReconciliationTab } from "@/components/admin/reconciliation-tab";
import { SubscriptionSettings } from "@/components/admin/subscription-settings";
import { SystemFileManagement } from "@/components/admin/system-file-management";
import { getPendingTopUps } from "@/actions/wallet-actions";
import { SystemHealthTab } from "@/components/admin/system-health-tab";
import { ApprovalsQueueModule } from "@/components/admin/approvals-queue-module";
import { SupportAnalyticsModule } from "@/components/admin/support-analytics-module";
import SuperadminOverviewTab from "@/components/admin/superadmin-overview-tab";
import { SuperadminApprovalsTab } from "@/components/admin/superadmin-approvals-tab";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { TenantPerformanceReportsTab } from "@/components/admin/tenant-performance-reports-tab";
import { AdminProfileSettings } from "@/components/admin/admin-profile-settings";
import { EmailTemplatesTab } from "@/components/admin/email-templates-tab";
import { AIConfigTab } from "@/components/admin/ai-config-tab";
import { SubscriptionsModule } from "@/components/admin/subscriptions-module";
import { getAllSubscriptionPlans, getAllTenantSubscriptions } from "@/actions/subscription-actions";

function SystemFileManagementSkeleton() {
  return (
    <div className="dashboard-card space-y-6">
      <div className="animate-pulse flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>
      <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" />
    </div>
  );
}

import { requireTanawSession } from "@/lib/authorization";

function getTanawRoleLabel(role: string) {
  if (role === "superadmin") return "Superadmin";
  if (role === "operator") return "Tenant Operator";
  return "Tanaw User";
}

export default async function AgapayTanawPage({
  params,
}: {
  params: { tenant: string };
}) {
  const { tenant } = params;
  const session = await requireTanawSession();

  if (session.user.role === "member") {
    redirect(`/${tenant}/agapay-pintig`);
  }

  const adminProfileData = await prisma.userProfile.findUnique({
    where: { user_id: session.user.user_id },
    select: { first_name: true, last_name: true, photo_url: true },
  });
  const userName = session?.user?.username || "Operator";
  const userRole = session?.user?.role || "operator";
  const roleLabel = getTanawRoleLabel(userRole);
  const isSuperAdmin = userRole === "superadmin";
  const isOperator = userRole === "operator";
  const tenantContextId = session.user.tenantId ?? null;
  const isGlobalSuperadminView = isSuperAdmin && tenantContextId === null;
  const canViewProducts = isOperator || isSuperAdmin;
  const hasTenantScopedProductAccess =
    isOperator || (isSuperAdmin && !!tenantContextId);
  const canViewTenantOps = isSuperAdmin; // Superadmins always have access to Global Management
  const canViewAuditLogs = isOperator || isSuperAdmin;
  const canManageHomepageContent = isOperator || isSuperAdmin;
  const canViewFeedback = isOperator || isSuperAdmin;
  const canViewAnalytics = isOperator || isSuperAdmin;

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
  const tenants = canViewTenantOps ? await getTenants() : [];

  // Data fetching for administrative views
  const members = await getTenantMembers();
  const pendingData = await getPendingApprovals();
  const metrics = await getDashboardMetrics();
  const trustData = await getTenantTrustMetrics();
  const pendingTopUps =
    isOperator || isSuperAdmin ? await getPendingTopUps() : [];

  const homepageContent = canManageHomepageContent
    ? await getHomepageContentAdmin()
    : { faqs: [], testimonials: [] };
  const feedbackEntries = canViewFeedback ? await getFeedbackEntries() : [];
  const [allPlansRes, allTenantSubsRes] = isSuperAdmin
    ? await Promise.all([
        getAllSubscriptionPlans(),
        getAllTenantSubscriptions(),
      ])
    : [{ success: false, plans: [] }, { success: false, tenants: [] }];
  const subscriptionPlans = allPlansRes.success ? allPlansRes.plans || [] : [];
  const tenantSubscriptions = allTenantSubsRes.success ? allTenantSubsRes.tenants || [] : [];
  const communitySummary = await getCommunityStaffSummary();
  const operatorCommunityData = isOperator ? await getCommunityDashboardData() : null;
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

  // Define role-specific navigation based on PRD hierarchy
  const superadminNav: ShellNavItem[] = [
    // Category: Core Operations
    {
      value: "overview",
      label: "Overview",
      icon: "overview",
      category: "Core Operations",
    },
    {
      value: "community",
      label: "Community",
      icon: "community",
      category: "Core Operations",
    },
    {
      value: "approvals",
      label: "Approvals",
      icon: "approvals",
      badge: pendingData.verifications.length || undefined,
      category: "Core Operations",
    },

    // Category: Platform Strategy
    {
      value: "tenants",
      label: "Global Management",
      icon: "tenants",
      category: "Platform Strategy",
    },
    {
      value: "content",
      label: "Homepage Content",
      icon: "content",
      category: "Platform Strategy",
    },
    {
      value: "feedback",
      label: "Feedback",
      icon: "feedback",
      category: "Platform Strategy",
    },
    {
      value: "email-templates",
      label: "Email Templates",
      icon: "mail",
      category: "Platform Strategy",
    },
    {
      value: "ai-config",
      label: "AI Config",
      icon: "bot",
      category: "Platform Strategy",
    },
    {
      value: "subscriptions",
      label: "Subscriptions",
      icon: "subscriptions",
      category: "Platform Strategy",
    },

    // Category: System & Audits
    {
      value: "reports",
      label: "Reports",
      icon: "reconciliation",
      category: "System & Audits",
    },
    {
      value: "audit",
      label: "Audit Logs",
      icon: "audit",
      category: "System & Audits",
    },
    {
      value: "settings",
      label: "Settings",
      icon: "settings",
      category: "System & Audits",
    },
  ];

  const operatorNav: ShellNavItem[] = [
    // 1. Core Operations
    {
      value: "overview",
      label: "Overview",
      icon: "overview",
      category: "Core Operations",
    },
    {
      value: "approvals",
      label: "Approvals & Queue",
      icon: "approvals",
      badge:
        pendingData.loans.length +
          pendingData.verifications.length +
          pendingTopUps.length || undefined,
      category: "Core Operations",
    },

    // 2. Capital
    {
      value: "vault",
      label: "Capital & Investments",
      icon: "wallet",
      category: "Capital",
    },

    // 3. Members
    {
      value: "members",
      label: "Member Management",
      icon: "members",
      category: "Members",
    },

    // 4. Loan Operations
    {
      value: "products",
      label: "Loan Products & Policy",
      icon: "products",
      category: "Loan Operations",
    },
    {
      value: "reconciliation",
      label: "Treasury & Reconciliation",
      icon: "reconciliation",
      category: "Loan Operations",
    },

    // 5. Storefront
    {
      value: "content",
      label: "Content & Branding",
      icon: "content",
      category: "Storefront",
    },
    {
      value: "community",
      label: "Community",
      icon: "community",
      category: "Storefront",
    },

    // 6. Support & Analytics
    {
      value: "feedback",
      label: "Support & Analytics",
      icon: "feedback",
      category: "Support & Analytics",
    },

    // 7. System (bottom)
    {
      value: "audit",
      label: "Audit Logs",
      icon: "audit",
      category: "System",
    },
    {
      value: "settings",
      label: "Settings",
      icon: "settings",
      category: "System",
    },
  ];

  const navItems = isSuperAdmin ? superadminNav : operatorNav;
  const tanawSubtitle = isOperator
    ? "Tenant Operator dashboard for tenant health, queues, capital, members, treasury, content, support, and settings."
    : isGlobalSuperadminView
      ? "Global Superadmin view for system-wide infrastructure and monitoring."
      : "Cooperative Superadmin view for managing this specific cooperative.";

  return (
    <DashboardTabsShell
      defaultValue="overview"
      title="Agapay Tanaw"
      subtitle={tanawSubtitle}
      portalLabel={`${roleLabel} Portal`}
      accountName={userName}
      accountRole={roleLabel}
      tenantName={currentTenantIdentity?.name}
      tenantLogoUrl={currentTenantIdentity?.logo_url || undefined}
      tenantBrandColor={currentTenantIdentity?.brand_color}
      tenantAccentColor={currentTenantIdentity?.accent_color}
      tenantFontPairing={currentTenantIdentity?.font_pairing}
      navItems={navItems}
      tenantSlug={tenant}
    >
      <div className="space-y-5">
        {reconciliation && !reconciliation.holdings.isTreasuryHealthy && (
          <div className="dashboard-card border-red-200 bg-red-50 text-slate-900 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row items-center gap-6">
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
          {isGlobalSuperadminView ? (
            <SuperadminOverviewTab />
          ) : (
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
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {!isGlobalSuperadminView && (
              <div className="dashboard-card lg:col-span-2 flex flex-col md:flex-row items-center gap-8 p-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-display font-bold text-slate-900">
                    Cooperative Trust Index
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 mb-6">
                    Current status of the trust network
                  </p>
                  <TrustDistributionChart
                    distribution={trustData.distribution}
                  />
                </div>
                <div className="flex-shrink-0 scale-110 md:scale-125">
                  <TrustMeter data={trustData.aggregateTrust} />
                </div>
              </div>
            )}

            <div
              className={`${isGlobalSuperadminView ? "lg:col-span-3" : ""} dashboard-card-strong flex flex-col justify-between overflow-hidden relative group min-h-[240px]`}
            >
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-display font-medium leading-tight">
                  Portfolio <br />
                  Status
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Your portfolio and collection dashboard for tenant operations.
                </p>
              </div>

              <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Platform Health
                </p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                    style={{ width: "88%" }}
                  />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            </div>
          </div>
        </TabsContent>

        {/* Approvals */}
        {isSuperAdmin && (
          <TabsContent value="approvals" className="outline-none">
            <SuperadminApprovalsTab />
          </TabsContent>
        )}
        {isOperator && (
          <TabsContent value="approvals" className="outline-none">
            <ApprovalsQueueModule
              data={pendingData}
              members={members}
              pendingTopUps={pendingTopUps as any}
              compassionActions={pendingData.compassion || []}
              isOperator={isOperator}
            />
          </TabsContent>
        )}

        {/* Tenant Operator Modules */}
        {isOperator && (
          <>
            <TabsContent value="vault" className="outline-none">
              <AnalyticsDashboardTab />
            </TabsContent>
            <TabsContent value="members" className="outline-none">
              <MemberDirectoryTab
                members={members}
                userRole={session?.user?.role}
                tenants={tenants.map((t) => ({
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
          </>
        )}

        {/* Superadmin Only Modules */}
        {isSuperAdmin && (
          <>
            <TabsContent value="tenants" className="outline-none">
              <TenantManagementTab
                initialTenants={tenants}
                role={session?.user?.role as string}
              />
            </TabsContent>
            <TabsContent
              value="reports"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="space-y-6">
                <ReportsTab />
                <TenantPerformanceReportsTab />
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-2xl font-bold font-display text-slate-900 mb-4">
                    System Health
                  </h3>
                  <SystemHealthTab />
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-2xl font-bold font-display text-slate-900 mb-4">
                    Fraud & Risk Monitoring
                  </h3>
                  <FraudRiskTab />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="email-templates" className="outline-none">
              <EmailTemplatesTab />
            </TabsContent>
            <TabsContent value="ai-config" className="outline-none">
              <AIConfigTab />
            </TabsContent>
            <TabsContent value="subscriptions" className="outline-none">
              <SubscriptionsModule
                initialPlans={subscriptionPlans}
                initialTenants={tenantSubscriptions}
              />
            </TabsContent>
          </>
        )}

        {/* Shared Management Modules */}
        <TabsContent value="community" className="outline-none">
          {isOperator ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
              <CommunityTab
                initialData={operatorCommunityData}
              />
              <CommunityOperationsTab summary={communitySummary} />
            </div>
          ) : (
            <SuperadminCommunityTab />
          )}
        </TabsContent>

        <TabsContent value="audit" className="outline-none">
          <AuditLogViewer tenantId={isSuperAdmin && tenantContextId === null ? undefined : tenantContextId ?? undefined} />
        </TabsContent>

        <TabsContent value="content" className="outline-none">
          <div className="space-y-8">
            {currentTenantIdentity && (isOperator || isSuperAdmin) && (
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
            <HomepageContentTab
              role={userRole}
              faqs={homepageContent.faqs}
              testimonials={homepageContent.testimonials}
            />
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="outline-none">
          <SupportAnalyticsModule
            role={userRole}
            feedbackEntries={feedbackEntries}
          />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid w-full max-w-5xl gap-6">
              <AdminProfileSettings
                initialData={{
                  firstName: adminProfileData?.first_name || userName,
                  lastName: adminProfileData?.last_name || "",
                  email: session?.user?.email || "",
                  phone: "",
                  photoUrl: adminProfileData?.photo_url,
                }}
              />

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
                      : "Update your tenant's company or tenant name."
                  }
                />
              ) : isSuperAdmin ? (
                <div className="dashboard-card border-amber-200 bg-amber-50 text-amber-800 max-w-2xl">
                  Select a tenant from the sidebar if you want to change the
                  tenant name from `Global View`.
                </div>
              ) : null}

              {tenantContextId && (isOperator || isSuperAdmin) && (
                <div className="flex justify-center -mx-4 md:mx-0">
                  <SubscriptionSettings
                    tenantId={tenantContextId}
                    isAdmin={isOperator || isSuperAdmin}
                    tenantSlug={tenant}
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
