"use client";

import { Check, ShieldCheck, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanProps {
  id: string;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isSelected?: boolean;
  billingLabel?: string;
}

export function PlanCard({
  id,
  name,
  price,
  description,
  features,
  isPopular,
  isSelected,
  onSelect,
  icon,
  billingLabel = "isang beses",
}: PlanProps) {
  const Icon =
    icon === "enterprise" ? Crown : icon === "pro" ? Zap : ShieldCheck;

  return (
    <div
      onClick={() => onSelect(id)}
      className={`relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col h-full ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/5 scale-[1.02]"
          : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30">
          Pinakasikat
        </div>
      )}

      <div className="mb-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${
            isSelected
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-black italic text-slate-900 mb-1">
          {name}
        </h4>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 italic">
            ₱{price}
          </span>
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
            {billingLabel}
          </span>
        </div>
      </div>

      <div className="space-y-3 flex-1 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                feature.included
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              <Check className="w-2.5 h-2.5 stroke-[4px]" />
            </div>
            <span
              className={`text-xs font-medium ${feature.included ? "text-slate-700" : "text-slate-300 line-through"}`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant={isSelected ? "default" : "outline"}
        className={`w-full rounded-2xl h-12 font-bold transition-all ${
          isSelected
            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            : "border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
        }`}
      >
        {isSelected ? "Pinili" : "Piliin"}
      </Button>
    </div>
  );
}
