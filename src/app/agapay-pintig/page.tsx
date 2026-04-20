import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  HandCoins,
  History,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { LoanApplicationTab } from "@/components/member/loan-application-tab";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { neon } from "@neondatabase/serverless";
import { Settings2 } from "lucide-react";

export default async function AgapayPintigPage() {
  const session = await auth();
  const userName = session?.user?.username || "Member";

  let is2FAEnabled = false;
  try {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.AGAPAYSTORAGE_DATABASE_URL ||
      process.env.POSTGRES_URL;

    if (connectionString) {
      const sql = neon(connectionString);
      const userId = parseInt(session?.user?.id || "0");
      const rows = await sql`
        SELECT is_enabled 
        FROM two_factor_auth 
        WHERE user_id = ${userId}
      `;
      is2FAEnabled = rows.length > 0 ? rows[0].is_enabled : false;
    }
  } catch (error) {
    console.error("Failed to check 2FA status:", error);
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight italic">
              Maligayang pagbabalik sa{" "}
              <span className="text-emerald-600">Agapay Pintig</span>
            </h1>
            <p className="text-slate-500 font-sans text-lg">
              Ang iyong katuwang sa mas mabilis at mas siguradong asenso.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Available Credit
                </p>
                <p className="text-xl font-display font-bold text-slate-900">
                  ₱50,000.00
                </p>
              </div>
            </div>
            <UserAccountNav name={userName} />
          </div>
        </div>

        {/* Member Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="bg-white/50 backdrop-blur-md p-1.5 border border-emerald-100 rounded-2xl shadow-sm h-auto inline-flex">
              <TabsTrigger
                value="overview"
                className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all px-8 py-3 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="apply"
                className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all px-8 py-3 flex items-center gap-2"
              >
                <HandCoins className="w-4 h-4" />
                <span>Mag-loan</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all px-8 py-3 flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span>Kasaysayan</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all px-8 py-3 flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="space-y-8 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "My Savings",
                  value: "₱0.00",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Active Loans",
                  value: "₱0.00",
                  color: "text-slate-900",
                  bg: "bg-slate-50",
                },
                {
                  label: "Share Capital",
                  value: "₱0.00",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
              ].map((item) => (
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

            <div className="bg-white p-12 rounded-[2.5rem] border border-emerald-50 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <LayoutDashboard className="w-10 h-10 text-emerald-200" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-slate-800">
                  Magsimula sa iyong Pintig
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  Wala ka pang aktibong transaksyon sa kasalukuyan. Maaari kang
                  magsimulang mag-loan o magdeposito ng ipon.
                </p>
              </div>
            </div>
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
        </Tabs>
      </div>
    </div>
  );
}
