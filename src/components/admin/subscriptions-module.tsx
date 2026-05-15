"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Save, X, Loader2, CreditCard, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { updateSubscriptionPlan, updateTenantSubscription } from "@/actions/subscription-actions";

type Plan = {
  id: number;
  tier_name: string;
  price_monthly: any;
  price_quarterly: any;
  price_semi_annually: any;
  price_annually: any;
  max_members: number;
  max_storage_mb: number;
  features: string[];
  is_active: boolean;
  is_addon: boolean;
};

const DOWNPAYMENT_RULES: Record<string, { pct: number; label: string }> = {
  "Agapay Core": { pct: 0, label: "None" },
  "Agapay Pro": { pct: 30, label: "30%" },
  "Agapay Enterprise": { pct: 50, label: "50%" },
};

function getDownpaymentInfo(plan: Plan) {
  const rule = DOWNPAYMENT_RULES[plan.tier_name];
  if (!rule || rule.pct === 0) return null;
  const basePrice =
    Number(plan.price_semi_annually || plan.price_quarterly || plan.price_monthly || 0);
  const amount = Math.round((basePrice * rule.pct) / 100);
  return { pct: rule.pct, label: rule.label, amount };
}

type TenantSub = {
  tenant_id: number;
  name: string;
  slug: string;
  entitlement_status: string;
  tenantSubscription: {
    status: string;
    billing_cycle: string;
    start_date: Date;
    end_date: Date | null;
    plan: { id: number; tier_name: string } | null;
  } | null;
};

interface Props {
  initialPlans: Plan[];
  initialTenants: TenantSub[];
}

export function SubscriptionsModule({ initialPlans, initialTenants }: Props) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [tenants, setTenants] = useState<TenantSub[]>(initialTenants);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan> | null>(null);
  const [editingTenantId, setEditingTenantId] = useState<number | null>(null);
  const [editingTenantForm, setEditingTenantForm] = useState<{ status: string; billing_cycle: string; plan_id: number } | null>(null);
  const [savingTenantId, setSavingTenantId] = useState<number | null>(null);

  const saveTenantSub = useCallback(async (tenantId: number) => {
    if (!editingTenantForm) return;
    setSavingTenantId(tenantId);
    try {
      const res = await updateTenantSubscription(tenantId, {
        status: editingTenantForm.status,
        billing_cycle: editingTenantForm.billing_cycle,
        plan_id: editingTenantForm.plan_id,
      });
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) =>
            t.tenant_id === tenantId
              ? {
                  ...t,
                  entitlement_status: editingTenantForm.status,
                  tenantSubscription: t.tenantSubscription
                    ? { ...t.tenantSubscription, status: editingTenantForm.status, billing_cycle: editingTenantForm.billing_cycle }
                    : null,
                }
              : t,
          ),
        );
        toast.success("Tenant subscription updated.");
        setEditingTenantId(null);
        setEditingTenantForm(null);
      } else {
        toast.error((res.error || "Failed to update subscription.") + " Please refresh and try again.");
      }
    } catch {
      toast.error("System error updating subscription. Please try again or contact support.");
    } finally {
      setSavingTenantId(null);
    }
  }, [editingTenantForm]);

  const startEdit = useCallback((plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({
      price_monthly: Number(plan.price_monthly),
      price_quarterly: Number(plan.price_quarterly || 0),
      price_semi_annually: Number(plan.price_semi_annually || 0),
      price_annually: Number(plan.price_annually),
      max_members: plan.max_members,
      max_storage_mb: plan.max_storage_mb,
      features: [...plan.features],
      is_active: plan.is_active,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm(null);
  }, []);

  const savePlan = useCallback(async (planId: number) => {
    if (!editForm) return;
    setSavingId(planId);
    try {
      const res = await updateSubscriptionPlan(planId, {
        price_monthly: Number(editForm.price_monthly),
        price_quarterly: Number(editForm.price_quarterly ?? 0),
        price_semi_annually: Number(editForm.price_semi_annually ?? 0),
        price_annually: Number(editForm.price_annually),
        max_members: Number(editForm.max_members),
        max_storage_mb: Number(editForm.max_storage_mb),
        features: editForm.features?.filter((f) => f.trim() !== "") || [],
        is_active: editForm.is_active,
      });
      if (res.success && res.plan) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  ...res.plan,
                  price_monthly: Number(res.plan.price_monthly),
                  price_quarterly: Number(res.plan.price_quarterly || 0),
                  price_semi_annually: Number(res.plan.price_semi_annually || 0),
                  price_annually: Number(res.plan.price_annually),
                }
              : p,
          ),
        );
        toast.success("Plan updated successfully.");
        setEditingId(null);
        setEditForm(null);
      } else {
        toast.error(res.error || "Failed to update plan.");
      }
    } catch {
      toast.error("System error updating plan.");
    } finally {
      setSavingId(null);
    }
  }, [editForm]);

  const addFeature = useCallback(() => {
    setEditForm((prev) =>
      prev ? { ...prev, features: [...(prev.features || []), ""] } : prev,
    );
  }, []);

  const updateFeature = useCallback((index: number, value: string) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const features = [...(prev.features || [])];
      features[index] = value;
      return { ...prev, features };
    });
  }, []);

  const removeFeature = useCallback((index: number) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const features = prev.features?.filter((_, i) => i !== index) || [];
      return { ...prev, features };
    });
  }, []);

  return (
    <div className="w-full max-w-6xl rounded-[1.75rem] border border-emerald-100 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-emerald-600" />
          Subscriptions
        </h2>
        <p className="text-sm text-slate-500">
          Manage subscription plans and view all tenant subscribers.
        </p>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="outline-none">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Plan Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Monthly</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Quarterly</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Semi-Annual</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Annual</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Max Members</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Storage (MB)</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Downpayment</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Features</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Active</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => {
                  const isEditing = editingId === plan.id;
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {plan.tier_name}
                        {plan.is_addon && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                            Add-on
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-24 text-sm"
                            value={editForm?.price_monthly ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, price_monthly: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>₱{Number(plan.price_monthly).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-24 text-sm"
                            value={editForm?.price_quarterly ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, price_quarterly: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>₱{Number(plan.price_quarterly || 0).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-24 text-sm"
                            value={editForm?.price_semi_annually ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, price_semi_annually: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>₱{Number(plan.price_semi_annually || 0).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-24 text-sm"
                            value={editForm?.price_annually ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, price_annually: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>₱{Number(plan.price_annually).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-20 text-sm"
                            value={editForm?.max_members ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, max_members: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>{plan.max_members}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            className="h-8 w-20 text-sm"
                            value={editForm?.max_storage_mb ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, max_storage_mb: Number(e.target.value) } : prev,
                              )
                            }
                          />
                        ) : (
                          <span>{plan.max_storage_mb.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
                          const dp = getDownpaymentInfo(plan);
                          return dp ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-emerald-700">{dp.label}</span>
                              <span className="text-xs text-slate-500">₱{dp.amount.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">None</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-1">
                            {editForm?.features?.map((f, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <Input
                                  className="h-7 text-xs flex-1"
                                  value={f}
                                  onChange={(e) => updateFeature(i, e.target.value)}
                                />
                                <button
                                  type="button"
                                  className="text-red-400 hover:text-red-600 shrink-0"
                                  onClick={() => removeFeature(i)}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs mt-1"
                              onClick={addFeature}
                            >
                              + Add feature
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {plan.features.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">
                                {f}
                              </Badge>
                            ))}
                            {plan.features.length === 0 && (
                              <span className="text-slate-400 text-xs italic">None</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Switch
                            checked={editForm?.is_active ?? true}
                            onCheckedChange={(checked) =>
                              setEditForm((prev) =>
                                prev ? { ...prev, is_active: checked } : prev,
                              )
                            }
                          />
                        ) : (
                          <Badge
                            variant={plan.is_active ? "default" : "outline"}
                            className={
                              plan.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "text-slate-400"
                            }
                          >
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={savingId === plan.id}
                              onClick={() => savePlan(plan.id)}
                            >
                              {savingId === plan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => startEdit(plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="outline-none">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tenant Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Billing Cycle</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Start Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">End Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Entitlement</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((tenant) => {
                  const isEditing = editingTenantId === tenant.tenant_id;
                  const sub = tenant.tenantSubscription;
                  const getStatusBadge = (status: string | undefined) => {
                    if (!status) return { label: "No Subscription", variant: "outline" as const, className: "text-slate-400" };
                    switch (status) {
                      case "active":
                        return { label: "Active", variant: "default" as const, className: "bg-emerald-100 text-emerald-800" };
                      case "canceled":
                        return { label: "Cancelled", variant: "outline" as const, className: "text-red-500 border-red-200" };
                      case "expired":
                        return { label: "Expired", variant: "outline" as const, className: "text-amber-600 border-amber-200" };
                      case "pending":
                        return { label: "Pending", variant: "outline" as const, className: "text-amber-600 border-amber-200" };
                      default:
                        return { label: status, variant: "outline" as const, className: "" };
                    }
                  };
                  const badge = getStatusBadge(sub?.status);
                  const getEntitlementBadge = (status: string) => {
                    switch (status) {
                      case "active":
                        return { label: "Active", className: "bg-emerald-100 text-emerald-800" };
                      case "availed":
                        return { label: "Availed", className: "bg-blue-100 text-blue-800" };
                      case "prospect":
                        return { label: "Prospect", className: "bg-slate-100 text-slate-500" };
                      default:
                        return { label: status, className: "" };
                    }
                  };
                  const entBadge = getEntitlementBadge(tenant.entitlement_status);
                  return (
                    <tr key={tenant.tenant_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{tenant.name}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {isEditing ? (
                          <select
                            className="h-8 text-xs rounded border border-input px-2"
                            value={editingTenantForm?.plan_id ?? sub?.plan?.id ?? ""}
                            onChange={(e) =>
                              setEditingTenantForm((prev) =>
                                prev ? { ...prev, plan_id: Number(e.target.value) } : null,
                              )
                            }
                          >
                            {plans.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.tier_name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          sub?.plan?.tier_name || <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {isEditing ? (
                          <select
                            className="h-8 text-xs rounded border border-input px-2"
                            value={editingTenantForm?.billing_cycle ?? sub?.billing_cycle ?? "monthly"}
                            onChange={(e) =>
                              setEditingTenantForm((prev) =>
                                prev ? { ...prev, billing_cycle: e.target.value } : null,
                              )
                            }
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="semi_annually">Semi-Annually</option>
                            <option value="annually">Annually</option>
                          </select>
                        ) : (
                          sub?.billing_cycle || <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            className="h-8 text-xs rounded border border-input px-2"
                            value={editingTenantForm?.status ?? sub?.status ?? "pending"}
                            onChange={(e) =>
                              setEditingTenantForm((prev) =>
                                prev ? { ...prev, status: e.target.value } : null,
                              )
                            }
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="canceled">Canceled</option>
                            <option value="expired">Expired</option>
                          </select>
                        ) : (
                          <Badge variant={badge.variant} className={badge.className}>
                            {badge.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sub?.start_date
                          ? new Date(sub.start_date).toLocaleDateString()
                          : <span className="text-slate-400 italic">N/A</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sub?.end_date
                          ? new Date(sub.end_date).toLocaleDateString()
                          : <span className="text-slate-400 italic">N/A</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={entBadge.className}>
                          {entBadge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-7 w-7 p-0"
                              disabled={savingTenantId === tenant.tenant_id}
                              onClick={() => saveTenantSub(tenant.tenant_id)}
                            >
                              {savingTenantId === tenant.tenant_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => { setEditingTenantId(null); setEditingTenantForm(null); }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditingTenantId(tenant.tenant_id);
                              setEditingTenantForm({
                                status: sub?.status || "pending",
                                billing_cycle: sub?.billing_cycle || "monthly",
                                plan_id: sub?.plan?.id || plans[0]?.id || 0,
                              });
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
