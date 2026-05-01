"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const accessibleTenantIds = session?.user?.accessibleTenantIds || [];
  const isSuperadmin = session?.user?.role === "superadmin";

  useEffect(() => {
    if (
      session?.user?.email &&
      (isSuperadmin || accessibleTenantIds.length > 1)
    ) {
      loadTenants();
    }
  }, [session?.user?.email, accessibleTenantIds.length, isSuperadmin]);

  async function loadTenants() {
    setLoading(true);
    const result = await getAvailableTenants(session?.user?.email || "");
    if (result.success) {
      const nextTenants = isSuperadmin
        ? [
            {
              tenant_id: null,
              name: "Global View",
              groupName: "Superadmin Scope",
              slug: "global",
              role: "superadmin",
            },
            ...result.tenants.filter((tenant: any) => tenant.tenant_id),
          ]
        : result.tenants.filter((tenant: any) =>
            accessibleTenantIds.includes(tenant.tenant_id),
          );

      setTenants(nextTenants);
    }
    setLoading(false);
  }

  async function handleSwitch(tenantId: number | null) {
    if (tenantId === session?.user?.tenantId) return;
    if (
      !isSuperadmin &&
      tenantId !== null &&
      !accessibleTenantIds.includes(tenantId)
    )
      return;

    setSwitching(tenantId);

    // Utilize NextAuth seamless token update mechanism built into auth.config.ts
    await update({
      action: "switch_tenant",
      tenantId: tenantId === null ? "global" : tenantId.toString(),
    });

    // Force a hard reload to ensure layout/providers catch the new tenant context.
    // Determine the correct dashboard based on role to prevent members from hitting the admin dashboard.
    const role = session?.user?.role;
    const targetPath = role === "member" ? "/agapay-pintig" : "/agapay-tanaw";
    window.location.href = targetPath;
  }

  if (!isSuperadmin && accessibleTenantIds.length <= 1 && !loading) return null;

  const currentTenant = tenants.find(
    (t) => t.tenant_id === session?.user?.tenantId,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 px-3 rounded-xl border border-transparent transition-colors hover:border-primary/15 hover:bg-primary/8"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="mb-0.5 text-[10px] font-bold uppercase tracking-widest leading-none text-primary">
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
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          tenants.map((t: any) => (
            <DropdownMenuItem
              key={t.tenant_id ?? "global"}
              onClick={() => handleSwitch(t.tenant_id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                t.tenant_id === session?.user?.tenantId
                  ? "bg-primary/10 text-primary"
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
