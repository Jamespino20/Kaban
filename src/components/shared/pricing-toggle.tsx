"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  cycle: "monthly" | "annually";
  onChange: (cycle: "monthly" | "annually") => void;
}

export function PricingToggle({ cycle, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span
        className={`text-sm font-bold ${cycle === "monthly" ? "text-emerald-600" : "text-slate-400"}`}
      >
        Bulanan
      </span>
      <button
        type="button"
        onClick={() => onChange(cycle === "monthly" ? "annually" : "monthly")}
        className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors hover:bg-slate-300"
      >
        <motion.div
          animate={{ x: cycle === "monthly" ? 0 : 28 }}
          className="w-5 h-5 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-bold ${cycle === "annually" ? "text-emerald-600" : "text-slate-400"}`}
        >
          Taunan
        </span>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
          2 Buwan Libre
        </span>
      </div>
    </div>
  );
}
