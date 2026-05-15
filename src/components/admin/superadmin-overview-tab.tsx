import { TrendingUp, Clock, Info } from "lucide-react";
import { KPIMetricCard } from "@/components/analytics/kpi-metric-card";
import { TrustMeter } from "@/components/analytics/trust-meter";
import { getSuperadminOverview } from "@/actions/superadmin-actions";
import { InterestTier } from "@prisma/client";
import { TrustScoreBreakdown } from "@/lib/trust-engine";
import { AiInsightCard } from "@/components/admin/ai-insight-card";

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
  // Note: For superadmin, this reflects platform-wide averages.
  // Sub-scores use the overall score as a simplified aggregate.
  const globalTrustBreakdown: TrustScoreBreakdown = {
    score: data.globalTrustScore,
    paymentScore: data.globalTrustScore,
    businessScore: data.globalTrustScore,
    peerScore: data.globalTrustScore,
    guarantorScore: data.globalTrustScore,
    tier: InterestTier.T1_5_PERCENT,
  };

  // Calculate growth rates (placeholder - would compare with previous period)
  const fundsGrowth = { value: 12.5, isPositive: true };
  const loansGrowth = { value: 8.2, isPositive: true };

  return (
    <div className="space-y-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIMetricCard
          label="Total Platform Funds"
          value={`₱${(data.totalFunds / 1000000).toFixed(1)}M`}
          description={`Total: ₱${data.totalFunds.toLocaleString()}`}
          iconName="wallet"
          trend={fundsGrowth}
        />
        <KPIMetricCard
          label="Active Loans"
          value={data.totalActiveLoans.toLocaleString()}
          iconName="activity"
          trend={loansGrowth}
        />
        <KPIMetricCard
          label="Subscription Revenue"
          value={`₱${(data.totalSubscriptionRevenue / 1000).toFixed(1)}K`}
          description={`Total: ₱${data.totalSubscriptionRevenue.toLocaleString()}`}
          iconName="piggy-bank"
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      {/* Trust Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 md:text-left">
            <h3 className="text-xl font-display font-bold text-slate-900">
              Platform Trust Index
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Overall trust score across all tenants and members
            </p>
            <TrustMeter data={globalTrustBreakdown} />
          </div>
          <div className="flex-shrink-0 scale-110 md:scale-125">
            <div className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-4 ring-white shadow-sm flex">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card bg-white/70 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-slate-900">
              Recent Platform Activity
            </h3>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {data.recentLogs.slice(0, 5).map((log: any) => (
              <div key={log.log_id} className="flex items-start gap-3 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.375rem] bg-slate-100 text-slate-500">
                  <Info className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-800 font-medium">{log.action}</p>
                  <p className="text-slate-500 text-sm">
                    By <span className="font-medium">{log.username}</span>{" "}
                    <span className="text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Snapshot Summary */}
        <AiInsightCard />
      </div>
    </div>
  );
}
