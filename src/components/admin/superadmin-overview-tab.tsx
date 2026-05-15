import { Clock, Info, ShieldAlert } from "lucide-react";
import { KPIMetricCard } from "@/components/analytics/kpi-metric-card";
import { TrustMeter } from "@/components/analytics/trust-meter";
import { getSuperadminOverview } from "@/actions/superadmin-actions";
import { InterestTier } from "@prisma/client";
import { TrustScoreBreakdown } from "@/lib/trust-engine";
import { AiInsightCard } from "@/components/admin/ai-insight-card";
import SuperadminWithdrawDialog from "@/components/admin/superadmin-withdraw-dialog";

export default async function SuperadminOverviewTab() {
  const overviewData = (await getSuperadminOverview()) as any;

  const { data, success } = overviewData;

  if (!success || !data) {
    const errorMessage =
      "error" in overviewData ? String(overviewData.error) : "Unknown error";
    return (
      <div className="p-6">
        <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Info className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium mb-2">
            Failed to load overview
          </h3>
          <p className="text-slate-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Construct a trust breakdown for the global platform index
  const globalTrustBreakdown: TrustScoreBreakdown = {
    score: data.globalTrustScore,
    paymentScore: data.globalTrustScore,
    businessScore: data.globalTrustScore,
    peerScore: data.globalTrustScore,
    guarantorScore: data.globalTrustScore,
    tier: InterestTier.T1_5_PERCENT,
  };

  const fundsGrowth = { value: 12.5, isPositive: true };
  const loansGrowth = { value: 8.2, isPositive: true };

  return (
    <div className="space-y-6">
      {/* Platform-wide KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIMetricCard
          label="Total Active Tenants"
          value={data.totalActiveTenants.toLocaleString()}
          iconName="tenants"
          trend={{ value: 0, isPositive: true }}
        />
        <KPIMetricCard
          label="Global FUM"
          value={`₱${(data.totalFunds / 1000000).toFixed(1)}M`}
          description={`Total: ₱${data.totalFunds.toLocaleString()}`}
          iconName="wallet"
          trend={fundsGrowth}
        />
        <KPIMetricCard
          label="Total Active Loans"
          value={data.totalActiveLoans.toLocaleString()}
          iconName="activity"
          trend={loansGrowth}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIMetricCard
          label="Platform Repayment Rate"
          value={`${data.platformRepaymentRate.toFixed(1)}%`}
          iconName="repayment"
          trend={{ value: data.platformRepaymentRate > 90 ? 2.1 : -0.5, isPositive: data.platformRepaymentRate > 85 }}
        />
        <KPIMetricCard
          label="Portfolio at Risk"
          value={`₱${(data.portfolioAtRisk / 1000).toFixed(0)}K`}
          description={`At-risk: ₱${data.portfolioAtRisk.toLocaleString()}`}
          iconName="alert"
          trend={{ value: data.portfolioAtRisk > 0 ? -3.2 : 0, isPositive: data.portfolioAtRisk === 0 }}
        />
        <KPIMetricCard
          label="Subscription Revenue"
          value={`₱${(data.totalSubscriptionRevenue / 1000).toFixed(1)}K`}
          description={`Total: ₱${data.totalSubscriptionRevenue.toLocaleString()}`}
          iconName="piggy-bank"
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6 rounded-3xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Superadmin Earnings Wallet
              </p>
              <p className="mt-2 text-3xl font-numbers font-bold text-foreground tracking-tight">
                ₱{data.superadminWalletBalance.toLocaleString()}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Balance available for platform withdrawals.
              </p>
            </div>
            <SuperadminWithdrawDialog balance={data.superadminWalletBalance} />
          </div>
        </div>

        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900">
                Recent Earnings Withdrawals
              </h3>
              <p className="text-sm text-slate-500">
                Last 5 superadmin payout transactions.
              </p>
            </div>
          </div>

          {data.recentSuperadminWithdrawals && data.recentSuperadminWithdrawals.length > 0 ? (
            <div className="space-y-3">
              {data.recentSuperadminWithdrawals.map((tx: any) => (
                <div key={tx.transaction_id} className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        ₱{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tx.method_label || tx.issue_notes || tx.reference || "Withdrawal"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{new Date(tx.processed_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</p>
                      <p>{tx.status || "Completed"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No earnings withdrawals have been processed yet.</p>
          )}
        </div>
      </div>

      {/* Trust Score + Audit Snapshot + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6 flex flex-col items-center gap-4">
          <div className="text-center w-full">
            <h3 className="text-xl font-display font-bold text-slate-900">
              Platform Trust Index
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Overall trust score across all tenants and members
            </p>
            <TrustMeter data={globalTrustBreakdown} />
          </div>
        </div>

        {/* Recent Audit Snapshot */}
        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-500" />
              Audit Snapshot
            </h3>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="text-left py-1.5 pr-2">Action</th>
                  <th className="text-left py-1.5 px-2">Module</th>
                  <th className="text-left py-1.5 px-2">User</th>
                  <th className="text-right py-1.5 pl-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(data.recentLogs || []).map((log: any) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/50">
                    <td className="py-1.5 pr-2 font-medium text-slate-800 truncate max-w-[120px]">
                      {log.action}
                    </td>
                    <td className="py-1.5 px-2 text-slate-500">{log.module}</td>
                    <td className="py-1.5 px-2 text-slate-500 truncate max-w-[80px]">
                      {log.username}
                    </td>
                    <td className="py-1.5 pl-2 text-right text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
                {(!data.recentLogs || data.recentLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">No recent audit entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Snapshot Summary */}
        <AiInsightCard />
      </div>
    </div>
  );
}
