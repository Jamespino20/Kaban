"use client";

import { useEffect, useState } from "react";
import { Sparkles, BrainCircuit, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { getAISnapshot } from "@/actions/ai-actions";
import { Card } from "@/components/ui/card";

export function AISnapshotSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAISnapshot()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="p-6 border-slate-100 bg-white/50 backdrop-blur-sm animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-12 w-full bg-slate-50 rounded-2xl" />
          <div className="h-12 w-full bg-slate-50 rounded-2xl" />
        </div>
      </Card>
    );
  }

  if (!data?.insights?.length) return null;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem]">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
      
      <div className="p-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl ring-1 ring-primary/30 backdrop-blur-md">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">AI Insights Snapshot</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                {data.analysisMode}
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>

        <div className="space-y-3">
          {data.insights.map((insight: any, i: number) => {
            const Icon = insight.type === "warning" ? AlertCircle : insight.type === "success" ? CheckCircle2 : Info;
            const colorClass = insight.type === "warning" ? "from-rose-500/10 to-transparent border-rose-500/20 text-rose-200" 
                             : insight.type === "success" ? "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-200"
                             : "from-blue-500/10 to-transparent border-blue-500/20 text-blue-200";
            
            return (
              <div key={i} className={`flex gap-4 p-4 rounded-2xl border bg-gradient-to-r ${colorClass}`}>
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold mb-1 brightness-110">{insight.title}</h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-[9px] text-slate-500 font-medium">
          <span>Engine updated {new Date(data.timestamp).toLocaleTimeString()}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
            Real-time Monitoring Active
          </span>
        </div>
      </div>
    </Card>
  );
}
