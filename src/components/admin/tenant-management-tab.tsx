"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Download,
  PowerOff,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { getTenants, decommissionBranch } from "@/actions/tenant-management";

export function TenantManagementTab({
  initialTenants,
}: {
  initialTenants: any[];
}) {
  const [tenants, setTenants] = useState(initialTenants);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDecommission = (tenantId: number, tenantName: string) => {
    if (
      !confirm(
        `EMERGENCY ACTION:\n\nAre you sure you want to decommission ${tenantName}? This will lock the branch and generate a full data snapshot.`,
      )
    )
      return;

    startTransition(async () => {
      setError(null);
      const res = await decommissionBranch(tenantId);

      if (res.success && res.data) {
        // Refresh local state
        setTenants((prev) =>
          prev.map((t) =>
            t.tenant_id === tenantId
              ? {
                  ...t,
                  is_active: false,
                  decommissioned_backups: [
                    res.data.backup,
                    ...t.decommissioned_backups,
                  ],
                }
              : t,
          ),
        );
      } else {
        setError(res.error || "Failed to decommission.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-red-50 p-6 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Danger Zone: Region Management
          </h3>
          <p className="text-sm text-red-700 mt-1">
            Actions taken here have system-wide consequences. Decommissioning a
            branch will freeze its operations and generate an emergency snapshot
            for safe data recovery.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((t) => (
          <Card
            key={t.tenant_id}
            className={`overflow-hidden transition-all ${!t.is_active ? "border-red-200 bg-red-50/30" : "border-slate-200"}`}
          >
            <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {t.name}
                  </CardTitle>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
                    {t.tenant_group?.name || "Unassigned Region"}
                  </span>
                </div>
                {t.is_active ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">
                    Suspended
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div className="bg-slate-100 rounded-lg p-2">
                  <span className="block text-xl font-black text-slate-800">
                    {t._count.users}
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 font-bold">
                    Members
                  </span>
                </div>
                <div className="bg-slate-100 rounded-lg p-2">
                  <span className="block text-xl font-black text-slate-800">
                    {t._count.loans}
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 font-bold">
                    Loans
                  </span>
                </div>
                <div className="bg-slate-100 rounded-lg p-2">
                  <span className="block text-xl font-black text-slate-800">
                    {t._count.savings}
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 font-bold">
                    Savings
                  </span>
                </div>
              </div>

              {t.is_active ? (
                <Button
                  variant="destructive"
                  className="w-full text-xs font-bold"
                  onClick={() => handleDecommission(t.tenant_id, t.name)}
                  disabled={isPending || t.slug === "main-branch"}
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  {t.slug === "main-branch"
                    ? "Cannot Suspend HQ"
                    : "Decommission Branch"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-600 font-medium">
                    This branch was decommissioned due to emergency protocols.
                    Operations are locked.
                  </div>
                  {t.decommissioned_backups &&
                    t.decommissioned_backups.length > 0 && (
                      <a
                        href={t.decommissioned_backups[0].file_url}
                        download
                        className="flex items-center justify-center w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" /> Download Snapshot
                      </a>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
