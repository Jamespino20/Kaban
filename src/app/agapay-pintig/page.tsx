import { TabsContent } from "@/components/ui/tabs";
import {
  Wallet,
  HandCoins,
  History,
  LayoutDashboard,
  ArrowUpRight,
  Settings2,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { LoanApplicationTab } from "@/components/member/loan-application-tab";
import { LoanServicingTab } from "@/components/member/loan-servicing-tab";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  type ShellNavItem,
} from "@/components/layout/authenticated-shell";
import { DashboardTabsShell } from "@/components/layout/dashboard-tabs-shell";

export default async function AgapayPintigPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  if (session.user.role !== "member" || !session.user.tenantId) {
    redirect("/agapay-tanaw");
  }

  const userName = session?.user?.username || "Miyembro";
  const userId = session?.user?.user_id;
  const tenantId = session.user.tenantId;

  const [savings, activeLoans, loanProducts, paymentMethods, tfa] = await Promise.all([
    prisma.savingsAccount.findMany({
      where: { user_id: userId, tenant_id: tenantId },
    }),
    prisma.loan.findMany({
      where: { user_id: userId, tenant_id: tenantId, status: "active" },
      include: {
        product: true,
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
    prisma.loanProduct.findMany({
      where: { tenant_id: tenantId, is_active: true },
    }),
    prisma.paymentMethod.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { provider_name: "asc" },
    }),
    prisma.twoFactorAuth.findUnique({
      where: { user_id: userId },
    }),
  ]);

  const totalSavings = savings.reduce(
    (acc: number, curr: { balance: any }) => acc + Number(curr.balance),
    0,
  );
  const totalLoanBalance = activeLoans.reduce(
    (acc: number, curr: { balance_remaining: any }) =>
      acc + Number(curr.balance_remaining),
    0,
  );
  const is2FAEnabled = tfa?.is_enabled || false;

  // Simple Credit Limit Logic (Starter Tier default)
  const availableCredit = 50000 - totalLoanBalance;
  const navItems: ShellNavItem[] = [
    { value: "overview", label: "Pangkalahatan", icon: "overview" },
    { value: "apply", label: "Mag-loan", icon: "apply" },
    { value: "repayment", label: "Repayment", icon: "repayment" },
    { value: "settings", label: "Settings", icon: "settings" },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <DashboardTabsShell
        defaultValue="overview"
        title="Pangkalahatan"
        subtitle="Ang iyong katuwang sa mas malinaw na loan, repayment, at branch support."
        portalLabel="member portal"
        accountName={userName}
        accountRole="member"
        navItems={navItems}
      >
        <div className="space-y-8">
          <TabsContent
            value="overview"
            className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Nagagamit na Credit
                  </p>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    {formatCurrency(availableCredit)}
                  </p>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <a
                  href={`/api/reports/soa?userId=${userId}&tenantId=${session?.user?.tenantId}`}
                  target="_blank"
                  className="group relative flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-3xl shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity" />
                  <ArrowUpRight className="w-5 h-5" />
                  <span>Ulat ng Pagbabayad (SOA)</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Aking Ipon",
                  value: formatCurrency(totalSavings),
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Aktibong Loan",
                  value: formatCurrency(totalLoanBalance),
                  color: "text-slate-900",
                  bg: "bg-slate-50",
                },
                {
                  label: "Puhunan sa Kooperatiba",
                  value: "₱0.00",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
              ].map((item: any) => (
                <div
                  key={item.label}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div
                    className={`w-12 h-12 ${item.bg} rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <ArrowUpRight className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">
                    {item.label}
                  </h3>
                  <p
                    className={`text-4xl font-display font-bold ${item.color}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {totalLoanBalance === 0 && totalSavings === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-emerald-50 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-10 h-10 text-emerald-200" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-bold text-slate-800">
                    Magsimula sa iyong Pintig
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Wala ka pang aktibong transaksyon sa kasalukuyan. Maaari
                    kang magsimulang mag-loan o magdeposito ng ipon.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-display font-bold text-slate-800 mb-6">
                  Kamakailang Gawain
                </h2>
                <p className="text-slate-400 italic">
                  Ipinapakita ang iyong huling 5 transaksyon...
                </p>
              </div>
            )}
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

          <TabsContent value="settings" className="outline-none">
            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 italic">
                  Security Settings
                </h2>
                <p className="text-slate-500">
                  I-secure ang iyong Agapay Pintig access gamit ang 2FA.
                </p>
              </div>
              <TwoFactorSetup isEnabledInitial={is2FAEnabled} />
            </div>
          </TabsContent>
        </div>
      </DashboardTabsShell>
  );
}
