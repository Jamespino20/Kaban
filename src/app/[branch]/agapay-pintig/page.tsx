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
    { value: "overview", label: "Overview", icon: "overview" },
    { value: "wallet", label: "Wallet", icon: "wallet" },
    { value: "apply", label: "Loan Application", icon: "apply" },
    { value: "loans", label: "My Loans", icon: "repayment" },
    { value: "payments", label: "Repayment", icon: "wallet" },
    { value: "vouch", label: "Vouch System", icon: "members" },
    { value: "community", label: "Community", icon: "community" },
    { value: "support", label: "Support & Feedback", icon: "feedback" },
    { value: "settings", label: "Settings", icon: "settings" },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-slate-900 italic text-xl">
                    Loan Capability Meter
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your potential borrowing power based on trust.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
              </div>

              <div className="relative pt-4">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-4xl font-display font-bold text-slate-900">
                    {formatCurrency(availableCredit)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 h-auto"
                  >
                    {memberTierLabel}
                  </Badge>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (availableCredit / 1000000) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Starter</span>
                  <span>Max Limit (₱1M)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display font-medium leading-tight">
                  Repayment <br /> Report
                </h3>
                <p className="text-slate-400 text-xs mt-2 max-w-[180px]">
                  I-download ang iyong Statement of Account para sa buong
                  detalye.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <a
                  href={`/${branch}/api/reports/soa?userId=${userId}&tenantId=${tenantId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>IDOWNLOAD ANG SOA</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
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

        {/* TM-03: My Loans */}
        <TabsContent
          value="loans"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <LoanServicingTab
            loans={activeLoans}
            paymentMethods={paymentMethods}
          />
        </TabsContent>

        {/* TM-04: Payments Placeholder */}
        <TabsContent
          value="payments"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-slate-900">
                Repayment Report
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Ang detalyadong listahan ng lahat ng iyong payment history ay
                kasalukuyang pinapaganda. Pansamantala, makikita ang iyong
                payments under each loan in &quot;My Loans&quot; tab.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* TM-05: Vouch System Placeholder */}
        <TabsContent
          value="vouch"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-slate-900">
                Vouch System
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Parating na ang social trust validation. Dito mo magagawang
                mag-endorso ng ibang miyembro para tulungan silang mapataas ang
                kanilang loan limit at mapababa ang kanilang interest.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* TM-06: Documents Placeholder */}
        <TabsContent
          value="documents"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-full bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-slate-900 italic mb-2">
                My Documents
              </h2>
              <p className="text-slate-500">
                Pamahalaan ang iyong mga ID, sertipiko, at iba pang kailangang
                papeles dito.
              </p>
            </div>
            {/* Mock document cards */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white/50 border border-slate-100 border-dashed rounded-[1.75rem] p-6 h-40 flex flex-col items-center justify-center text-slate-400"
              >
                <span className="text-xs uppercase font-bold tracking-widest">
                  Walang Laman
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="community"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <CommunityTab initialData={communityData} />
        </TabsContent>

        {/* TM-08: Support Placeholder */}
        <TabsContent
          value="support"
          className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="max-w-3xl mx-auto space-y-8 py-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                Suporta at Feedback
              </h2>
              <p className="text-slate-500">
                May katanungan o komento? Narito Kami para tumulong.
              </p>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-md">
              <p className="text-center text-slate-400 italic py-10">
                Ang support ticket system ay kasalukuyang ginagawa. Mangyaring
                makipag-ugnayan sa iyong branch cashier para sa agarang tulong.
              </p>
            </div>
          </div>
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
