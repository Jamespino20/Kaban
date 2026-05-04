import { TabsContent } from "@/components/ui/tabs";
import { Wallet, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { LoanApplicationTab } from "@/components/member/loan-application-tab";
import { LoanServicingTab } from "@/components/member/loan-servicing-tab";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { type ShellNavItem } from "@/components/layout/authenticated-shell";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";
import { WalletTab } from "@/components/member/wallet-tab";
import { getWalletTransactions } from "@/actions/wallet-actions";
import { getCommunityDashboardData } from "@/actions/community-actions";
import {
  formatTierLabel,
  getAvailableCreditForTier,
  getCompassionPolicyCopy,
  getPenaltyPolicyCopy,
} from "@/lib/microfinance-policy";
import { runAutomatedDefaultEnforcement } from "@/lib/default-enforcement";
import { CommunityTab } from "@/components/member/community-tab";
import { ConsentDashboard } from "@/components/member/consent-dashboard";
import { acceptConsent } from "@/actions/compliance-actions";
import { MemberSettingsTab } from "@/components/member/member-settings-tab";

const PERSONAL_WALLET = "personal_wallet";

import { requireAuthenticatedSession } from "@/lib/authorization";

export default async function AgapayPintigPage({
  params,
}: {
  params: { branch: string };
}) {
  const { branch } = params;
  const session = await requireAuthenticatedSession();

  if (session.user.role !== "member" || !session.user.tenantId) {
    redirect(`/${branch}/agapay-tanaw`);
  }

  const userName = session.user.username || "Miyembro";
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  await runAutomatedDefaultEnforcement({
    tenantId,
    actorUserId: userId,
  });

  const [
    member,
    savings,
    activeLoans,
    paymentMethods,
    tfa,
    transactions,
    communityData,
    unreadNotifications,
    totalNotifications,
    tenantIdentity,
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
          },
        },
      },
    }),
    prisma.savingsAccount.findMany({
      where: { user_id: userId, tenant_id: tenantId },
    }),
    prisma.loan.findMany({
      where: { user_id: userId, tenant_id: tenantId, status: "active" },
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
      select: { name: true, brand_color: true, logo_url: true },
    }),
  ]);

  const tenant = tenantIdentity;

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
  const totalLoanBalance = activeLoans.reduce(
    (acc, curr) => acc + Number(curr.balance_remaining),
    0,
  );
  const is2FAEnabled = tfa?.is_enabled || false;

  const availableCredit = getAvailableCreditForTier(
    member?.interest_tier,
    totalLoanBalance,
  );
  const memberTierLabel = formatTierLabel(member?.interest_tier);
  const navItems: ShellNavItem[] = [
    { value: "overview", label: "Pangkalahatan", icon: "overview" },
    { value: "wallet", label: "Wallet & Ipon", icon: "wallet" },
    { value: "apply", label: "Mag-loan", icon: "apply" },
    { value: "repayment", label: "Repayment", icon: "repayment" },
    { value: "community", label: "Ka-Agapay", icon: "community" },
    { value: "settings", label: "Settings", icon: "settings" },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const memberCards = [
    {
      label: "Aking Ipon",
      value: formatCurrency(totalSavings),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pansariling Wallet",
      value: formatCurrency(totalWalletBalance),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Aktibong Loan",
      value: formatCurrency(totalLoanBalance),
      color: "text-slate-900",
      bg: "bg-slate-50",
    },
  ];

  return (
    <DashboardTabsShell
      defaultValue="overview"
      title="Pangkalahatan"
      subtitle="Ang iyong katuwang sa mas malinaw na loan, repayment, at branch support."
      portalLabel="member portal"
      accountName={userName}
      accountRole="member"
      tenantName={tenant?.name}
      tenantLogoUrl={tenant?.logo_url || undefined}
      tenantBrandColor={tenant?.brand_color}
      navItems={navItems}
      branchSlug={branch}
    >
      <div className="space-y-6">
        {!member?.consent_accepted_at && (
          <ConsentDashboard
            tenantName={tenant?.name || "Branch"}
            isAccepted={false}
            onAccept={acceptConsent}
          />
        )}
        <TabsContent
          value="overview"
          className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex items-center gap-4 rounded-[1.75rem] border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Nagagamit na Credit
                </p>
                <p className="text-2xl font-display font-bold text-slate-900">
                  {formatCurrency(availableCredit)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Batay sa iyong kasalukuyang tier:{" "}
                  <span className="font-semibold text-slate-700">
                    {memberTierLabel}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <a
                href={`/${branch}/api/reports/soa?userId=${userId}&tenantId=${tenantId}`}
                target="_blank"
                className="group relative flex items-center gap-3 rounded-[1.5rem] bg-emerald-600 px-6 py-3 font-black text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-95"
              >
                <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <ArrowUpRight className="h-5 w-5" />
                <span>Ulat ng Pagbabayad (SOA)</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {memberCards.map((item) => (
              <div
                key={item.label}
                className="group rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg"
              >
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} transition-transform group-hover:scale-110`}
                >
                  <ArrowUpRight className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-400">
                  {item.label}
                </h3>
                <p className={`text-3xl font-display font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[1.75rem] border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
                Penalty Policy
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {getPenaltyPolicyCopy()}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
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
            <div className="flex flex-col items-center justify-center space-y-5 rounded-[1.75rem] border border-emerald-50 bg-white p-8 text-center shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <LayoutDashboard className="h-10 w-10 text-emerald-200" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-slate-800">
                  Magsimula sa iyong Pintig
                </h2>
                <p className="mx-auto max-w-md text-slate-500">
                  Wala ka pang aktibong transaksyon sa kasalukuyan. Maaari kang
                  magsimulang mag-loan o magdeposito ng ipon.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-6 text-xl font-display font-bold text-slate-800">
                Kamakailang Gawain
              </h2>
              <p className="italic text-slate-400">
                Ipinapakita ang iyong huling 5 transaksyon...
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="wallet"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <WalletTab savings={savings} transactions={transactions} />
        </TabsContent>

        <TabsContent
          value="apply"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <LoanApplicationTab />
        </TabsContent>

        <TabsContent
          value="repayment"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <LoanServicingTab
            loans={activeLoans}
            paymentMethods={paymentMethods}
          />
        </TabsContent>

        <TabsContent
          value="community"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <CommunityTab initialData={communityData} />
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
                : "May record",
              fullName:
                member?.profile?.first_name && member?.profile?.last_name
                  ? `${member.profile.first_name} ${member.profile.last_name}`
                  : userName,
              occupation: member?.profile?.occupation || null,
              businessName: member?.profile?.business_name || null,
            }}
            tenant={{
              name: tenant?.name,
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
    </DashboardTabsShell>
  );
}
