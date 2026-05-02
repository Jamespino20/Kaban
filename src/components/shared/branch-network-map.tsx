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
          className="w-full h-full text-slate-100 fill-current transition-all duration-700 group-hover:scale-[1.02]"
        >
          {/* Luzon */}
          <path
            d="M40 10 C 55 8, 55 25, 48 35 C 55 45, 60 52, 52 58 C 45 62, 35 55, 40 45 C 32 38, 30 25, 35 15 Z"
            className="opacity-25 text-emerald-300 drop-shadow-sm"
          />
          {/* Palawan */}
          <path
            d="M32 50 C 37 55, 18 78, 12 72 C 8 68, 27 45, 32 50 Z"
            className="opacity-20 text-emerald-400 drop-shadow-sm"
          />
          {/* Visayas Islands */}
          <path
            d="M50 60 C 58 55, 65 65, 55 70 C 48 72, 42 65, 50 60 Z"
            className="opacity-20 text-emerald-400"
          />
          <path
            d="M68 55 C 75 52, 85 62, 75 68 C 65 72, 60 62, 68 55 Z"
            className="opacity-25 text-emerald-400"
          />
          <path
            d="M45 68 C 50 65, 55 70, 50 75 C 42 78, 38 72, 45 68 Z"
            className="opacity-20 text-emerald-300"
          />
          {/* Mindanao */}
          <path
            d="M55 75 C 75 70, 85 80, 90 90 C 85 102, 60 98, 55 90 C 48 85, 45 80, 55 75 Z"
            className="opacity-30 text-emerald-500 drop-shadow-sm"
          />

          {/* Grid lines for aesthetic */}
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.2"
            strokeDasharray="1,2"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.2"
            strokeDasharray="1,2"
          />
          <line
            x1="0"
            y1="80"
            x2="100"
            y2="80"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.2"
            strokeDasharray="1,2"
          />
          <line
            x1="30"
            y1="0"
            x2="30"
            y2="100"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.2"
            strokeDasharray="1,2"
          />
          <line
            x1="70"
            y1="0"
            x2="70"
            y2="100"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.2"
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
            Nationwide Presence
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            Our growing cooperative network.
          </p>
        </div>

        <div className="absolute bottom-8 right-8 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-bounce cursor-default">
          <MapPin className="w-3 h-3" />
          Click the branches on the map
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
              Actively serving members in the {activeBranch.region} region.
              Click below to visit their digital branch dashboard.
            </p>
            <Link
              href={`/${activeBranch.slug}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all group"
            >
              Visit Branch Homepage
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
            <div className="w-12 h-12 text-slate-300 mb-4">
              <MapPin className="w-full h-full" />
            </div>
            <p className="text-slate-400 font-bold italic">
              Select a branch on the map to see details.
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
