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
  updateTenantFeatures,
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
  const [editingFeatures, setEditingFeatures] = useState<{
    tenantId: number;
    tenantName: string;
    features: string[];
  } | null>(null);
  const [renamingTenant, setRenamingTenant] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [updatingEntitlement, setUpdatingEntitlement] = useState<{
    id: number;
    status: "prospect" | "active" | "suspended";
    name: string;
  } | null>(null);
  const [entitlementForm, setEntitlementForm] = useState({
    reference: "",
    notes: "",
  });

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
        toast.success(`${tenantName} decommissioned. Snapshot saved.`);
        // Refresh local state
          setTenants((prev) =>
            prev.map((t: any) =>
              t.tenant_id === tenantId
                ? {
                    ...t,
                    is_active: false,
                    entitlement_status: "suspended",
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
    setRenamingTenant({ id: tenantId, name: currentName });
  };

  const executeRename = (newName: string) => {
    if (!renamingTenant || !newName || newName.trim() === renamingTenant.name.trim()) {
      setRenamingTenant(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      const res = await renameTenant({
        tenantId: renamingTenant.id,
        name: newName.trim(),
      });

      if (res.success && res.data) {
        toast.success(`Tenant renamed to "${res.data.name}".`);
        setTenants((prev) =>
          prev.map((tenant: any) =>
            tenant.tenant_id === renamingTenant.id
              ? { ...tenant, name: res.data.name }
              : tenant,
          ),
        );
        setRenamingTenant(null);
      } else {
        setError(res.error || "Failed to rename tenant.");
      }
    });
  };

  const handleEntitlementUpdate = (
    tenantId: number,
    currentStatus: "prospect" | "active" | "suspended",
    tenantName: string,
  ) => {
    setUpdatingEntitlement({ id: tenantId, status: currentStatus, name: tenantName });
    setEntitlementForm({ reference: "", notes: "" });
  };

  const executeEntitlementUpdate = () => {
    if (!updatingEntitlement) return;

    const nextStatus =
      updatingEntitlement.status === "active"
        ? "suspended"
        : "active";

    startTransition(async () => {
      setError(null);
      const res = await updateTenantEntitlement({
        tenantId: updatingEntitlement.id,
        entitlementStatus: nextStatus,
        entitlementReference: entitlementForm.reference || "",
        entitlementNotes: entitlementForm.notes || "",
      });

      if (res.success && res.data) {
        toast.success(`Access updated for ${updatingEntitlement.name}`);
        setTenants((prev) =>
          prev.map((tenant: any) =>
            tenant.tenant_id === updatingEntitlement.id
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
        setUpdatingEntitlement(null);
      } else {
        setError(res.error || "Failed to update tenant access.");
      }
    });
  };

  const handleFeaturesSave = () => {
    if (!editingFeatures) return;

    startTransition(async () => {
      setError(null);
      const res = await updateTenantFeatures({
        tenantId: editingFeatures.tenantId,
        enabledFeatures: editingFeatures.features,
      });

      if (res.success && res.data) {
        setTenants((prev) =>
          prev.map((tenant: any) =>
            tenant.tenant_id === editingFeatures.tenantId
              ? {
                  ...tenant,
                  metadata: {
                    ...(tenant.metadata || {}),
                    enabledFeatures: editingFeatures.features,
                  },
                }
              : tenant,
          ),
        );
        setEditingFeatures(null);
        toast.success("Features updated successfully");
      } else {
        setError(res.error || "Failed to update tenant features.");
        toast.error("Failed to update features");
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
            t.tenant_id === tenantId
              ? { ...t, is_active: true, entitlement_status: "active" }
              : t,
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
              <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] overflow-hidden flex flex-col p-0">
                <div className="p-6 border-b border-slate-100 flex-shrink-0">
                  <DialogHeader>
                    <DialogTitle>Create New Tenant (Tenant)</DialogTitle>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 p-2 custom-scrollbar">
                  <CreateTenantForm onOpenChange={() => {}} />
                </div>
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
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              className="text-xs font-bold px-0"
                              onClick={() => handleRename(t.tenant_id, t.name)}
                              disabled={isPending}
                            >
                              Rename
                            </Button>
                            <Button
                              variant="outline"
                              className="text-xs font-bold px-0"
                              onClick={() =>
                                setEditingFeatures({
                                  tenantId: t.tenant_id,
                                  tenantName: t.name,
                                  features: t.metadata?.enabledFeatures || [],
                                })
                              }
                              disabled={isPending}
                            >
                              Features
                            </Button>
                            <Button
                              className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={() =>
                                handleEntitlementUpdate(
                                  t.tenant_id,
                                  t.entitlement_status,
                                  t.name,
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

      {/* Edit Features Dialog */}
      <Dialog
        open={!!editingFeatures}
        onOpenChange={(open) => !open && setEditingFeatures(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Features for {editingFeatures?.tenantName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { id: "loans", label: "Loaning Node", icon: "💰" },
                { id: "wallet", label: "E-Wallet", icon: "💳" },
                { id: "community", label: "Community", icon: "🤝" },
                { id: "branding", label: "Content/Branding", icon: "🎨" },
                { id: "reports", label: "Reports", icon: "📊" },
                { id: "audit", label: "Audit Logs", icon: "📋" },
                { id: "analytics", label: "Analytics", icon: "📈" },
                { id: "system_config", label: "System Config", icon: "⚙️" },
                { id: "compassion", label: "Compassion", icon: "❤️" },
              ].map((feat) => (
                <label
                  key={feat.id}
                  className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={editingFeatures?.features.includes(feat.id) || false}
                    onChange={(e) => {
                      if (!editingFeatures) return;
                      const current = editingFeatures.features;
                      if (e.target.checked) {
                        setEditingFeatures({
                          ...editingFeatures,
                          features: [...current, feat.id],
                        });
                      } else {
                        setEditingFeatures({
                          ...editingFeatures,
                          features: current.filter((id) => id !== feat.id),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-base">{feat.icon}</span>
                    <span className="text-[10px] font-bold text-slate-700">
                      {feat.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleFeaturesSave}
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
              >
                {isPending ? "Saving..." : "Save Features"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Tenant Dialog */}
      <Dialog
        open={!!renamingTenant}
        onOpenChange={(open) => !open && setRenamingTenant(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">New Company Name</label>
              <input
                type="text"
                defaultValue={renamingTenant?.name}
                id="new-tenant-name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setRenamingTenant(null)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById("new-tenant-name") as HTMLInputElement;
                  executeRename(input.value);
                }}
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold"
              >
                {isPending ? "Renaming..." : "Update Name"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entitlement Update Dialog */}
      <Dialog
        open={!!updatingEntitlement}
        onOpenChange={(open) => !open && setUpdatingEntitlement(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {updatingEntitlement?.status === "active" ? "Suspend Access" : "Activate Access"} for {updatingEntitlement?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Payment / Reference Code (Optional)</label>
              <input
                type="text"
                value={entitlementForm.reference}
                onChange={(e) => setEntitlementForm({ ...entitlementForm, reference: e.target.value })}
                placeholder="e.g. GCash-123456"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Internal Notes (Optional)</label>
              <textarea
                value={entitlementForm.notes}
                onChange={(e) => setEntitlementForm({ ...entitlementForm, notes: e.target.value })}
                placeholder="Notes about this access update..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setUpdatingEntitlement(null)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button
                onClick={executeEntitlementUpdate}
                disabled={isPending}
                className={cn(
                  "rounded-xl font-bold text-white",
                  updatingEntitlement?.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isPending ? "Updating..." : updatingEntitlement?.status === "active" ? "Suspend Access Now" : "Activate Access Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
