"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Building2, Check, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getAvailableTenants } from "@/actions/identity";
import { toast } from "sonner";

export function BranchSelector({ currentBranch }: { currentBranch: string }) {
  const { data: session, update } = useSession();
  const [tenants, setTenants] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.username) {
      setIsLoading(true);
      getAvailableTenants(session.user.username)
        .then((res: any) => {
          if (res.tenants) {
            setTenants(res.tenants);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [session?.user?.username]);

  const handleSwitch = (tenantId: number | null, slug: string) => {
    if (slug === currentBranch) return;

    startTransition(async () => {
      try {
        const result = await update({
          action: "switch_tenant",
          tenantId: tenantId ? tenantId.toString() : "global",
        });

        if (result) {
          toast.success(`Switched to ${slug}`);
          // Redirect to the new branch dashboard
          const role = session?.user?.role;
          const targetPath =
            role === "member" ? "agapay-pintig" : "agapay-tanaw";
          window.location.href = `/${slug}/${targetPath}`;
        }
      } catch (error) {
        toast.error("Failed to switch branch.");
      }
    });
  };

  const currentTenantName =
    tenants.find((t) => t.slug === currentBranch)?.name || currentBranch;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 bg-white shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-all group"
          disabled={isPending}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate">
            {currentTenantName}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px] p-2 rounded-2xl shadow-xl border-slate-100"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">
          Available Branches
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCcw className="h-5 w-5 animate-spin opacity-50" />
            <span className="text-xs font-medium">Loading branches...</span>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto py-1 space-y-1">
            {tenants.map((t) => (
              <DropdownMenuItem
                key={t.tenant_id || "global"}
                onClick={() => handleSwitch(t.tenant_id, t.slug)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  t.slug === currentBranch
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold truncate max-w-[160px]">
                    {t.name}
                  </span>
                  <span className="text-[10px] opacity-70 truncate max-w-[160px]">
                    {t.groupName}
                  </span>
                </div>
                {t.slug === currentBranch && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
