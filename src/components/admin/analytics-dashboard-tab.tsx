"use server";

import {
  TrendingUp,
  Banknote,
  PiggyBank,
  BarChart3,
  PieChart,
  Zap,
  Calculator,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  getTenantAnalytics,
  getOperationalInsights,
  getFinancialIntegrityCheck,
  getGrowthAnalytics,
} from "@/actions/analytics-actions";
import { KPIMetricCard } from "../analytics/kpi-metric-card";

export async function AnalyticsDashboardTab() {
  const [analytics, operational, integrity, growth] = await Promise.all([
    getTenantAnalytics(30),
    getOperationalInsights(30),
    getFinancialIntegrityCheck(),
    getGrowthAnalytics(),
  ]);

  const totalCapitalPool =
    (integrity?.treasuryBalance ?? 0) + (integrity?.savingsPoolTotal ?? 0);
  const totalOutstandingLoans =
    operational?.riskConcentration.reduce(
      (s: number, r: { amount: number }) => s + r.amount,
      0,
    ) ?? 0;
  const utilizationRate =
    totalCapitalPool > 0
      ? ((totalOutstandingLoans / totalCapitalPool) * 100).toFixed(1)
      : "0.0";
  const totalRepaymentVelocity =
    operational?.repaymentVelocity.reduce(
      (s: number, r: { amount: number }) => s + r.amount,
      0,
    ) ?? 0;

  const capitalGrowthRate = operational?.repaymentVelocity.length
    ? ((totalRepaymentVelocity / totalCapitalPool) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Investment Overview Section */}
      {operational && (
        <div className="p-8 rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold italic tracking-tight">
                  Capital Performance Overview
                </h3>
                <p className="text-sm text-slate-300 max-w-xl">
                  Total outstanding portfolio of ₱{totalOutstandingLoans.toLocaleString()} across{" "}
                  {operational.riskConcentration.length} active investment areas —{" "}
                  {Number.parseFloat(utilizationRate) > 50 ? "actively deployed" : "room for additional lending"}.
                </p>
              </div>
            </div>
            <div className="flex gap-6 pr-4">
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
                  Capital Pool
                </p>
                <p className="text-2xl font-display font-bold leading-none">
                  ₱{(totalCapitalPool / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                  Utilization
                </p>
                <p className="text-2xl font-display font-bold leading-none">
                  {utilizationRate}%
                </p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-emerald-500/5 -skew-x-12 translate-x-20" />
        </div>
      )}

      {/* Capital & Investment KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIMetricCard
          label="Total Capital Pool"
          value={`₱${(totalCapitalPool / 1000).toFixed(0)}K`}
          iconName="activity"
          description={`Treasury + Member Savings: ₱${totalCapitalPool.toLocaleString()}`}
        />
        <KPIMetricCard
          label="Capital Utilization"
          value={`${utilizationRate}%`}
          iconName="check"
          description={`₱${totalOutstandingLoans.toLocaleString()} in active loans`}
          trend={{
            value: Number.parseFloat(utilizationRate),
            isPositive: Number.parseFloat(utilizationRate) > 50,
          }}
        />
        <KPIMetricCard
          label="Collection Velocity"
          value={`₱${(totalRepaymentVelocity / 1000).toFixed(0)}K`}
          iconName="trending"
          description="Total repayments (30d)"
          trend={{ value: 12, isPositive: true }}
        />
        <KPIMetricCard
          label="Capital Return Rate"
          value={`${capitalGrowthRate}%`}
          iconName="alert"
          description="Collection vs capital pool ratio"
          variant="solid"
        />
      </div>

      {/* Repayment Velocity & Risk Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-display font-bold italic text-foreground">
                Repayment Velocity (30d)
              </h3>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-48 w-full bg-slate-50/50 rounded-2xl flex items-end justify-between p-6 gap-2 border border-slate-100">
            {operational?.repaymentVelocity.length ? (
              operational.repaymentVelocity.slice(-15).map(
                (d: { date: string; amount: number }, i: number) => (
                  <div
                    key={i}
                    className="w-full bg-amber-500 hover:bg-amber-600 transition-all rounded-t-lg relative group shadow-[0_-4px_12px_rgba(245,158,11,0.2)]"
                    style={{
                      height: `${Math.max(5, (d.amount / Math.max(...operational.repaymentVelocity.map((x: { amount: number }) => x.amount))) * 100)}%`,
                    }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                      {d.date}: ₱{d.amount.toLocaleString()}
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
                No repayment data found
              </div>
            )}
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Velocity Insight
            </div>
            <p className="text-xs text-muted-foreground font-medium italic">
              "Stable ang pasok ng pondo. Panatilihin ang collection efforts."
            </p>
          </div>
        </div>

        <div className="dashboard-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-display font-bold italic text-foreground">
                Investment Distribution
              </h3>
            </div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-2 py-1 rounded-md">
              Active Portfolio
            </p>
          </div>
          <div className="space-y-4">
            {operational?.riskConcentration.length ? (
              operational.riskConcentration.map(
                (
                  item: { label: string; amount: number; count: number },
                  idx: number,
                ) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>{item.label}</span>
                      <span className="text-rose-600">
                        ₱{item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                        style={{
                          width: `${(item.amount / Math.max(...operational.riskConcentration.map((x: { amount: number }) => x.amount))) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Exposure on {item.count} active loans
                    </p>
                  </div>
                ),
              )
            ) : (
              <div className="p-12 text-center text-muted-foreground italic text-xs">
                No active investment distribution.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Business Insights & Capital Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl text-white space-y-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xl font-display font-bold italic">
                Investment Yield
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">
                  Portfolio Yield
                </p>
                <p className="text-3xl font-display font-bold">
                  {totalCapitalPool > 0
                    ? `${((totalRepaymentVelocity / totalCapitalPool) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  30-day return on capital
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black text-amber-400 uppercase mb-2">
                  Capital Efficiency
                </p>
                <p className="text-3xl font-display font-bold">
                  {utilizationRate}%
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Outstanding vs available
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Ang capital ay aktibong gumagana — binabantayan ang yield at efficiency ng investment portfolio."
            </p>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="dashboard-card space-y-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-display font-bold italic text-foreground">
              Capital Allocation Summary
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Treasury Vault
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Liquid capital reserves
                  </p>
                </div>
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                ₱{(integrity?.treasuryBalance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <PiggyBank className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Member Savings Pool
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Total member deposits
                  </p>
                </div>
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                ₱{(integrity?.savingsPoolTotal ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Total Capital Pool
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Combined available capital
                  </p>
                </div>
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                ₱{totalCapitalPool.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
            Capital Utilization Rate:{" "}
            <span className="font-bold text-foreground">{utilizationRate}%</span>{" "}
            — {Number.parseFloat(utilizationRate) > 60 ? "Healthy" : "Under-utilized"} deployment of available funds.
          </p>
        </div>
      </div>

      {/* Growth Analytics: FUM Trend, Member Growth, Default Forecast */}
      {growth && (
        <>
          {/* FUM Trend */}
          <div className="dashboard-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-display font-bold italic text-foreground">
                Total FUM Trend (6mo)
              </h3>
            </div>
            <div className="h-48 w-full bg-slate-50/50 rounded-2xl flex items-end justify-between p-6 gap-2 border border-slate-100">
              {growth.fumTrend.length ? (
                growth.fumTrend.map((d, i) => {
                  const max = Math.max(...growth.fumTrend.map((x) => x.amount), 1);
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all rounded-t-lg relative group shadow-[0_-4px_12px_rgba(16,185,129,0.2)]"
                        style={{ height: `${Math.max(5, (d.amount / max) * 100)}%` }}
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                          ₱{d.amount.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium -rotate-45 origin-left">{d.date}</span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
                  No FUM data yet
                </div>
              )}
            </div>
          </div>

          {/* Member Growth + Default Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="dashboard-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-display font-bold italic text-foreground">
                  Member Growth
                </h3>
              </div>
              <div className="h-40 w-full bg-slate-50/50 rounded-2xl flex items-end justify-between p-6 gap-2 border border-slate-100">
                {growth.memberGrowth.length ? (
                  growth.memberGrowth.map((d, i) => {
                    const max = Math.max(...growth.memberGrowth.map((x) => x.count), 1);
                    return (
                      <div key={i} className="w-full flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t-lg relative group shadow-[0_-4px_12px_rgba(59,130,246,0.2)]"
                          style={{ height: `${Math.max(5, (d.count / max) * 100)}%` }}
                        >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                            {d.count} members
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium -rotate-45 origin-left">{d.date}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
                    No member growth data
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl font-display font-bold italic text-foreground">
                  Default Forecast
                </h3>
              </div>
              <div className="space-y-3">
                {growth.defaultForecast.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.value}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      item.trend === "up" ? "text-rose-600" :
                      item.trend === "down" ? "text-emerald-600" :
                      "text-amber-600"
                    }`}>
                      {item.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> :
                       item.trend === "down" ? <ArrowDownRight className="w-4 h-4" /> :
                       <Minus className="w-4 h-4" />}
                      {item.trend === "up" ? "Rising" : item.trend === "down" ? "Falling" : "Stable"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
