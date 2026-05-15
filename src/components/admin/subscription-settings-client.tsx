"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  requestSubscriptionUpgrade,
  renewSubscription,
} from "@/actions/subscription-actions";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
};

type CurrentSub = {
  status: string;
  billing_cycle: string;
  plan: Plan | null;
} | null;

interface Props {
  tenantId: number;
  availablePlans: Plan[];
  currentSubscription: CurrentSub;
  isAdmin: boolean;
  tenantSlug: string;
}

function getCyclePrice(plan: Plan, cycle: string) {
  switch (cycle) {
    case "quarterly":
      return Number(plan.price_quarterly || plan.price_monthly);
    case "semi_annually":
      return Number(plan.price_semi_annually || plan.price_monthly);
    case "annually":
      return Number(plan.price_annually || plan.price_monthly);
    default:
      return Number(plan.price_monthly);
  }
}

function getCycleLabel(cycle: string) {
  switch (cycle) {
    case "quarterly":
      return " / 3 mos";
    case "semi_annually":
      return " / 6 mos";
    case "annually":
      return " / year";
    default:
      return " / mo";
  }
}

export function SubscriptionSettingsClient({
  tenantId,
  availablePlans,
  currentSubscription,
  isAdmin,
  tenantSlug,
}: Props) {
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [renewing, setRenewing] = useState(false);
  const activeCycle = currentSubscription?.billing_cycle || "monthly";

  const handleRequestUpgrade = async (planId: number) => {
    setIsLoading(planId);
    try {
      const res = await requestSubscriptionUpgrade(
        planId,
        activeCycle as "monthly" | "quarterly" | "semi_annually" | "annually",
        tenantSlug,
      );
      if (res.success) {
        toast.success(
          "Your subscription upgrade request has been sent to Superadmins.",
        );
      } else {
        toast.error("Error: " + (res.error || "Failed to submit request.") + " Please refresh the page and try again, or contact support if the issue persists.");
      }
    } catch {
      toast.error(
        "System Error: Unable to process your request. Please try again or contact your Superadmin.",
      );
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full max-w-5xl rounded-[1.75rem] border border-emerald-100 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6 space-y-2">
        <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          SaaS Subscription Plan
        </h2>
        <p className="text-sm text-slate-500">
          Umanib sa Agapay o palawakin ang iyong cooperative limit sa aming
          Netflix-style SaaS tier.
        </p>
      </div>

      <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
          Kasalukuyang Plan
        </h3>
        {currentSubscription?.plan ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-slate-900">
                  {currentSubscription.plan.tier_name}
                </span>
                <Badge
                  variant={
                    currentSubscription.status === "pending"
                      ? "outline"
                      : "default"
                  }
                  className={
                    currentSubscription.status === "pending"
                      ? "text-amber-600 border-amber-300"
                      : "bg-emerald-100 text-emerald-800"
                  }
                >
                  {currentSubscription.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {currentSubscription.plan.max_members} Maximum members •{" "}
                {currentSubscription.billing_cycle} billing
              </p>
            </div>
            {currentSubscription.status === "pending" && (
              <div className="text-sm italic text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Awaiting Superadmin Approval
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-slate-700 font-medium font-sans">No Active Plan</p>
            <p className="text-xs text-slate-500 mt-1">
              Nasa Seed / Prospect level pa lamang ang iyong cooperative.
            </p>
          </div>
        )}
        {currentSubscription?.status === "active" ? null : (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                Your subscription requires renewal to continue using all features.
              </p>
            </div>
            <Button
              onClick={async () => {
                setRenewing(true);
                try {
                  const res = await renewSubscription(tenantId, "manual", activeCycle as any);
                  if (res.success) {
                    toast.success("Subscription renewed! Your access has been restored.");
                    window.location.reload();
                  } else {
                    toast.error((res.error || "Renewal failed") + ". Please check your payment method and try again.");
                  }
                } catch { toast.error("System error during renewal. Please try again or contact support."); }
                setRenewing(false);
              }}
              disabled={renewing}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              {renewing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Renew Now
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan?.id === plan.id;
          const price = getCyclePrice(plan, activeCycle);
          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                isCurrentPlan
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {plan.tier_name}
                </h4>
                <div className="my-4">
                  <span className="text-3xl font-black text-emerald-600">
                    ₱{price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500">
                    {getCycleLabel(activeCycle)}
                  </span>
                </div>
                <ul className="mb-6 space-y-3">
                  <li className="text-sm text-slate-600 flex items-start gap-2">
                    <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                    Hanggang {plan.max_members} Miymebro
                  </li>
                  <li className="text-sm text-slate-600 flex items-start gap-2">
                    <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                    {plan.max_storage_mb / 1000}GB Storage
                  </li>
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-600 flex items-start gap-2"
                    >
                      <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {isAdmin && (
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={
                    isCurrentPlan ||
                    isLoading !== null ||
                    currentSubscription?.status === "pending"
                  }
                  onClick={() => handleRequestUpgrade(plan.id)}
                >
                  {isLoading === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    currentSubscription?.status === "pending" ? (
                      "Pending Approval"
                    ) : (
                      "Current Plan"
                    )
                  ) : (
                    "Request Upgrade"
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
