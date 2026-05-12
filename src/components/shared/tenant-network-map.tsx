"use client";

import { MapPin, Building2, ExternalLink, Plus, Minus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string;
  status: "active" | "planned";
  x: number;
  y: number;
  color?: string;
  brand_color?: string;
  logo_url?: string | null;
  memberCount?: number;
  loansRepaid?: number;
}

export function TenantNetworkMap({ tenants = [] }: { tenants?: Tenant[] }) {
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<HTMLDivElement>(null);

  const displayTenants = tenants.length > 0 ? tenants : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 1));

  if (!mounted)
    return (
      <div className="aspect-[3/4] bg-slate-100 rounded-[3rem] animate-pulse" />
    );

  return (
    <div className="relative w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center py-12">
      <div className="lg:col-span-3 relative aspect-[3/4] bg-white rounded-[3rem] p-8 shadow-2xl shadow-emerald-500/10 border border-slate-100 overflow-hidden group">
        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-100 transition-all text-slate-700"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-100 transition-all text-slate-700"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-[9px] font-bold text-center text-slate-400 mt-0.5">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* SVG Map Wrapper for Zoom */}
        <div
          ref={svgRef}
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-slate-100 fill-current transition-all duration-700"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Luzon - More Detailed */}
          <path
            d="M38 8 L45 5 L55 6 L58 12 L52 25 L58 35 L52 45 L55 52 L48 58 L40 55 L38 48 L35 35 L33 25 L34 15 Z"
            className="text-emerald-300 drop-shadow-md transition-all duration-500"
            fill="url(#islandGrad)"
            style={{ filter: "url(#glow)" }}
          />

          {/* Palawan */}
          <path
            d="M30 48 L35 52 L28 65 L22 75 L15 80 L12 75 L20 62 L25 55 Z"
            className="text-emerald-400 opacity-60"
            fill="url(#islandGrad)"
          />

          {/* Visayas Cluster */}
          <path
            d="M52 55 L58 52 L65 55 L68 62 L62 68 L55 65 Z"
            className="text-emerald-400 opacity-70"
            fill="url(#islandGrad)"
          />
          <path
            d="M68 58 L75 56 L82 60 L80 68 L72 70 L68 65 Z"
            className="text-emerald-300 opacity-60"
            fill="url(#islandGrad)"
          />
          <path
            d="M48 65 L55 68 L52 75 L45 78 L42 72 Z"
            className="text-emerald-300 opacity-70"
            fill="url(#islandGrad)"
          />

          {/* Mindanao */}
          <path
            d="M52 75 L65 72 L78 72 L85 78 L92 85 L88 95 L75 98 L60 95 L52 88 L48 82 Z"
            className="text-emerald-500 drop-shadow-xl transition-all duration-500"
            fill="url(#islandGrad)"
            style={{ filter: "url(#glow)" }}
          />

          {/* Connectors/Network Lines */}
          {displayTenants.length > 1 && activeTenant && (
            <g className="opacity-40">
              {displayTenants
                .filter((b) => b.id !== activeTenant.id)
                .slice(0, 3)
                .map((b) => (
                  <path
                    key={`line-${b.id}`}
                    d={`M${activeTenant.x} ${activeTenant.y} Q${(activeTenant.x + b.x) / 2} ${Math.min(activeTenant.y, b.y) - 10} ${b.x} ${b.y}`}
                    stroke="url(#islandGrad)"
                    strokeWidth="0.5"
                    fill="none"
                    strokeDasharray="2,2"
                    className="animate-pulse"
                  />
                ))}
            </g>
          )}

          {/* Tenant Pins */}
          {displayTenants.map((tenant) => (
            <g
              key={tenant.id}
              className="cursor-pointer group/pin"
              onClick={() => setActiveTenant(tenant)}
              onMouseEnter={() => setActiveTenant(tenant)}
            >
              {/* Animation Layer */}
              <circle
                cx={tenant.x}
                cy={tenant.y}
                r="5"
                className={`fill-emerald-400/20 transition-all duration-500 ${
                  activeTenant?.id === tenant.id
                    ? "scale-150 opacity-100"
                    : "scale-100 opacity-0 group-hover/pin:opacity-50"
                }`}
              />
              {/* Outer Ring */}
              <circle
                cx={tenant.x}
                cy={tenant.y}
                r={activeTenant?.id === tenant.id ? "3.5" : "2.5"}
                className={`transition-all duration-300 ${
                  activeTenant?.id === tenant.id
                    ? "fill-emerald-600"
                    : "fill-emerald-400 group-hover/pin:fill-emerald-500"
                }`}
              />
              {/* Inner Core */}
              <circle
                cx={tenant.x}
                cy={tenant.y}
                r="1"
                className="fill-white shadow-sm"
              />
              {/* Ripple */}
              {activeTenant?.id === tenant.id && (
                <circle
                  cx={tenant.x}
                  cy={tenant.y}
                  r="8"
                  className="fill-none stroke-emerald-500/30 stroke-1 animate-ping"
                />
              )}
            </g>
          ))}
        </svg>
        </div>

        <div className="absolute top-10 left-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">
              Real-time Network
            </span>
          </div>
          <h3 className="text-3xl font-black italic text-slate-900 tracking-tighter leading-none">
            Agapay Map
          </h3>
          <p className="text-slate-500 font-bold text-xs mt-2 italic">
            Connecting communities nationwide.
          </p>
        </div>

        <div className="absolute bottom-10 right-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-900/5 cursor-default group-hover:translate-x-[-10px] transition-transform">
          <MapPin className="w-3.5 h-3.5" />
          Select a Tenant
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {activeTenant ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
            {/* Logo or First Letter Fallback */}
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: activeTenant.brand_color
                  ? `${activeTenant.brand_color}15`
                  : "#ecfdf5",
                color: activeTenant.brand_color || "#059669",
              }}
            >
              {activeTenant.logo_url ? (
                <img
                  src={activeTenant.logo_url}
                  alt={activeTenant.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl font-black italic">
                  {activeTenant.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-3xl font-black italic text-slate-900 tracking-tight leading-tight">
                {activeTenant.name}
              </h4>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                {activeTenant.city}, {activeTenant.region}
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Actively serving members in the {activeTenant.region} region.
              Click below to visit their digital tenant dashboard.
            </p>
            <Link
              href={`/${activeTenant.slug}`}
              className="flex items-center justify-center gap-2 w-full py-4 text-white font-bold rounded-2xl transition-all group"
              style={{
                backgroundColor: activeTenant.brand_color || "#059669",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              Visit Tenant Homepage
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
            <div className="w-12 h-12 text-slate-300 mb-4">
              <MapPin className="w-full h-full" />
            </div>
            <p className="text-slate-400 font-bold italic">
              Select a tenant on the map to see details.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-2xl font-black text-emerald-600 italic">
              {activeTenant
                ? activeTenant.memberCount != null
                  ? activeTenant.memberCount.toLocaleString()
                  : "—"
                : "—"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Active Members
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-2xl font-black text-emerald-600 italic">
              {activeTenant && activeTenant.loansRepaid != null
                ? `₱${Number(activeTenant.loansRepaid).toLocaleString()}+`
                : "—"}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Loans Repaid
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
