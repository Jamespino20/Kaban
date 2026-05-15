"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, X, Loader2, LayoutDashboard, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { updateSubscriptionPlan } from "@/actions/subscription-actions";

type Plan = {
  id: number;
  tier_name: string;
  features: string[];
  is_active: boolean;
};

const AVAILABLE_MODULES = [
  { id: "overview", label: "Pangkalahatan", description: "General Dashboard & Analytics" },
  { id: "approvals", label: "Mga Pag-apruba", description: "Verification Queue" },
  { id: "members", label: "Mga Miyembro", description: "Member Directory" },
  { id: "products", label: "Produkto ng Loan", description: "Loan Product Settings" },
  { id: "branches", label: "Branch Ops", description: "Tenant/Branch Operations" },
  { id: "settings", label: "Settings", description: "Account & Branch Settings" },
  { id: "audit", label: "Audit Logs", description: "Activity History" },
];

export function DashboardBuilderTab({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [savingId, setSavingId] = useState<number | null>(null);

  const toggleFeature = async (planId: number, featureId: string, currentFeatures: string[]) => {
    setSavingId(planId);
    try {
      const newFeatures = currentFeatures.includes(featureId)
        ? currentFeatures.filter((f) => f !== featureId)
        : [...currentFeatures, featureId];

      const res = await updateSubscriptionPlan(planId, {
        features: newFeatures,
      });

      if (res.success && res.plan) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, features: newFeatures } : p))
        );
        toast.success(`${featureId} module status updated for ${res.plan.tier_name}.`);
      } else {
        toast.error((res.error || "Failed to update plan.") + " Please refresh and try again.");
      }
    } catch {
      toast.error("System error updating plan. Please try again or contact support.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-emerald-600" />
          Dashboard Builder
        </h2>
        <p className="text-sm text-slate-500">
          Configure which modules are visible in the Agapay Tanaw command center for each subscription plan.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-700 w-1/3">Module / Tab</th>
              {plans.map(plan => (
                <th key={plan.id} className="text-center px-4 py-3 font-semibold text-slate-700">
                  {plan.tier_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AVAILABLE_MODULES.map((module) => (
              <tr key={module.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-900">{module.label}</div>
                  <div className="text-xs text-slate-500">{module.description}</div>
                </td>
                {plans.map(plan => {
                  const isEnabled = (plan.features || []).includes(module.id);
                  const isSaving = savingId === plan.id;
                  return (
                    <td key={plan.id} className="px-4 py-4 text-center">
                      <Button
                        variant={isEnabled ? "default" : "outline"}
                        size="sm"
                        disabled={isSaving}
                        className={`h-8 w-8 p-0 rounded-full ${isEnabled ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm shadow-emerald-500/20" : "text-slate-300 border-slate-200 hover:text-slate-500 hover:bg-slate-50"}`}
                        onClick={() => toggleFeature(plan.id, module.id, plan.features || [])}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        ) : isEnabled ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
