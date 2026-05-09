import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
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
import { POSSystemTab } from "@/components/admin/pos-system-tab";

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

    // Category: System & Audits
    {
      value: "reports",
      label: "Reports",
      icon: "reconciliation",
      category: "System & Audits",
    },
    {
      value: "health",
      label: "System Health",
      icon: "activity",
      category: "System & Audits",
    },
    {
      value: "risk",
      label: "Fraud & Risk",
      icon: "shield",
      category: "System & Audits",
    },
    {
      value: "audit",
      label: "Audit Logs",
      icon: "audit",
      category: "System & Audits",
    },

    // Category: Settings
    {
      value: "settings",
      label: "Settings",
      icon: "settings",
      category: "Settings",
    },
  ];

  const operatorNav: ShellNavItem[] = [
    // Category: Core Operations
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
        (pendingData.loans?.length || 0) +
          (pendingData.verifications?.length || 0) +
          (pendingTopUps?.length || 0) || undefined,
      category: "Core Operations",
    },

    // Category: Financial Management
    {
      value: "accounts",
      label: "Branch Accounts",
      icon: "members",
      category: "Financial Management",
    },
    {
      value: "collections",
      label: "Collections & Arrears",
      icon: "repayment",
      category: "Financial Management",
    },
    {
      value: "capital",
      label: "Capital & Funding",
      icon: "wallet",
      category: "Financial Management",
    },

    // Category: Storefront & Support
    {
      value: "communications",
      label: "Communications",
      icon: "community",
      category: "Storefront & Support",
    },
    {
      value: "help",
      label: "Help Center",
      icon: "feedback",
      category: "Storefront & Support",
    },

    // Category: System & Audits
    {
      value: "organization",
      label: "Organization",
      icon: "settings",
      category: "System & Audits",
    },
    {
      value: "compliance",
      label: "Legal & Compliance",
      icon: "audit",
      category: "System & Audits",
    },
    {
      value: "reports",
      label: "Reports",
      icon: "reconciliation",
      category: "System & Audits",
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
                <TrustDistributionChart distribution={trustData.distribution} />
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
                  Ang iyong portfolyo at koleksyon dashboard para sa tenant
                  operations.
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

        {/* Superadmin & Operator Shared Approvals */}
        {(isOperator || isSuperAdmin) && (
          <TabsContent value="approvals" className="outline-none">
            <VerificationQueueTab data={pendingData} />
          </TabsContent>
        )}

        {/* Tenant Operator Modules */}
        {isOperator && (
          <>
            <TabsContent value="approvals" className="outline-none">
              <Tabs defaultValue="verifications" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <TabsTrigger value="verifications" className="rounded-xl">
                    Verifications Queue
                  </TabsTrigger>
                  <TabsTrigger value="topup" className="rounded-xl">
                    Capital Top-Up
                  </TabsTrigger>
                  <TabsTrigger value="pos" className="rounded-xl">
                    Payment Intake (POS)
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="verifications" className="space-y-6">
                  <VerificationQueueTab data={pendingData} />
                </TabsContent>
                <TabsContent value="topup" className="space-y-6">
                  <TopUpQueueTab requests={pendingTopUps as any} />
                </TabsContent>
                <TabsContent value="pos" className="space-y-6">
                  <POSSystemTab members={members} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="accounts" className="outline-none">
              <MemberDirectoryTab
                members={members}
                userRole={session?.user?.role}
                tenants={tenants.map((t) => ({
                  id: t.tenant_id,
                  name: t.name,
                }))}
              />
            </TabsContent>

            <TabsContent value="collections" className="outline-none">
              <div className="bg-white/40 border border-slate-200/60 p-6 rounded-[2rem] backdrop-blur-md">
                <h2 className="text-2xl font-display font-bold text-slate-900 italic">
                  Collections & Arrears
                </h2>
                <p className="text-sm text-slate-500 max-w-2xl mt-2">
                  Section coming soon.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="capital" className="outline-none">
              <ReconciliationTab />
            </TabsContent>

            <TabsContent value="communications" className="outline-none">
              <Tabs defaultValue="community" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <TabsTrigger value="community" className="rounded-xl">
                    Community Ops
                  </TabsTrigger>
                  <TabsTrigger value="content" className="rounded-xl">
                    Homepage Content
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="community" className="space-y-6">
                  <CommunityOperationsTab summary={communitySummary} />
                </TabsContent>
                <TabsContent value="content" className="space-y-6">
                  <HomepageContentTab
                    role={userRole}
                    faqs={homepageContent.faqs}
                    testimonials={homepageContent.testimonials}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="help" className="outline-none">
              <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <TabsTrigger value="feedback" className="rounded-xl">
                    Feedback & Support
                  </TabsTrigger>
                  <TabsTrigger value="compassion" className="rounded-xl">
                    Compassion Actions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="feedback" className="space-y-6">
                  <FeedbackTab role={userRole} entries={feedbackEntries} />
                </TabsContent>
                <TabsContent value="compassion" className="space-y-6">
                  <CompassionActionsTab
                    actions={pendingData.compassion || []}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="organization" className="outline-none">
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <TabsTrigger value="products" className="rounded-xl">
                    Loan Products
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-xl">
                    Tenant Settings
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="space-y-6">
                  <LoanProductsTab />
                </TabsContent>
                <TabsContent value="settings" className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
                    <div className="grid w-full gap-6">
                      {currentTenantIdentity && (
                        <TenantNameSettingsCard
                          initialName={currentTenantIdentity.name}
                          title="Tenant Name"
                          description="Update your tenant's company or tenant name."
                        />
                      )}
                      {currentTenantIdentity && (
                        <BrandingTabWrapper
                          initialBranding={{
                            brand_color: currentTenantIdentity.brand_color,
                            accent_color: currentTenantIdentity.accent_color,
                            font_pairing: currentTenantIdentity.font_pairing,
                            logo_url: currentTenantIdentity.logo_url,
                          }}
                          displayName={currentTenantIdentity.name}
                        />
                      )}

                      {tenantContextId && (
                        <div className="flex justify-center -mx-4 md:mx-0">
                          <SubscriptionSettings
                            tenantId={tenantContextId}
                            isAdmin={true}
                            tenantSlug={tenant}
                          />
                        </div>
                      )}

                      <div className="px-4 text-center space-y-2 mt-8">
                        <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                          Account Security
                        </h2>
                        <p className="text-slate-500">
                          Secure your access with 2FA.
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="compliance" className="outline-none">
              <Tabs defaultValue="audit" className="w-full">
                <TabsList className="mb-4 bg-slate-100/50 p-1 rounded-2xl">
                  <TabsTrigger value="audit" className="rounded-xl">
                    Security & Audit Logs
                  </TabsTrigger>
                  <TabsTrigger value="files" className="rounded-xl">
                    Document Vault
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="audit" className="space-y-6">
                  <AuditLogViewer
                    tenantId={Number(session?.user?.tenantId || 0)}
                  />
                </TabsContent>
                <TabsContent value="files" className="space-y-6">
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
                      All system-generated reports, SOAs, and documents are
                      stored securely.
                    </p>
                  </div>
                  <SystemFileManagement
                    tenantId={Number(session?.user?.tenantId || 0)}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="reports" className="outline-none">
              <AnalyticsDashboardTab />
            </TabsContent>
          </>
        )}

        {/* Superadmin Only Modules & Shared modules accessed by superadmin */}
        {isSuperAdmin && (
          <>
            <TabsContent value="health" className="outline-none">
              <SystemHealthTab />
            </TabsContent>
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
              <ReportsTab />
            </TabsContent>
            <TabsContent
              value="risk"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <FraudRiskTab />
            </TabsContent>
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
              <AuditLogViewer tenantId={tenantContextId ?? undefined} />
            </TabsContent>
            <TabsContent value="settings" className="outline-none">
              <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid w-full max-w-5xl gap-6">
                  {currentTenantIdentity ? (
                    <TenantNameSettingsCard
                      tenantId={currentTenantIdentity.tenant_id}
                      initialName={currentTenantIdentity.name}
                      title="Tenant Name"
                      description="Update the name for the current tenant context."
                    />
                  ) : (
                    <div className="w-full max-w-2xl rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
                      Select a tenant from the sidebar if you want to change the
                      tenant name from `Global View`.
                    </div>
                  )}

                  {currentTenantIdentity && (
                    <BrandingTabWrapper
                      tenantId={currentTenantIdentity.tenant_id}
                      initialBranding={{
                        brand_color: currentTenantIdentity.brand_color,
                        accent_color: currentTenantIdentity.accent_color,
                        font_pairing: currentTenantIdentity.font_pairing,
                        logo_url: currentTenantIdentity.logo_url,
                      }}
                      displayName={currentTenantIdentity.name}
                    />
                  )}

                  {tenantContextId && (
                    <div className="flex justify-center -mx-4 md:mx-0">
                      <SubscriptionSettings
                        tenantId={tenantContextId}
                        isAdmin={true}
                        tenantSlug={tenant}
                      />
                    </div>
                  )}

                  <div className="px-4 text-center space-y-2 mt-8">
                    <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                      Account Security
                    </h2>
                    <p className="text-slate-500">
                      Secure your access with 2FA.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </div>
    </DashboardTabsShell>
  );
}
