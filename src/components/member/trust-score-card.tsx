"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, TrendingUp, Award, Target, Info } from "lucide-react";
import { TIER_POLICIES, InterestTier, determineInterestTierFromScore, getEffectiveTierPolicies } from "@/lib/microfinance-policy";

interface TrustScoreCardProps {
  score: number;
  tierAfter: string | null;
  paymentScore: number;
  businessScore: number;
  peerScore: number;
  lastUpdated: string | null;
  milestones?: any;
}

const DEFAULT_TIER_MILESTONES = [
  { label: "Tier 1 — Gabay", minScore: 0, color: "text-slate-500", tier: InterestTier.T1_5_PERCENT },
  { label: "Tier 2 — Bagong Sigla", minScore: 55, color: "text-amber-600", tier: InterestTier.T2_4_5_PERCENT },
  { label: "Tier 3 — Kasapi", minScore: 65, color: "text-emerald-600", tier: InterestTier.T3_4_PERCENT },
  { label: "Tier 4 — Katuwang", minScore: 75, color: "text-blue-600", tier: InterestTier.T4_3_5_PERCENT },
  { label: "Tier 5 — Ka-Agapay", minScore: 85, color: "text-purple-600", tier: InterestTier.T5_3_PERCENT },
];

export function TrustScoreCard({
  score,
  tierAfter,
  paymentScore,
  businessScore,
  peerScore,
  lastUpdated,
  milestones,
}: TrustScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const effectivePolicies = useMemo(() => getEffectiveTierPolicies(milestones), [milestones]);

  const currentTier = determineInterestTierFromScore(score, milestones);
  const currentTierPolicy = effectivePolicies[currentTier];

  const nextTierEntries = Object.entries(effectivePolicies).filter(
    ([, policy]: [string, any]) => policy.trustScoreMin > score,
  );
  const nextTierPolicy = nextTierEntries.length > 0
    ? (nextTierEntries.sort(([, a]: [string, any], [, b]: [string, any]) => a.trustScoreMin - b.trustScoreMin)[0][1] as any)
    : null;

  const dynamicTierMilestones = useMemo(() => {
    return DEFAULT_TIER_MILESTONES.map(m => ({
      ...m,
      label: effectivePolicies[m.tier].label,
      minScore: effectivePolicies[m.tier].trustScoreMin
    })).sort((a, b) => a.minScore - b.minScore);
  }, [effectivePolicies]);

  const currentTierIndex = dynamicTierMilestones.findIndex(
    (m) => currentTierPolicy.trustScoreMin === m.minScore,
  );
  const nextMilestone = dynamicTierMilestones[currentTierIndex + 1] || null;
  const progressToNext = nextMilestone
    ? Math.min(100, ((score - currentTierPolicy.trustScoreMin) / (nextMilestone.minScore - currentTierPolicy.trustScoreMin)) * 100)
    : 100;

  const scoreColor = score >= 75 ? "text-emerald-600" : score >= 55 ? "text-amber-600" : "text-red-600";

  return (
    <div className="dashboard-card p-6 transition-all duration-300">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Trust Score
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {lastUpdated || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-numbers font-bold ${scoreColor}`}>
              {score}
            </div>
            <Badge
              variant="secondary"
              className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 h-auto"
            >
              {currentTierPolicy.label}
            </Badge>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {!expanded && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, paymentScore)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{paymentScore}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, businessScore)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{businessScore}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peer</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, peerScore)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{peerScore}</span>
                </div>
              </div>
            </div>

            {nextMilestone && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Progress to {nextMilestone.label}</span>
                  <span className="font-bold">{score}/{nextMilestone.minScore}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, progressToNext))}%`,
                      backgroundColor: "#6366f1",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </button>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-5 pt-2 border-t border-slate-100 mt-4">
          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, paymentScore)}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600">{paymentScore}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, businessScore)}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600">{businessScore}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peer</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, peerScore)}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600">{peerScore}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Score Milestones</h4>
            </div>
            <div className="space-y-2">
              {dynamicTierMilestones.map((milestone, i) => {
                const isReached = score >= milestone.minScore;
                const isCurrent = currentTierIndex === i;
                return (
                  <div
                    key={milestone.label}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all ${
                      isCurrent
                        ? "bg-indigo-50 border border-indigo-200"
                        : isReached
                          ? "bg-emerald-50 border border-emerald-100"
                          : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isReached ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <span className={`font-semibold ${isReached ? milestone.color : "text-slate-500"}`}>
                          {milestone.label}
                        </span>
                        {isCurrent && (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-700 border-none text-[9px]">Current</Badge>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${isReached ? "text-emerald-600" : "text-slate-400"}`}>
                      {isReached ? "✓" : `${milestone.minScore} pts`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Tier Benefits & Next Tier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-700">Current Tier Benefits</h4>
              </div>
              <ul className="space-y-1.5">
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  Cap amount: ₱{currentTierPolicy.capAmount.toLocaleString()}
                </li>
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  Rate: {currentTierPolicy.monthlyRatePercent}% monthly
                </li>
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  Max term: {currentTierPolicy.recommendedMaxTermMonths} months
                </li>
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  Score range: {currentTierPolicy.trustScoreMin}–{currentTierPolicy.trustScoreMax}
                </li>
              </ul>
            </div>

            {nextTierPolicy && (
              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700">Next Tier Benefits</h4>
                </div>
                <ul className="space-y-1.5">
                  <li className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    Cap amount: ₱{nextTierPolicy.capAmount.toLocaleString()}
                  </li>
                  <li className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    Rate: {nextTierPolicy.monthlyRatePercent}% monthly
                  </li>
                  <li className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    Max term: {nextTierPolicy.recommendedMaxTermMonths} months
                  </li>
                  <li className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    Need {nextMilestone ? `${nextMilestone.minScore}+ score` : "N/A"}
                  </li>
                </ul>
              </div>
            )}
          </div>

          {nextMilestone && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress to next tier</span>
                <span className="font-bold">{score}/{nextMilestone.minScore}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.max(0, Math.min(100, progressToNext))}%`,
                    backgroundColor: "#6366f1",
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {nextMilestone.minScore - score} more points needed to reach {nextMilestone.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
