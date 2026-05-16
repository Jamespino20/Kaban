"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, Shield, Zap, Building } from "lucide-react";
import Link from "next/link";
import { PricingToggle } from "@/components/shared/pricing-toggle";

const PLAN_ICON_MAP: Record<string, { icon: any; highlight: boolean }> = {
  "Agapay Core": { icon: Building, highlight: false },
  "Agapay Pro": { icon: Zap, highlight: true },
  "Agapay Enterprise": { icon: Shield, highlight: false },
};

const PLAN_CTA_MAP: Record<string, string> = {
  "Agapay Core": "Start with Core",
  "Agapay Pro": "Upgrade to Pro",
  "Agapay Enterprise": "Get Started",
};

export function PricingCards({ plans }: { plans: any[] }) {
  const [cycle, setCycle] = useState<"monthly" | "quarterly" | "semi_annually" | "annually">("monthly");

  const getPlanPrice = (plan: any) => {
    switch (cycle) {
      case "quarterly":
        return Number(plan.price_quarterly || 0);
      case "semi_annually":
        return Number(plan.price_semi_annually || 0);
      case "annually":
        return Number(plan.price_annually || 0);
      default:
        return Number(plan.price_monthly || 0);
    }
  };

  const cycleLabels: Record<string, string> = {
    monthly: "mo",
    quarterly: "qtr",
    semi_annually: "6mo",
    annually: "yr",
  };

  const getMemberLimit = (plan: any) => {
    return plan.max_members >= 1000000
      ? "Unlimited members"
      : `Up to ${plan.max_members.toLocaleString()} members`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="inline-flex items-center gap-2 text-emerald-700 font-bold tracking-widest text-xs uppercase mb-6 px-4 py-1.5 bg-emerald-100/90 rounded-full border border-emerald-200/50">
          <BadgeCheck className="w-4 h-4" />
          SaaS for Cooperatives
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight italic mb-6 leading-[0.95] text-slate-900">
          Subscribing to <span className="text-emerald-600">Agapay.</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10">
          Simple and fair pricing to run your cooperative with technology.
          No hidden fees.
        </p>

        <PricingToggle cycle={cycle} onChange={setCycle} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        {plans.map((plan: any) => {
          const cfg = PLAN_ICON_MAP[plan.tier_name] || { icon: Shield, highlight: false };
          const price = getPlanPrice(plan);
          const Icon = cfg.icon;
          const features = Array.isArray(plan.features) ? plan.features : [];
          const buttonText = PLAN_CTA_MAP[plan.tier_name] || "Get Started";
          const description = plan.description ||
            (plan.tier_name === "Agapay Core"
              ? "For cooperatives just getting started and small lending teams."
              : plan.tier_name === "Agapay Pro"
              ? "For growing cooperatives that need advanced analytics."
              : "For larger institutions. Limitless capacity.");
          
          return (
            <div
              key={plan.tier_name}
              className={`relative p-10 rounded-[3rem] border flex flex-col transition-all ${
                cfg.highlight
                  ? "bg-slate-900 border-slate-800 text-white shadow-2xl scale-105 z-10"
                  : "bg-white border-slate-200 shadow-sm text-slate-900"
              }`}
            >
              {cfg.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-sm px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div
                className={`p-4 rounded-2xl w-fit mb-6 ${cfg.highlight ? "bg-slate-800" : "bg-emerald-50"}`}
              >
                <Icon
                  className={`w-8 h-8 ${cfg.highlight ? "text-emerald-400" : "text-emerald-600"}`}
                />
              </div>
              <h3 className="text-2xl font-black italic mb-2">{plan.tier_name}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-black">₱{price.toLocaleString()}</span>
                <span
                  className={`text-sm font-bold ${cfg.highlight ? "text-slate-400" : "text-slate-500"}`}
                >
                  / {cycleLabels[cycle]}
                </span>
              </div>
              <p
                className={`font-medium leading-relaxed mb-2 h-auto ${cfg.highlight ? "text-slate-300" : "text-slate-600"}`}
              >
                {description}
              </p>
              <p className={`text-xs font-bold mb-8 ${cfg.highlight ? "text-slate-400" : "text-slate-500"}`}>
                {getMemberLimit(plan)}
              </p>
              <div className="flex-1 space-y-4 mb-8">
                {features.map((feature: string) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.highlight ? "text-emerald-400" : "text-emerald-500"}`}
                    />
                    <span
                      className={`text-sm font-bold leading-relaxed ${cfg.highlight ? "text-slate-200" : "text-slate-700"}`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/onboarding"
                className={`block text-center py-4 rounded-2xl font-black italic transition-all ${
                  cfg.highlight
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {buttonText}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
