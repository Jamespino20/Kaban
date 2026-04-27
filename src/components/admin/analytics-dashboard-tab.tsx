"use server";

import {
  Activity,
  Globe,
  MousePointer2,
  TrendingUp,
  Users,
} from "lucide-react";
import { getTenantAnalytics } from "@/actions/analytics-actions";
import { KPIMetricCard } from "../analytics/kpi-metric-card";

export async function AnalyticsDashboardTab() {
  const analytics = await getTenantAnalytics(30); // Last 30 days

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
      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPIMetricCard
          label="Total Page Views"
          value={totalPageViews.toLocaleString()}
          iconName="activity"
          description="Last 30 days of traffic"
        />
        <KPIMetricCard
          label="Behavioral Events"
          value={totalInteractions.toLocaleString()}
          iconName="check"
          description="Total interactions logged"
        />
        <KPIMetricCard
          label="Active Regions"
          value={analytics.geoData.length.toString()}
          iconName="trending" // "globe" was invalid, using "trending" as fallback
          description="Unique cities tracked"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Trends Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-display font-bold text-slate-900 italic">
              Traffic Volume (30d)
            </h3>
          </div>
          <div className="h-48 w-full bg-slate-50 rounded-2xl flex items-end justify-between p-6 gap-2 border border-slate-100">
            {analytics.trafficTrends
              .slice(-15)
              .map((d: { date: string; count: number }, i: number) => (
                <div
                  key={i}
                  className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors rounded-t-sm relative group"
                  style={{
                    height: `${Math.max(10, (d.count / Math.max(...analytics.trafficTrends.map((x) => x.count))) * 100)}%`,
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {d.date}: {d.count}
                  </div>
                </div>
              ))}
          </div>
          <p className="text-xs text-slate-400 text-center">
            Tingnan ang daloy ng trapiko sa nakalipas na 15 araw.
          </p>
        </div>

        {/* Behavioral Heatmap */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <MousePointer2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-display font-bold text-slate-900 italic">
              Top Member Interactions
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.interactionHeatmap.map(
              (item: { type: string; count: number }, idx: number) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>{item.type.replace(/_/g, " ")}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)] anim-grow-width"
                      style={{
                        width: `${(item.count / analytics.interactionHeatmap[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Geographical Insights */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-8 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Geographical Distribution
              </span>
            </div>
            <h3 className="text-3xl font-display font-bold italic underline decoration-emerald-500/30 underline-offset-8">
              Traffic Origins
            </h3>
            <p className="text-slate-400 text-sm max-w-md mt-4">
              Nagmumula ang iyong trapiko sa mga rehiyong ito. Ginagamit namin
              ang Vercel Geo-Insights para sa mataas na antas ng katumpakan.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {analytics.geoData
              .slice(0, 5)
              .map(
                (
                  g: { region: string; city: string; count: number },
                  idx: number,
                ) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                      {g.region}
                    </p>
                    <p className="text-lg font-display font-bold text-emerald-400">
                      {g.city}
                    </p>
                  </div>
                ),
              )}
          </div>
        </div>

        {/* User Interaction Density Grid */}
        <div className="relative z-10 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-indigo-400" />
            <h4 className="text-lg font-display font-bold">
              Top Active Members
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.activeUserDensity.map(
              (u: { userId: number | null; count: number }, i: number) => (
                <div
                  key={i}
                  className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mx-auto mb-3 font-bold">
                    #{u.userId}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Interactions
                  </p>
                  <p className="text-xl font-bold">{u.count}</p>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
