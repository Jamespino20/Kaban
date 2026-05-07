import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, Info } from "lucide-react";
import { KPIMetricCard } from "@/components/analytics/kpi-metric-card";
import { TrustMeter } from "@/components/analytics/trust-meter";
import { getTenantOverview } from "@/actions/tenant-actions";
import { InterestTier } from "@prisma/client";
import { TrustScoreBreakdown } from "@/lib/trust-engine";

export default async function TenantOverviewTab() {
  const overviewData = await getTenantOverview();

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

  // Construct a trust breakdown for the tenant
  const tenantTrustBreakdown: TrustScoreBreakdown = {
    score: data.tenantTrustScore,
    paymentScore: data.paymentScore,
    businessScore: data.businessScore,
    peerScore: data.peerScore,
    guarantorScore: data.guarantorScore,
    tier: data.interestTier as InterestTier,
  };

  // Calculate growth rates (placeholder - would compare with previous period)
  const fundsGrowth = {
    value: data.fundsGrowth,
    isPositive: data.fundsGrowth > 0,
  };
  const loansGrowth = {
    value: data.loansGrowth,
    isPositive: data.loansGrowth > 0,
  };
  const membersGrowth = {
    value: data.membersGrowth,
    isPositive: data.membersGrowth > 0,
  };

  return (
    <div className="space-y-6">
      {/* Tenant KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIMetricCard
          label="Total Funds"
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
          label="Total Members"
          value={data.totalMembers.toLocaleString()}
          iconName="users"
          trend={membersGrowth}
        />
        <KPIMetricCard
          label="Total Lenders"
          value={data.totalLenders.toLocaleString()}
          iconName="piggy-bank"
          trend={{
            value: data.lendersGrowth,
            isPositive: data.lendersGrowth > 0,
          }}
        />
      </div>

      {/* Trust Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.75rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 md:text-left">
            <h3 className="text-xl font-display font-bold text-slate-900">
              Tenant Trust Index
            </h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Overall trust score across all members
            </p>
            <TrustMeter data={tenantTrustBreakdown} />
          </div>
          <div className="flex-shrink-0 scale-110 md:scale-125">
            <div className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-4 ring-white shadow-sm flex">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.75rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-slate-900">
              Recent Activity
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
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.75rem] border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-slate-900">
              AI Tenant Insights
            </h3>
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          {data.aiSnapshot ? (
            <div className="space-y-3">
              <p className="text-slate-800">
                {data.aiSnapshot.output_text || "No summary available."}
              </p>
              <p className="text-slate-500 text-sm">
                Generated:{" "}
                {new Date(data.aiSnapshot.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500">Generating AI insights...</p>
              <Skeleton className="h-4 w-32 mt-2" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
