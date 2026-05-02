"use server";

import {
  Activity,
  CheckCircle2,
  Globe,
  MousePointer2,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTenantAnalytics,
  getOperationalInsights,
  getFinancialIntegrityCheck,
} from "@/actions/analytics-actions";
import { KPIMetricCard } from "../analytics/kpi-metric-card";
import {
  AlertCircle,
  ShieldAlert,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";

export async function AnalyticsDashboardTab() {
  const [analytics, operational, integrity] = await Promise.all([
    getTenantAnalytics(30),
    getOperationalInsights(30),
    getFinancialIntegrityCheck(),
  ]);

  if (!analytics) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
        <p className="text-slate-500 italic">
          Walang sapat na data para sa analytics sa kasalukuyan.
        </p>
      </div>
    );
  }

  const totalPageViews = analytics.trafficTrends.reduce(
    (sum: number, d: { count: number }) => sum + d.count,
    0,
  );
  const totalInteractions = analytics.interactionHeatmap.reduce(
    (sum: number, d: { count: number }) => sum + d.count,
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Integrity & Critical Health Section */}
      {integrity && (
        <div
          className={cn(
            "p-8 rounded-[2rem] border flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden",
            integrity.isBalanced
              ? "bg-emerald-50 border-emerald-100 text-emerald-900"
              : "bg-rose-50 border-rose-100 text-rose-900",
          )}
        >
          <div className="relative z-10 flex items-center gap-6">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                integrity.isBalanced
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white",
              )}
            >
              {integrity.isBalanced ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold italic tracking-tight">
                {integrity.isBalanced
                  ? "Financial Integrity Verified"
                  : "Treasury Imbalance Detected"}
              </h3>
              <p className="text-sm opacity-70 max-w-xl">
                {integrity.isBalanced
                  ? "Ang iyong Treasury Vault ay tumutugma sa kabuuang ipon ng mga miyembro. Walang nakitang variance."
                  : `May nakitang variance na ₱${Math.abs(integrity.variance).toLocaleString()} sa pagitan ng Treasury at Savings Pool. Reconcile agad.`}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4 pr-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-50">
                Treasury Balance
              </p>
              <p className="text-2xl font-display font-bold leading-none">
                ₱{integrity.treasuryBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-10 bg-current/10 self-center" />
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-50">
                Member Pool
              </p>
              <p className="text-2xl font-display font-bold leading-none">
                ₱{integrity.savingsPoolTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Background Decal */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-current/5 -skew-x-12 translate-x-20" />
        </div>
      )}

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <KPIMetricCard
          label="Total Page Views"
          value={totalPageViews.toLocaleString()}
          iconName="activity"
          description="Total cooperative traffic"
        />
        <KPIMetricCard
          label="Behavioral Events"
          value={totalInteractions.toLocaleString()}
          iconName="check"
          description="Verified interactions"
        />
        <KPIMetricCard
          label="Repayment Flow"
          value={
            operational
              ? "₱" +
                operational.repaymentVelocity
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString()
              : "₱0"
          }
          iconName="trending"
          description="Total cash velocity (30d)"
          trend={{ value: 12, isPositive: true }}
        />
        <KPIMetricCard
          label="Risk Concentration"
          value={operational?.riskConcentration.length || 0}
          iconName="alert"
          description="Active product categories"
          variant="solid"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Operational Velocity Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-display font-bold text-slate-900 italic">
                Repayment Velocity (30d)
              </h3>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          <div className="h-48 w-full bg-slate-50/50 rounded-2xl flex items-end justify-between p-6 gap-2 border border-slate-100">
            {operational?.repaymentVelocity.length ? (
              operational.repaymentVelocity.slice(-15).map((d, i) => (
                <div
                  key={i}
                  className="w-full bg-amber-500 hover:bg-amber-600 transition-all rounded-t-lg relative group shadow-[0_-4px_12px_rgba(245,158,11,0.2)]"
                  style={{
                    height: `${Math.max(5, (d.amount / Math.max(...operational.repaymentVelocity.map((x) => x.amount))) * 100)}%`,
                  }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                    {d.date}: ₱{d.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs italic">
                No repayment data found
              </div>
            )}
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Velocity Insight
            </div>
            <p className="text-xs text-slate-600 font-medium italic">
              "Stable ang pasok ng pondo. Panatilihin ang collection efforts."
            </p>
          </div>
        </div>

        {/* Risk Concentration by Product */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-display font-bold text-slate-900 italic">
                Risk Concentration
              </h3>
            </div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-2 py-1 rounded-md">
              Exposure Map
            </p>
          </div>
          <div className="space-y-4">
            {operational?.riskConcentration.length ? (
              operational.riskConcentration.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
                >
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span className="text-rose-600">
                      ₱{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full anim-grow-width shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                      style={{
                        width: `${(item.amount / Math.max(...operational.riskConcentration.map((x) => x.amount))) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Exposure on {item.count} active loans
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 italic text-xs">
                No active risk concentration.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tier Distribution (Migration) */}
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xl font-display font-bold italic">
                Member Trust Migration
              </h4>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {operational &&
                Object.entries(operational.delinquencyMigration).map(
                  ([tier, count], i) => (
                    <div
                      key={i}
                      className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors"
                    >
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">
                        {tier}
                      </p>
                      <p className="text-2xl font-display font-bold">{count}</p>
                    </div>
                  ),
                )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Patuloy na sinusubaybayan ang paggalaw ng mga miyembro sa pagitan
              ng trust tiers."
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Geographical Origins */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-display font-bold text-slate-900 italic">
              Traffic Origins
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.geoData.slice(0, 8).map((g, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">
                  {g.city}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({g.region})
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
            "Mataas ang engagement sa mga urban areas. Isaalang-alang ang
            expansion sa mga karatig-pook."
          </p>
        </div>
      </div>
    </div>
  );
}
