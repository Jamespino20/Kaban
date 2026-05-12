"use client";

import { BadgeCheck, Calculator, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface MockPreviewProps {
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    displayName?: string;
  };
  content?: {
    heroHeadline?: string;
    heroSubheadline?: string;
  };
}

export function MockHomepagePreview({ branding, content }: MockPreviewProps) {
  const primaryColor = branding?.primaryColor || "#059669"; // Default emerald-600
  const displayName = branding?.displayName || "Agapay Cooperative";
  const heroHeadline = content?.heroHeadline || "Iyong Agapay, Ating Tagumpay";
  const heroSubheadline =
    content?.heroSubheadline ||
    "Filipino-first na lending platform para sa mga miyembro at cooperative tenants.";

  return (
    <div className="w-full h-full bg-slate-50 overflow-hidden flex flex-col border border-slate-200 rounded-2xl shadow-inner relative group">
      {/* Mini Navbar */}
      <nav className="h-10 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-1.5">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              className="w-5 h-5 object-contain"
              alt="Logo"
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-[10px]">
              A
            </div>
          )}
          <span className="text-[10px] font-black italic text-slate-900 truncate max-w-[100px]">
            {displayName}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="h-1.5 w-6 bg-slate-100 rounded-full" />
          <div className="h-1.5 w-6 bg-slate-100 rounded-full" />
        </div>
      </nav>

      {/* Mini Hero */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-12">
        <section className="py-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white shadow-sm border border-slate-100 rounded-full">
            <BadgeCheck className="w-2.5 h-2.5 text-emerald-600" />
            <span className="text-[8px] font-bold text-slate-500 tracking-widest uppercase">
              Member-Driven
            </span>
          </div>

          <h1 className="text-2xl font-black italic tracking-tighter leading-none text-slate-900">
            {heroHeadline.split(",")[0]},
            <span style={{ color: primaryColor }} className="block">
              {heroHeadline.split(",")[1] || "Ating Tagumpay"}
            </span>
          </h1>

          <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
            {heroSubheadline}
          </p>

          <div className="flex justify-center gap-2">
            <div
              style={{ backgroundColor: primaryColor }}
              className="px-4 py-2 rounded-lg text-[9px] font-bold text-white shadow-sm"
            >
              Sign Up Now
            </div>
            <div className="px-4 py-2 bg-slate-200 rounded-lg text-[9px] font-bold text-slate-700">
              Calculator
            </div>
          </div>
        </section>

        {/* Mini Feature Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h4 className="text-[11px] font-black italic">Trust Score</h4>
          <p className="text-[9px] text-slate-500 leading-snug">
            Binuo para sa transparency at paglago ng miyembro.
          </p>
        </div>

        {/* Overlay Label */}
        <div className="absolute top-12 right-4 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border border-white/20 shadow-lg">
          Live Preview Panel
        </div>
      </div>

      {/* Bottom Glow based on Primary Color */}
      <div
        className="absolute bottom-0 inset-x-0 h-1 blur-lg opacity-50 transition-all duration-700"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
}
