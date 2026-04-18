"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrustScoreBreakdown } from "@/lib/trust-engine";
import { InterestTier } from "@prisma/client";

interface TrustMeterProps {
  data: TrustScoreBreakdown;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TrustMeter({ data, className, size = "md" }: TrustMeterProps) {
  const {
    score,
    paymentScore,
    businessScore,
    peerScore,
    guarantorScore,
    tier,
  } = data;

  // Gauge constants
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Semi-circle

  // Calculate offsets for segments
  // Red: 0-70, Yellow: 70-85, Green: 85-100
  const redEnd = 70;
  const yellowEnd = 85;

  const scoreColor =
    score >= 85
      ? "text-emerald-500"
      : score >= 70
        ? "text-amber-500"
        : "text-rose-500";
  const scoreStroke =
    score >= 85
      ? "stroke-emerald-500"
      : score >= 70
        ? "stroke-amber-500"
        : "stroke-rose-500";

  const getStrokeDashoffset = (val: number) => {
    const percentage = Math.max(0, Math.min(100, val));
    return circumference - (percentage / 100) * circumference;
  };

  const needleRotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  const factorColors = {
    payment: paymentScore >= 70 ? "bg-emerald-500" : "bg-rose-500",
    business: businessScore >= 70 ? "bg-emerald-500" : "bg-rose-500",
    peer: peerScore >= 70 ? "bg-emerald-500" : "bg-rose-500",
    guarantor: guarantorScore >= 70 ? "bg-emerald-500" : "bg-rose-500",
  };

  return (
    <div className={cn("flex flex-col items-center space-y-6", className)}>
      <div className="relative">
        <svg
          height={radius + strokeWidth}
          width={radius * 2 + strokeWidth}
          className="transform rotate-0"
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth / 2},${radius + strokeWidth / 2} A ${normalizedRadius},${normalizedRadius} 0 0 1 ${radius * 2 + strokeWidth / 2},${radius + strokeWidth / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress Path */}
          <path
            d={`M ${strokeWidth / 2},${radius + strokeWidth / 2} A ${normalizedRadius},${normalizedRadius} 0 0 1 ${radius * 2 + strokeWidth / 2},${radius + strokeWidth / 2}`}
            fill="none"
            className={cn("transition-all duration-1000 ease-out", scoreStroke)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={getStrokeDashoffset(score)}
          />

          {/* Markers */}
          <line
            x1={radius + strokeWidth / 2}
            y1={strokeWidth}
            x2={radius + strokeWidth / 2}
            y2={strokeWidth + 10}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
        </svg>

        {/* Central Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className={cn(
              "text-5xl font-display font-bold tabular-nums",
              scoreColor,
            )}
          >
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Trust Score
          </span>
        </div>
      </div>

      {/* Tier Badge */}
      <div
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border",
          score >= 85
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            : score >= 70
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20",
        )}
      >
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        Tier:{" "}
        {tier === InterestTier.T5_3_PERCENT
          ? "Elite (3%)"
          : tier === InterestTier.T4_3_5_PERCENT
            ? "Growth (3.5%)"
            : "Starter (5%)"}
      </div>

      {/* Factor Breakdown */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
        {[
          { label: "Payment", val: paymentScore },
          { label: "Business", val: businessScore },
          { label: "Peer", val: peerScore },
          { label: "Guarantor", val: guarantorScore },
        ].map((f) => (
          <div key={f.label} className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {f.label}
              </span>
              <span className="text-[10px] font-bold text-slate-900">
                {f.val}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  f.val >= 70 ? "bg-emerald-500" : "bg-rose-500",
                )}
                style={{ width: `${f.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
