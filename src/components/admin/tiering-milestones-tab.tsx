"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Target, BookOpen, Crown, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

const MILESTONES = [
  {
    tier: "T5: Elite",
    interest: "3.0% Monthly",
    limit: "₱100,000+",
    score: "90-100",
    color: "emerald",
    icon: Crown,
    objectives: [
      "Maintain 100% on-time repayment for 12+ months",
      "Accumulate 5+ verified guarantor endorsements",
      "Represent cooperative in 2+ community forums",
    ],
    perks: [
      "Lowest available interest rate (3%)",
      "Instant loan approval (< 1 hour)",
      "Priority customer support",
    ],
  },
  {
    tier: "T4: Trusted",
    interest: "3.5% Monthly",
    limit: "₱50,000",
    score: "80-89",
    color: "blue",
    icon: ShieldCheck,
    objectives: [
      "Complete 5+ successful loan cycles",
      "No late payments for 6 consecutive months",
      "Valid business permit on file",
    ],
    perks: [
      "Declining balance interest model eligible",
      "Guarantor requirement reduced to 1 person",
      "Higher credit limit visibility",
    ],
  },
  {
    tier: "T3: Growth (Full)",
    interest: "4.0% Monthly",
    limit: "₱25,000",
    score: "70-79",
    color: "indigo",
    icon: Zap,
    objectives: [
      "Complete 3 successful loan cycles",
      "Maintain active savings account",
      "At least 2 verified peer reviews",
    ],
    perks: [
      "Access to business expansion loans",
      "Bi-weekly payment frequency option",
    ],
  },
  {
    tier: "T2: Growth (Lite)",
    interest: "4.5% Monthly",
    limit: "₱15,000",
    score: "60-69",
    color: "slate",
    icon: TrendingUp,
    objectives: [
      "Complete 1 full loan cycle on time",
      "Participate in financial literacy orientation",
      "Daily wallet activity for 30 days",
    ],
    perks: [
      "Credit limit increased from Starter",
      "Eligibility for weekly payment terms",
    ],
  },
  {
    tier: "T1: Starter",
    interest: "5.0% Monthly",
    limit: "₱5,000",
    score: "40-59",
    color: "orange",
    icon: Target,
    objectives: [
      "Complete account KYC verification",
      "Submit valid ID and Barangay Certificate",
      "Secure 2 verified guarantors",
    ],
    perks: [
      "Entry into the Agapay ecosystem",
      "Fixed amortization for predictability",
    ],
  },
];

export function TieringMilestonesTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tight text-slate-900 font-display">
            Progression Milestones
          </h2>
          <p className="text-slate-500 max-w-2xl">
            Detailed roadmap for member advancement. Higher tiers unlock lower interest rates, higher limits, and premium features.
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 text-sm font-bold flex items-center gap-2">
          <Zap className="h-4 w-4" />
          5 Active Tiers Defined
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-8 border-slate-200 shadow-sm rounded-[2rem] bg-gradient-to-br from-white to-slate-50/30">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">How to Level Up</h3>
              <p className="text-sm text-slate-500 font-sans">Strategic guide for rapid progression</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 font-black text-xs">01</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Precision Repayment</p>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  Repaying 1-2 days before the due date provides a "reliability bonus" to the trust score. Consistency is more important than amount.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-black text-xs">02</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Network Building</p>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  The trust of your guarantors directly impacts yours. Reciprocating as a guarantor for other elite members accelerates your path to Elite status.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-black text-xs">03</div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Documentation Hygiene</p>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  Keep your business permits and personal IDs updated. A verified, non-expired documentation set reduces the risk weight on your profile.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-slate-200 shadow-sm rounded-[2rem] bg-slate-900 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Interest Rate Strategy</h3>
              <p className="text-sm text-slate-400 font-sans">System-wide averages by tiering</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-medium text-slate-400">Current Average Interest</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tighter">4.2%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[65%]" />
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed uppercase tracking-widest font-black">
                Calculated across all 12 active tenants in the last 30 days
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Lowest Tier</p>
                <p className="text-xl font-bold">5.0% <span className="text-[10px] text-slate-500 font-normal ml-1">T1</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Elite Target</p>
                <p className="text-xl font-bold text-emerald-400">3.0% <span className="text-[10px] text-slate-500 font-normal ml-1">T5</span></p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {MILESTONES.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.tier} className="flex flex-col h-full border-slate-200 shadow-sm rounded-[2rem] hover:ring-2 hover:ring-indigo-500/20 transition-all group">
              <div className="p-6 pb-4 flex-1">
                <div className={`h-12 w-12 rounded-2xl mb-4 flex items-center justify-center ${
                  m.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  m.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  m.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  m.color === 'slate' ? 'bg-slate-100 text-slate-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <h4 className="text-lg font-black italic tracking-tight text-slate-900 mb-1">{m.tier}</h4>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-6 font-bold uppercase tracking-wider">
                  <ArrowUpRight className="h-3 w-3" />
                  Max Limit: {m.limit}
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objectives</p>
                  {m.objectives.map((obj, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{obj}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unlocked Perks</p>
                  <div className="flex flex-wrap gap-2">
                    {m.perks.map((perk, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 text-[10px] font-semibold py-0.5">
                        {perk}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interest</p>
                    <p className="font-bold text-slate-900">{m.interest}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score Range</p>
                    <p className="font-bold text-slate-900">{m.score}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
