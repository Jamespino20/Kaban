"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lightbulb, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { getMemberFinancialTips } from "@/actions/ai-actions";
import { Card } from "@/components/ui/card";

export function AIFinancialTips() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberFinancialTips()
      .then(setTips)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 w-full bg-slate-100 rounded-3xl" />
        <div className="h-20 w-full bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (tips.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900">Personalized Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <Card 
            key={i} 
            className="group relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 rounded-[2rem] p-6"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors" />
            
            <div className="relative z-10 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                {i % 2 === 0 ? <Lightbulb className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{tip.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tip.message}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
