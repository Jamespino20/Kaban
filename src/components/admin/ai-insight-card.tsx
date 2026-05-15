"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Clock, AlertTriangle, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { getAiSummary } from "@/actions/ai-summary";

interface AiInsightData {
  summary: string;
  highlights: string[];
  warnings: string[];
  generatedAt: Date;
}

export function AiInsightCard({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<AiInsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setError(null);
      if (data) setRegenerating(true);
      else setLoading(true);
      const result = await getAiSummary();
      setData(result);
      setGeneratedAt(result.generatedAt);
    } catch (e: any) {
      setError(e.message || "Failed to generate insights");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [data]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const getTimeAgo = () => {
    if (!generatedAt) return "";
    const diff = Date.now() - new Date(generatedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  if (loading) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${compact ? "space-y-2" : "space-y-4"}`}>
        <div className="flex items-center gap-3">
          {!compact && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><Sparkles className="h-4 w-4 text-slate-400" /></div>}
          <div className={`bg-slate-100 rounded animate-pulse ${compact ? "h-3 w-28" : "h-4 w-36"}`} />
        </div>
        <div className="space-y-2">
          <div className={`bg-slate-50 rounded animate-pulse ${compact ? "h-3 w-full" : "h-4 w-full"}`} />
          <div className={`bg-slate-50 rounded animate-pulse ${compact ? "h-3 w-3/4" : "h-4 w-5/6"}`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm ${compact ? "space-y-2" : "space-y-3"}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Failed to load insights</span>
        </div>
        <p className="text-xs text-red-500">{error}</p>
        <button
          onClick={fetchSummary}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  if (compact) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Snapshot</span>
          </div>
          <button
            onClick={fetchSummary}
            disabled={regenerating}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{data.summary}</p>
        <div className="flex items-center gap-3 pt-1">
          {data.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.highlights.slice(0, 2).map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {h.split("—")[0].trim()}
                </span>
              ))}
            </div>
          )}
          <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {getTimeAgo()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Snapshot Summary</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Platform Intelligence
            </p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          disabled={regenerating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Generating..." : "Regenerate"}
        </button>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>

      <div className="flex flex-wrap gap-2">
        {data.highlights.map((h, i) => (
          <span
            key={`hl-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
          >
            <TrendingUp className="h-3 w-3" />
            {h}
          </span>
        ))}
        {data.warnings.map((w, i) => (
          <span
            key={`wr-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200"
          >
            <AlertTriangle className="h-3 w-3" />
            {w}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <Clock className="h-3 w-3" />
        Last generated: {getTimeAgo()}
      </div>
    </div>
  );
}
