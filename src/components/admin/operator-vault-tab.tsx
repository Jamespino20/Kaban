"use server";

import { getEndOfDayReconciliation } from "@/actions/reconciliation";
import { getFinancialIntegrityCheck, getOperationalInsights } from "@/actions/analytics-actions";
import { getCapitalOversight } from "@/actions/vault-actions";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TrendingUp, Banknote, PieChart, Wallet, ArrowUpCircle, ArrowDownCircle, CheckCircle2, AlertTriangle, Landmark, ShieldCheck } from "lucide-react";
import { VaultTransactionDialog } from "./vault-transaction-dialog";

export async function OperatorVaultTab({ tenantSlug }: { tenantSlug: string }) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) return <div className="dashboard-card p-6 text-slate-500">Tenant context required.</div>;

  const [integrity, operational, eod, capital] = await Promise.all([
    getFinancialIntegrityCheck().catch(() => null),
    getOperationalInsights(30).catch(() => null),
    getEndOfDayReconciliation(new Date().toISOString().split("T")[0], tenantId).catch(() => null),
    getCapitalOversight().catch(() => null),
  ]);

  const totalFunds = integrity?.treasuryBalance ?? 0;
  const savingsPool = integrity?.savingsPoolTotal ?? 0;
  const totalOutstanding = operational?.riskConcentration.reduce((s: number, r: { amount: number }) => s + r.amount, 0) ?? 0;
  const netPosition = eod ? Number(eod.totalCollected) - Number(eod.totalDisbursed) : 0;

  const recentTx = await prisma.payment.findMany({
    where: { tenant_id: tenantId, status: "verified" },
    orderBy: { verified_at: "desc" },
    take: 5,
    select: { payment_id: true, amount_paid: true, payment_reference: true, verified_at: true },
  }).catch(() => []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-16 h-16 text-emerald-900" />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Share Capital (Equity)
          </h3>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            ₱{capital?.shareCapital.total.toLocaleString() ?? "0"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              {capital?.shareCapital.count ?? 0} Members
            </span>
            <span>Committed Capital</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Banknote className="w-16 h-16 text-blue-900" />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Regular Savings
          </h3>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            ₱{capital?.regularSavings.total.toLocaleString() ?? "0"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
             <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
              {capital?.regularSavings.count ?? 0} Accounts
            </span>
            <span>Liquid Deposits</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 relative overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <PieChart className="w-16 h-16 text-amber-900" />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Loan Utilization
          </h3>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            ₱{totalOutstanding.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 font-bold">
              {capital?.totalLiquidAssets ? ((totalOutstanding / capital.totalLiquidAssets) * 100).toFixed(1) : "0"}% utilized
            </span>
          </div>
        </div>
      </div>

      {/* EOD Reconciliation Status */}
      {eod && (
        <div className={`rounded-xl border p-5 flex flex-col md:flex-row items-center justify-between gap-4 ${
          eod.holdings.isTreasuryHealthy ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              eod.holdings.isTreasuryHealthy ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            }`}>
              {eod.holdings.isTreasuryHealthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Daily Treasury Position</h3>
              <div className="flex gap-6 mt-1 text-sm">
                <span className="text-slate-500">Disbursed: <strong className="text-slate-900">₱{Number(eod.totalDisbursed).toLocaleString()}</strong></span>
                <span className="text-slate-500">Collected: <strong className="text-slate-900">₱{Number(eod.totalCollected).toLocaleString()}</strong></span>
                <span className="text-slate-500">Net: <strong className={netPosition >= 0 ? "text-emerald-600" : "text-red-600"}>₱{netPosition.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            eod.holdings.isTreasuryHealthy ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
          }`}>
            {eod.holdings.isTreasuryHealthy ? "Balanced" : "Imbalance Detected"}
          </span>
        </div>
      )}

      {/* Investment Portfolio + Wallet */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Investment Table */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Investment Portfolio
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Positions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Product</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Invested</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operational?.riskConcentration.slice(0, 5).map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-900">{item.label || `Product ${i + 1}`}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-700">
                      ₱{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Performing
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-emerald-600">
                      +{((Number(item.amount) / (totalFunds || 1)) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {(!operational?.riskConcentration || operational.riskConcentration.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                      No active investments yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wallet Management */}
        <div className="rounded-xl border border-slate-200 bg-white flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Wallet Management
            </h3>
          </div>
          <div className="p-5 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <VaultTransactionDialog
                direction="invest"
                trigger={
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    Deposit Funds
                  </button>
                }
              />
              <VaultTransactionDialog
                direction="withdraw"
                trigger={
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition-all group">
                    <ArrowUpCircle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    Withdrawal
                  </button>
                }
              />
            </div>
          </div>
          <div className="p-5 flex-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Transactions</h4>
            <div className="space-y-3">
              {recentTx.map((tx: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{tx.payment_reference?.slice(0, 16) || "Payment"}</p>
                      <p className="text-[10px] text-slate-400">{tx.verified_at ? new Date(tx.verified_at).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-600">
                      +₱{Number(tx.amount_paid).toLocaleString()}
                    </span>
                    <a 
                      href={`/${tenantSlug}/receipt/${tx.payment_id}`} 
                      target="_blank"
                      className="text-slate-300 hover:text-emerald-600 transition-colors"
                      title="View Receipt"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
              {recentTx.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No recent transactions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
