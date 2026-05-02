"use client";

import { MapPin, Building2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export interface Branch {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string;
  status: "active" | "planned";
  x: number;
  y: number;
  color?: string;
}

export function BranchNetworkMap({ branches = [] }: { branches?: Branch[] }) {
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [mounted, setMounted] = useState(false);

  const displayBranches = branches.length > 0 ? branches : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="aspect-[3/4] bg-slate-100 rounded-[3rem] animate-pulse" />
    );

  return (
    <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center py-12">
      <div className="lg:col-span-3 relative aspect-[3/4] bg-white rounded-[3rem] p-8 shadow-2xl shadow-emerald-500/10 border border-slate-100 overflow-hidden group">
        {/* Simplified SVG PH Map background */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-slate-100 fill-current transition-all duration-700 group-hover:scale-105"
        >
          {/* Main Luzon Block */}
          <path
            d="M30 10 L60 10 L55 45 L25 45 Z"
            className="opacity-20 text-emerald-200"
          />
          {/* Visayas Block */}
          <circle
            cx="55"
            cy="65"
            r="15"
            className="opacity-15 text-emerald-300"
          />
          {/* Mindanao Block */}
          <path
            d="M40 75 L85 75 L90 95 L30 95 Z"
            className="opacity-20 text-emerald-400"
          />

          {/* Grid lines for aesthetic */}
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke="currentColor"
            strokeWidth="0.1"
            strokeDasharray="1,2"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="currentColor"
            strokeWidth="0.1"
            strokeDasharray="1,2"
          />
          <line
            x1="0"
            y1="80"
            x2="100"
            y2="80"
            stroke="currentColor"
            strokeWidth="0.1"
            strokeDasharray="1,2"
          />

          {/* Branch Pins */}
          {displayBranches.map((branch) => (
            <g
              key={branch.id}
              className="cursor-pointer group/pin"
              onClick={() => setActiveBranch(branch)}
              onMouseEnter={() => setActiveBranch(branch)}
            >
              <circle
                cx={branch.x}
                cy={branch.y}
                r="3"
                className={`transition-all duration-300 ${
                  activeBranch?.id === branch.id
                    ? "fill-emerald-600 r-[4]"
                    : "fill-emerald-400/50"
                }`}
              />
              <circle
                cx={branch.x}
                cy={branch.y}
                r="1.5"
                className="fill-white"
              />
              {/* Pulse effect for active/hover */}
              <circle
                cx={branch.x}
                cy={branch.y}
                r="6"
                className={`fill-emerald-500/20 animate-ping transition-all ${
                  activeBranch?.id === branch.id ? "opacity-100" : "opacity-0"
                }`}
              />
            </g>
          ))}
        </svg>

        <div className="absolute top-8 left-8">
          <h3 className="text-2xl font-black italic text-slate-900 tracking-tight">
            Kasama sa Bawat Sulok
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            Ang ating lumalaking network ng kooperatiba.
          </p>
        </div>

        <div className="absolute bottom-8 right-8 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-bounce">
          <MapPin className="w-3 h-3" />
          I-click ang mga branch sa mapa
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {activeBranch ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-3xl font-black italic text-slate-900 tracking-tight leading-tight">
                {activeBranch.name}
              </h4>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                {activeBranch.city}, {activeBranch.region}
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Aktibong serving members sa {activeBranch.region}. Click below
              para bumisita sa kanilang digital branch dashboard.
            </p>
            <Link
              href={`/${activeBranch.slug}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all group"
            >
              Bisitahin ang Branch
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
            <div className="w-12 h-12 text-slate-300 mb-4">
              <MapPin className="w-full h-full" />
            </div>
            <p className="text-slate-400 font-bold italic">
              Pumili ng branch sa mapa para makita ang detalye.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-2xl font-black text-emerald-600 italic">500+</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Active Members
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-2xl font-black text-emerald-600 italic">₱2M+</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Loans Repaid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
