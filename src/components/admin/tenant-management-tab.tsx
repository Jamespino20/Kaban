"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  Download,
  PowerOff,
  ShieldAlert,
  CheckCircle,
  Plus,
  RotateCcw,
  ExternalLink,
  Upload,
} from "lucide-react";
import {
  getRegions,
  getTenantsByRegion,
  decommissionTenant,
  renameTenant,
  updateTenantEntitlement,
  restoreTenant,
} from "@/actions/tenant-management";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateRegionForm } from "./create-region-form";
import { CreateTenantForm } from "./create-tenant-form";

export function TenantManagementTab({
  initialTenants,
  role,
}: {
  initialTenants: any[];
  role: string;
}) {
  const [tenants, setTenants] = useState(initialTenants);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortByRegion, setSortByRegion] = useState(true);

  const filteredTenants = tenants.filter((t: any) => {
    const searchString =
      `${t.name} ${t.tenant_group?.name || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active")
      return matchesSearch && t.is_active && t.entitlement_status === "active";
    if (statusFilter === "suspended")
      return (
        matchesSearch && (!t.is_active || t.entitlement_status === "suspended")
      );
    if (statusFilter === "prospect")
      return matchesSearch && t.entitlement_status === "prospect";

    return matchesSearch;
  });

  const groupedByRegion = sortByRegion
    ? filteredTenants.reduce(
        (acc: Record<string, any[]>, t: any) => {
          const region = t.tenant_group?.name || "Unassigned";
          if (!acc[region]) acc[region] = [];
          acc[region].push(t);
          return acc;
        },
        {} as Record<string, any[]>,
      )
    : { "All Tenants": filteredTenants };

  if (sortByRegion) {
    Object.keys(groupedByRegion).forEach((region) => {
      groupedByRegion[region].sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      );
    });
  }

  const handleDecommission = (tenantId: number, tenantName: string) => {
    if (
      !confirm(
        `EMERGENCY ACTION:\n\nAre you sure you want to decommission ${tenantName}? This will lock the tenant and generate a full data snapshot.`,
      )
    )
      return;

    startTransition(async () => {
      setError(null);
      const res = await decommissionTenant(tenantId);

      if (res.success && res.data) {
        // Refresh local state
        setTenants((prev) =>
          prev.map((t: any) =>
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

  const handleRename = (tenantId: number, currentName: string) => {
    const nextName = window.prompt(
      "Ilagay ang bagong company o tenant name:",
      currentName,
    );

    if (!nextName || nextName.trim() === currentName.trim()) return;

    startTransition(async () => {
      setError(null);
      const res = await renameTenant({
        tenantId,
        name: nextName.trim(),
      });

      if (res.success && res.data) {
        setTenants((prev) =>
          prev.map((tenant: any) =>
            tenant.tenant_id === tenantId
              ? { ...tenant, name: res.data.name }
              : tenant,
          ),
        );
      } else {
        setError(res.error || "Failed to rename tenant.");
      }
    });
  };

  const handleEntitlementUpdate = (
    tenantId: number,
    currentStatus: "prospect" | "active" | "suspended",
  ) => {
    const nextStatus =
      currentStatus === "active"
        ? "suspended"
        : currentStatus === "suspended"
          ? "active"
          : "active";
    const reference = window.prompt(
      "Payment reference / manual receipt reference (optional):",
      "",
    );
    const notes = window.prompt("Access notes (optional):", "");

    startTransition(async () => {
      setError(null);
      const res = await updateTenantEntitlement({
        tenantId,
        entitlementStatus: nextStatus,
        entitlementReference: reference || "",
        entitlementNotes: notes || "",
      });

      if (res.success && res.data) {
        setTenants((prev) =>
          prev.map((tenant: any) =>
            tenant.tenant_id === tenantId
              ? {
                  ...tenant,
                  entitlement_status: res.data.entitlement_status,
                  entitlement_reference: res.data.entitlement_reference,
                  entitlement_notes: res.data.entitlement_notes,
                  lifetime_availed_at: res.data.lifetime_availed_at,
                }
              : tenant,
          ),
        );
      } else {
        setError(res.error || "Failed to update tenant access.");
      }
    });
  };

  const handleRestore = (tenantId: number, tenantName: string) => {
    if (!confirm(`Are you sure you want to RESTORE ${tenantName}?`)) return;

    startTransition(async () => {
      setError(null);
      const res = await restoreTenant(tenantId);

      if (res.success && res.data) {
        setTenants((prev) =>
          prev.map((t: any) =>
            t.tenant_id === tenantId ? { ...t, is_active: true } : t,
          ),
        );
      } else {
        setError(res.error || "Failed to restore tenant.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-red-50 p-6 rounded-2xl border border-red-100">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Danger Zone: Pamamahala ng
            Rehiyon
          </h3>
          <p className="text-sm text-red-700 mt-1">
            Ang mga aksyong gagawin dito ay may mga kahihinatnan sa buong
            sistema. Ang pag-decommission ng isang sangay ay maghihinto sa mga
            operasyon nito at bubuo ng isang emergency snapshot.
          </p>
        </div>
        {role === "superadmin" && (
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Region
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Region (Tenant Group)</DialogTitle>
                </DialogHeader>
                <CreateRegionForm onOpenChange={() => {}} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl">
                <DialogHeader>
                  <DialogTitle>Create New Tenant (Tenant)</DialogTitle>
                </DialogHeader>
                <CreateTenantForm onOpenChange={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Global Management Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/70 backdrop-blur-md p-4 rounded-[1.25rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tenant by company name or region..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="sm:w-48">
            <select
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">🌐 All Operations</option>
              <option value="active">🟢 Active Tokens</option>
              <option value="suspended">🔴 Locked / Suspended</option>
              <option value="prospect">🟡 Prospects (In-Review)</option>
            </select>
          </div>
          <button
            onClick={() => setSortByRegion((v) => !v)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              sortByRegion
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {sortByRegion ? "Sorted by Region" : "Sort by Name"}
          </button>
        </div>
      </div>

      {Object.entries(groupedByRegion).length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 border border-slate-100 rounded-3xl">
          <p className="text-slate-500 font-medium">
            No tenants found matching your criteria.
          </p>
        </div>
      ) : (
        Object.entries(groupedByRegion).map(([region, regionTenants]) => (
          <div key={region} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <h3 className="text-lg font-display font-bold text-slate-900">
                {region}
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                {regionTenants.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(regionTenants as any[]).map((t: any) => (
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
                        <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Access: {t.entitlement_status}
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
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
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
                          {t.entitlement_status === "active"
                            ? "Active"
                            : t.entitlement_status === "suspended"
                              ? "Suspended"
                              : "Prospect"}
                        </span>
                        <span className="text-[10px] uppercase text-slate-500 font-bold">
                          Status
                        </span>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-2">
                        <span className="block text-xl font-black text-slate-800">
                          {t._count.system_files || 0}
                        </span>
                        <span className="text-[10px] uppercase text-slate-500 font-bold">
                          Files
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2 text-xs text-slate-500">
                      {t.updated_at ? (
                        <p>
                          Last activity:{" "}
                          <span className="font-semibold text-slate-700">
                            {new Date(t.updated_at).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </p>
                      ) : null}
                      {t.is_active ? (
                        <p className="text-emerald-700 font-semibold">
                          System online
                        </p>
                      ) : (
                        <p className="text-red-600 font-semibold">
                          System offline
                        </p>
                      )}
                      {t.tenant_group?.reg_code ? (
                        <p>
                          Reg Code:{" "}
                          <span className="font-semibold text-slate-700">
                            {t.tenant_group.reg_code}
                          </span>
                        </p>
                      ) : null}
                      {t.entitlement_reference ? (
                        <p>
                          Reference:{" "}
                          <span className="font-semibold text-slate-700">
                            {t.entitlement_reference}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    {t.is_active ? (
                      <div className="space-y-2">
                        {role === "superadmin" && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="text-xs font-bold"
                              onClick={() => handleRename(t.tenant_id, t.name)}
                              disabled={isPending}
                            >
                              Rename
                            </Button>
                            <Button
                              className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={() =>
                                handleEntitlementUpdate(
                                  t.tenant_id,
                                  t.entitlement_status,
                                )
                              }
                              disabled={isPending}
                            >
                              {t.entitlement_status === "active"
                                ? "Suspend Access"
                                : "Mark Availed"}
                            </Button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button
                            variant="destructive"
                            className="text-xs font-bold"
                            onClick={() =>
                              handleDecommission(t.tenant_id, t.name)
                            }
                            disabled={isPending || t.slug === "main-tenant"}
                          >
                            <PowerOff className="w-4 h-4 mr-2" />
                            {t.slug === "main-tenant" ? "HQ" : "Suspend"}
                          </Button>
                          <a
                            href={`/${t.slug}?preview=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ variant: "secondary" }),
                              "text-xs font-bold",
                            )}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" /> View
                            Homepage
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-600 font-medium">
                          This tenant was decommissioned. Operations are locked.
                        </div>
                        {t.decommissioned_backups &&
                          t.decommissioned_backups.length > 0 && (
                            <a
                              href={`/api/admin/backups/${t.decommissioned_backups[0].id}`}
                              className="flex items-center justify-center w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" /> Download
                              Snapshot
                            </a>
                          )}
                        <label className="flex items-center justify-center w-full py-2.5 px-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept=".csv,.json"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              toast.info(
                                `Backup file "${file.name}" selected. Upload and restore coming soon.`,
                              );
                              e.target.value = "";
                            }}
                          />
                          <Upload className="w-4 h-4 mr-2" /> Upload Backup to
                          Restore
                        </label>
                        <Button
                          variant="outline"
                          className="w-full text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleRestore(t.tenant_id, t.name)}
                          disabled={isPending}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" /> Restore Tenant
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
