import { TabsContent } from "@/components/ui/tabs";
import {
  Wallet,
  LayoutDashboard,
  ArrowUpRight,
  HeartPulse,
} from "lucide-react";
import { LoanApplicationTab } from "@/components/member/loan-application-tab";
import { LoanServicingTab } from "@/components/member/loan-servicing-tab";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { type ShellNavItem } from "@/components/layout/authenticated-shell";
import { Badge } from "@/components/ui/badge";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";
import { WalletTab } from "@/components/member/wallet-tab";
import { getWalletTransactions } from "@/actions/wallet-actions";
import { getCommunityDashboardData } from "@/actions/community-actions";
import {
  formatTierLabel,
  getAvailableCreditForTier,
  getTierPolicy,
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
} from "@/lib/microfinance-policy";
import { runAutomatedDefaultEnforcement } from "@/lib/default-enforcement";
import { CommunityTab } from "@/components/member/community-tab";
import { MemberOnboardingDialogs } from "@/components/member/member-onboarding-dialogs";
import { acceptConsent } from "@/actions/compliance-actions";
import { MemberSettingsTab } from "@/components/member/member-settings-tab";
import { SupportTab } from "@/components/member/support-tab";
import { RestrictedAccess } from "@/components/layout/restricted-access";
import { getUserFeedbackTickets } from "@/actions/transactional-feedback";
import { DashboardPollingWrapper } from "@/components/member/dashboard-polling-wrapper";

const PERSONAL_WALLET = "personal_wallet";

import { requireAuthenticatedSession } from "@/lib/authorization";

export default async function AgapayPintigPage({
  params,
}: {
  params: { tenant: string };
}) {
  const { tenant } = params;
  const session = await requireAuthenticatedSession();

  if (session.user.role !== "member" || !session.user.tenantId) {
    redirect(`/${tenant}/agapay-tanaw`);
  }

  const userName = session.user.username || "Member";
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  await runAutomatedDefaultEnforcement({
    tenantId,
    actorUserId: userId,
  });

  const [
    member,
    savings,
    userLoans,
    paymentMethods,
    tfa,
    transactions,
    communityData,
    unreadNotifications,
    totalNotifications,
    tenantIdentity,
    userTickets,
    trustScoreSnapshot,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        username: true,
        email: true,
        phone: true,
        created_at: true,
        interest_tier: true,
        consent_accepted_at: true,
        consent_version: true,
        profile: {
          select: {
            first_name: true,
            last_name: true,
            occupation: true,
            business_name: true,
            photo_url: true,
          },
        },
      },
    }),
    prisma.savingsAccount.findMany({
      where: { user_id: userId, tenant_id: tenantId },
    }),
    prisma.loan.findMany({
      where: { user_id: userId, tenant_id: tenantId, status: { in: ["active", "paid", "defaulted"] } },
      include: {
        product: true,
        compassion_actions: {
          orderBy: { requested_at: "desc" },
        },
        schedules: {
          orderBy: { installment_number: "asc" },
        },
        payments: {
          include: {
            payment_method: true,
          },
          orderBy: { submitted_at: "desc" },
        },
      },
    }),
    prisma.paymentMethod.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { provider_name: "asc" },
    }),
    prisma.twoFactorAuth.findUnique({
      where: { user_id: userId },
    }),
    getWalletTransactions(),
    getCommunityDashboardData(),
    prisma.notification.count({
      where: { user_id: userId, is_read: false },
    }),
    prisma.notification.count({
      where: { user_id: userId },
    }),
    prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
      select: {
        name: true,
        brand_color: true,
        accent_color: true,
        font_pairing: true,
        logo_url: true,
        metadata: true,
      },
    }),
    getUserFeedbackTickets(),
    prisma.trustScoreSnapshot.findFirst({
      where: { user_id: userId, tenant_id: tenantId },
      orderBy: { calculated_at: "desc" },
      select: {
        score: true,
        payment_score: true,
        business_score: true,
        peer_score: true,
        tier_after: true,
        calculated_at: true,
      },
    }),
  ]);

  // Fallback payment methods if none seeded for this tenant
  const resolvedPaymentMethods =
    paymentMethods.length > 0
      ? paymentMethods
      : [
          { method_id: 1, provider_name: "GCash" },
          { method_id: 2, provider_name: "Bank Transfer" },
          { method_id: 3, provider_name: "Cash" },
          { method_id: 4, provider_name: "Maya" },
        ];

  const totalSavings = savings.reduce(
    (acc, curr) =>
      String(curr.account_type) === PERSONAL_WALLET
        ? acc
        : acc + Number(curr.balance),
    0,
  );
  const totalWalletBalance = savings.reduce(
    (acc, curr) =>
      String(curr.account_type) === PERSONAL_WALLET
        ? acc + Number(curr.balance)
        : acc,
    0,
  );
  const activeLoans = userLoans.filter((l) => l.status === "active");
  const totalLoanBalance = activeLoans.reduce(
    (acc, curr) => acc + Number(curr.balance_remaining),
    0,
  );
  const is2FAEnabled = tfa?.is_enabled || false;

  const enabledFeatures = tenantIdentity?.metadata 
    ? (tenantIdentity.metadata as any).enabledFeatures 
    : ["loans", "wallet", "community"];

  const isFeatureEnabled = (feature: string) => {
    return Array.isArray(enabledFeatures) && enabledFeatures.includes(feature);
  };

  const availableCredit = getAvailableCreditForTier(
    member?.interest_tier,
    totalLoanBalance,
  );
  const memberTierLabel = formatTierLabel(member?.interest_tier);
  const navItems: ShellNavItem[] = [
    // PRD: Overview & Wallet
    {
      value: "overview",
      label: "Overview",
      icon: "overview",
      category: "Core Operations",
    },
    {
      value: "wallet",
      label: "Wallet",
      icon: "wallet",
      category: "Core Operations",
    },

    // PRD: Loans
    {
      value: "apply",
      label: "Loan Application",
      icon: "apply",
      category: "Loans & Repayments",
    },
    {
      value: "loans",
      label: "My Loans & Repayment",
      icon: "repayment",
      category: "Loans & Repayments",
    },

    // PRD: Social Systems
    {
      value: "community",
      label: "Community",
      icon: "community",
      category: "Social Systems",
    },

    // PRD: Help & Settings
    {
      value: "support",
      label: "Support & Feedback",
      icon: "feedback",
      category: "Help & Settings",
    },
    {
      value: "settings",
      label: "Settings",
      icon: "settings",
      category: "Help & Settings",
    },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const memberCards = [
    {
      label: "My Savings",
      value: formatCurrency(totalSavings),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "My Wallet",
      value: formatCurrency(totalWalletBalance),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active Loan",
      value: formatCurrency(totalLoanBalance),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const trustScoreValue = trustScoreSnapshot?.score ?? 0;
  const trustScoreDate = trustScoreSnapshot?.calculated_at
    ? new Date(trustScoreSnapshot.calculated_at).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <DashboardTabsShell
      defaultValue="overview"
      title="Overview"
      subtitle="Your clear partner for loans, repayment, and tenant support."
      portalLabel="member portal"
      accountName={userName}
      accountRole="member"
      tenantName={tenantIdentity?.name}
      tenantLogoUrl={tenantIdentity?.logo_url || undefined}
      tenantBrandColor={tenantIdentity?.brand_color}
      tenantAccentColor={tenantIdentity?.accent_color}
      tenantFontPairing={tenantIdentity?.font_pairing}
      navItems={navItems}
      tenantSlug={tenant}
    >
      <DashboardPollingWrapper>
      <div className="space-y-6">
        <MemberOnboardingDialogs
          consentAccepted={Boolean(member?.consent_accepted_at)}
          tenantName={tenantIdentity?.name}
        />
        <TabsContent
          value="overview"
          className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="dashboard-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-slate-900 italic text-xl">
                    Loan Capability Meter
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your potential borrowing power based on trust.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
              </div>

              <div className="relative pt-4">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-4xl font-numbers font-bold text-slate-900">
                    {formatCurrency(availableCredit)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 h-auto"
                  >
                    {memberTierLabel}
                  </Badge>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_40%,transparent)] transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (availableCredit / getTierPolicy(member?.interest_tier).capAmount) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>₱0</span>
                  <span>Max: {formatCurrency(getTierPolicy(member?.interest_tier).capAmount)}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card-strong p-8 relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-heading font-medium leading-tight">
                  Repayment <br /> Report
                </h3>
                <p className="text-slate-400 text-xs mt-2 max-w-[180px]">
                  Download your Statement of Account for full details.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <a
                  href={`/${tenant}/api/reports/soa?userId=${userId}&tenantId=${tenantId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-primary transition-colors"
                >
                  <span>DOWNLOAD SOA</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {memberCards.map((item) => (
              <div
                key={item.label}
                className="dashboard-card group p-5"
              >
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} transition-transform group-hover:scale-110`}
                >
                  <ArrowUpRight className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-400">
                  {item.label}
                </h3>
                <p className={`text-3xl font-numbers font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {trustScoreSnapshot && (
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                    Trust Score
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated: {trustScoreDate || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-4xl font-numbers font-bold ${trustScoreValue >= 700 ? "text-emerald-600" : trustScoreValue >= 400 ? "text-amber-600" : "text-red-600"}`}
                  >
                    {trustScoreValue}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 h-auto"
                  >
                    {trustScoreSnapshot.tier_after?.replace(/_/g, " ") || "N/A"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(100, trustScoreSnapshot.payment_score)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {trustScoreSnapshot.payment_score}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Business
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, trustScoreSnapshot.business_score)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {trustScoreSnapshot.business_score}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Peer
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, trustScoreSnapshot.peer_score)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {trustScoreSnapshot.peer_score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="dashboard-card bg-amber-50/70 border-amber-100 text-slate-800 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                Penalty Policy
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {getPenaltyPolicyCopy()}
              </p>
            </div>
            <div className="dashboard-card bg-blue-50/70 border-blue-100 text-slate-800 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Compassion Support
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {getCompassionPolicyCopy()}
              </p>
            </div>
          </div>

          {totalLoanBalance === 0 &&
          totalSavings === 0 &&
          totalWalletBalance === 0 ? (
            <div className="dashboard-card flex flex-col items-center justify-center space-y-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-10 w-10 text-primary/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold text-slate-800">
                  Start with your Dashboard
                </h2>
                <p className="mx-auto max-w-md text-slate-500">
                  No active transactions yet. You can start by applying for a
                  loan or making a deposit.
                </p>
              </div>
            </div>
          ) : (
            <div className="dashboard-card">
              <h2 className="mb-6 text-xl font-heading font-bold text-slate-800">
                Recent Activity
              </h2>
              <p className="italic text-slate-400">
                Showing your last 5 transactions...
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="wallet"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {isFeatureEnabled("wallet") ? <WalletTab savings={savings} transactions={transactions} /> : <RestrictedAccess moduleName="E-Wallet" />}
        </TabsContent>

        <TabsContent
          value="apply"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {isFeatureEnabled("loans") ? <LoanApplicationTab /> : <RestrictedAccess moduleName="Loan Application" />}
        </TabsContent>

        {/* TM-03: My Loans */}
        <TabsContent
          value="loans"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {isFeatureEnabled("loans") ? (
            <LoanServicingTab
              loans={userLoans}
              paymentMethods={resolvedPaymentMethods}
            />
          ) : (
            <RestrictedAccess moduleName="My Loans & Repayment" />
          )}
        </TabsContent>

        <TabsContent
          value="community"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {isFeatureEnabled("community") ? <CommunityTab initialData={communityData} /> : <RestrictedAccess moduleName="Community" />}
        </TabsContent>

        {/* TM-08: Support & Feedback */}
        <TabsContent
          value="support"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <SupportTab tenantSlug={tenant} tickets={userTickets || []} />
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <MemberSettingsTab
            profile={{
              username: member?.username || userName,
              email: member?.email || session.user.email || "",
              phone: member?.phone || null,
              joinedAt: member?.created_at
                ? new Date(member.created_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Active",
              fullName:
                member?.profile?.first_name && member?.profile?.last_name
                  ? `${member.profile.first_name} ${member.profile.last_name}`
                  : userName,
              occupation: member?.profile?.occupation || null,
              businessName: member?.profile?.business_name || null,
              avatarUrl: member?.profile?.photo_url || null,
            }}
            tenant={{
              name: tenantIdentity?.name,
            }}
            security={{
              is2FAEnabled,
            }}
            notifications={{
              unreadCount: unreadNotifications,
              totalCount: totalNotifications,
            }}
            consent={{
              accepted: Boolean(member?.consent_accepted_at),
              acceptedAt: member?.consent_accepted_at
                ? new Date(member.consent_accepted_at).toLocaleDateString(
                    "en-PH",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )
                : null,
              version: member?.consent_version || null,
            }}
          />
        </TabsContent>
      </div>
      </DashboardPollingWrapper>
    </DashboardTabsShell>
  );
}
