"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvailableTenants } from "@/actions/identity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function BranchSwitcher() {
  const { data: session, update } = useSession();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      loadTenants();
    }
  }, [session?.user?.email]);

  async function loadTenants() {
    setLoading(true);
    const result = await getAvailableTenants(session?.user?.email!);
    if (result.success) {
      setTenants(result.tenants);
    }
    setLoading(false);
  }

  async function handleSwitch(tenantId: number) {
    if (tenantId === session?.user?.tenantId) return;

    setSwitching(tenantId);
    // Since Agapay members use the same password across branches,
    // we can re-authenticate to the new branch context.
    // Note: We'd typically need the password here.
    // For a seamless experience, we can redirect to a "Switch Login" page
    // or use a temporary "Switch Token".
    // FOR THIS VERSION: We will use the redirect method to the identity selection page.
    window.location.href = `/?switchFrom=${session?.user?.tenantId}&targetTo=${tenantId}&email=${session?.user?.email}`;
  }

  if (tenants.length <= 1 && !loading) return null;

  const currentTenant = tenants.find(
    (t) => t.tenant_id === session?.user?.tenantId,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
        >
          <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-600">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-0.5">
              Sanga
            </span>
            <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
              {currentTenant?.name || "Pumili ng Sanga"}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[240px] p-2 rounded-2xl shadow-xl border-slate-100"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Iyong mga Cooperatives
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          </div>
        ) : (
          tenants.map((t) => (
            <DropdownMenuItem
              key={t.tenant_id}
              onClick={() => handleSwitch(t.tenant_id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                t.tenant_id === session?.user?.tenantId
                  ? "bg-emerald-50 text-emerald-700"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold">{t.name}</span>
                <span className="text-[10px] text-slate-400">
                  {t.groupName}
                </span>
              </div>
              {t.tenant_id === session?.user?.tenantId && (
                <Check className="w-4 h-4" />
              )}
              {switching === t.tenant_id && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
