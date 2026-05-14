"use client";

import { useState, useMemo } from "react";
import { Search, Building2, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface PublicTenantSelectorProps {
  tenants?: Tenant[];
  isScrolled?: boolean;
  isMobile?: boolean;
  triggerClassName?: string;
  style?: React.CSSProperties;
}

const PLATFORM_DOMAIN = "agapay-saas.vercel.app";

function getTenantPublicHref(slug: string) {
  if (process.env.NODE_ENV === "production") {
    return `https://${slug}.${PLATFORM_DOMAIN}`;
  }

  return `/${slug}`;
}

function getTenantAddressLabel(slug: string) {
  if (process.env.NODE_ENV === "production") {
    return `${slug}.${PLATFORM_DOMAIN}`;
  }

  return `/${slug}`;
}

export function PublicTenantSelector({
  tenants: initialTenants = [],
  isScrolled,
  isMobile,
  triggerClassName,
  style,
}: PublicTenantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenants = useMemo(() => {
    return initialTenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [initialTenants, searchQuery]);

  const triggerClasses = triggerClassName
    ? triggerClassName
    : isMobile
      ? "w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-slate-900 font-black italic text-lg outline-none"
      : `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm outline-none ${
          isScrolled
            ? "text-slate-700 hover:bg-slate-100"
            : "text-white/90 hover:bg-white/10"
        }`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClasses} style={style}>
        <div className="flex items-center gap-2 text-left">
          <MapPin className="w-4 h-4" />
          <span>Find Cooperative</span>
        </div>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? "center" : "end"}
        className="w-[300px] p-2 rounded-3xl border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 z-[60]"
      >
        <DropdownMenuLabel className="px-3 pt-3 pb-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
            Active Tenants
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tenant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-none rounded-2xl focus-visible:ring-emerald-500/20"
            />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-2 bg-slate-100" />
        <div className="max-h-[300px] overflow-y-auto py-1 scrollbar-hide">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <DropdownMenuItem key={tenant.id} asChild className="p-0">
                <Link
                  href={getTenantPublicHref(tenant.slug)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-emerald-50 rounded-2xl transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 transition-colors"
                    style={{
                      backgroundColor: tenant.color
                        ? `${tenant.color}15`
                        : "#ECFDF5",
                    }}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {tenant.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {getTenantAddressLabel(tenant.slug)}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs font-bold text-slate-400 italic">
                {initialTenants.length === 0
                  ? "Loading tenants..."
                  : "No tenants found"}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
