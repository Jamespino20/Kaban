"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  cycle: "monthly" | "quarterly" | "semi_annually" | "annually";
  onChange: (cycle: "monthly" | "quarterly" | "semi_annually" | "annually") => void;
}

export function PricingToggle({ cycle, onChange }: PricingToggleProps) {
  const cycles: { value: typeof cycle; label: string; offset: number }[] = [
    { value: "monthly", label: "Monthly", offset: 0 },
    { value: "quarterly", label: "Quarterly", offset: 1 },
    { value: "semi_annually", label: "Semi-Annual", offset: 2 },
    { value: "annually", label: "Annual", offset: 3 },
  ];

  const currentIndex = cycles.findIndex((c) => c.value === cycle);

  return (
    <div className="flex flex-col items-center gap-6 mb-8">
      <div className="relative flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200">
        <motion.div
          className="absolute inset-y-1.5 bg-white rounded-full shadow-sm border border-slate-100"
          initial={false}
          animate={{
            x: `${currentIndex * 100}%`,
            width: `${100 / cycles.length}%`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ width: "calc(25% - 6px)" }}
        />
        {cycles.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`relative z-10 px-6 py-2.5 text-sm font-black transition-colors min-w-[120px] rounded-full ${
              cycle === c.value ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      
      {cycle === "annually" && (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-200 animate-pulse">
          Save 2 Months Free
        </span>
      )}
    </div>
  );
}
