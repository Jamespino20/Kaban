import { SubscriptionSettingsClient } from "./subscription-settings-client";
import {
  getAvailablePlans,
  getCurrentSubscription,
} from "@/actions/subscription-actions";
import { auth } from "@/lib/auth";

export async function SubscriptionSettings({
  tenantId,
  isAdmin,
  tenantSlug,
}: {
  tenantId: number;
  isAdmin: boolean;
  tenantSlug: string;
}) {
  const [plansRes, currentSubRes] = await Promise.all([
    getAvailablePlans(),
    getCurrentSubscription(tenantId),
  ]);

  const availablePlans = plansRes.success ? plansRes.plans || [] : [];

  // Transform the decimals to string/number if needed for Client Component serialization
  const serializedPlans = availablePlans.map((plan: any) => ({
    ...plan,
    price_monthly: Number(plan.price_monthly),
    price_quarterly: Number(plan.price_quarterly),
    price_semi_annually: Number(plan.price_semi_annually),
    price_annually: Number(plan.price_annually),
  }));

  const currentSub =
    currentSubRes.success && currentSubRes.subscription
      ? {
          status: currentSubRes.subscription.status,
          billing_cycle: currentSubRes.subscription.billing_cycle,
          plan: currentSubRes.subscription.plan
              ? {
                ...currentSubRes.subscription.plan,
                price_monthly: Number(
                  currentSubRes.subscription.plan.price_monthly,
                ),
                price_quarterly: Number(
                  currentSubRes.subscription.plan.price_quarterly,
                ),
                price_semi_annually: Number(
                  currentSubRes.subscription.plan.price_semi_annually,
                ),
                price_annually: Number(
                  currentSubRes.subscription.plan.price_annually,
                ),
              }
            : null,
        }
      : null;

  return (
    <SubscriptionSettingsClient
      tenantId={tenantId}
      isAdmin={isAdmin}
      availablePlans={serializedPlans}
      currentSubscription={currentSub}
      tenantSlug={tenantSlug}
    />
  );
}
