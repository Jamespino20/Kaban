"use server";

import prisma from "@/lib/prisma";
import { requireTanawSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import { serializeDecimal } from "@/lib/utils";

export async function getAvailablePlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price_monthly: "asc" },
    });
    return serializeDecimal({ success: true, plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return {
      success: false,
      error: "Tanging superadmins ang may access sa lahat ng plans",
    };
  }
}

export async function getCurrentSubscription(tenantId: number) {
  try {
    const sub = await prisma.tenantSubscription.findUnique({
      where: { tenant_id: tenantId },
      include: { plan: true },
    });
    return serializeDecimal({ success: true, subscription: sub });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return { success: false, error: "Failed to fetch subscription status." };
  }
}

export async function requestSubscriptionUpgrade(
  planId: number,
  billingCycle: "monthly" | "quarterly" | "semi_annually" | "annually",
  tenantSlug: string,
) {
  try {
    const session = await requireTanawSession();

    const isOperator = session.user.role === "operator";
    if (!isOperator && session.user.role !== "superadmin") {
      return {
        success: false,
        error: "Only tenant operators can request a subscription upgrade.",
      };
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return { success: false, error: "No active tenant context." };
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.is_active) {
      return { success: false, error: "Invalid or inactive plan selected." };
    }

    const sub = await prisma.tenantSubscription.upsert({
      where: { tenant_id: tenantId },
      update: {
        plan_id: planId,
        billing_cycle: billingCycle,
        status: "pending",
      },
      create: {
        tenant_id: tenantId,
        plan_id: planId,
        billing_cycle: billingCycle,
        status: "pending",
      },
    });

    revalidatePath(`/${tenantSlug}/agapay-tanaw`);
    return {
      success: true,
      subscription: sub,
      message:
        "Subscription request submitted successfully. Awaiting approval.",
    };
  } catch (error) {
    console.error("Failed to request upgrade:", error);
    return {
      success: false,
      error: "Naantala ang inyong kahilingan. Pakisubukan muli.",
    };
  }
}

export async function availLifetimeFranchise(
  tenantId: number,
  availedType: string,
) {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const tenant = await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: {
        entitlement_status: "availed",
        availed_type: availedType,
        lifetime_availed_at: new Date(),
      } as any,
      select: { slug: true },
    });

    revalidatePath(`/${tenant.slug}/agapay-tanaw`);
    return {
      success: true,
      message: `Tenant availed as ${availedType} lifetime franchise.`,
    };
  } catch (error) {
    console.error("Failed to avail lifetime franchise:", error);
    return { success: false, error: "Failed to process lifetime purchase." };
  }
}
export async function getAllSubscriptionPlans() {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price_monthly: "asc" },
    });
    return serializeDecimal({ success: true, plans });
  } catch (error) {
    console.error("Failed to fetch all plans:", error);
    return { success: false, error: "Failed to fetch subscription plans." };
  }
}

export async function updateSubscriptionPlan(
  planId: number,
  data: {
    tier_name?: string;
    price_monthly?: number;
    price_quarterly?: number;
    price_semi_annually?: number;
    price_annually?: number;
    max_members?: number;
    max_storage_mb?: number;
    features?: string[];
    is_active?: boolean;
  },
) {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...data,
        price_monthly:
          data.price_monthly !== undefined ? data.price_monthly : undefined,
        price_quarterly:
          data.price_quarterly !== undefined ? data.price_quarterly : undefined,
        price_semi_annually:
          data.price_semi_annually !== undefined
            ? data.price_semi_annually
            : undefined,
        price_annually:
          data.price_annually !== undefined ? data.price_annually : undefined,
      },
    });
    revalidatePath("/agapay-tanaw");
    return { success: true, plan };
  } catch (error) {
    console.error("Failed to update plan:", error);
    return { success: false, error: "Failed to update subscription plan." };
  }
}

export async function getAllTenantSubscriptions() {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: "asc" },
      include: {
        tenantSubscription: {
          include: { plan: true },
        },
      },
    });
    return serializeDecimal({ success: true, tenants });
  } catch (error) {
    console.error("Failed to fetch tenant subscriptions:", error);
    return { success: false, error: "Failed to fetch tenant subscriptions." };
  }
}

export async function approveSubscriptionUpgrade(tenantId: number) {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update subscription status
      const sub = await tx.tenantSubscription.update({
        where: { tenant_id: tenantId },
        data: { status: "active" }, // Change from verified/pending to active
        include: { plan: true },
      });

      // 2. Update tenant entitlement
      const tenant = await tx.tenant.update({
        where: { tenant_id: tenantId },
        data: {
          entitlement_status: "active",
          lifetime_availed_at: new Date(),
        },
      });

      // 3. Log Audit
      await tx.auditLog.create({
        data: {
          action: "APPROVE_SUBSCRIPTION",
          entity_type: "Tenant",
          entity_id: tenantId,
          user_id: session.user.user_id,
          new_values: {
            plan: sub.plan.tier_name,
            status: "active",
          } as any,
        },
      });

      return { sub, tenant };
    });

    revalidatePath("/agapay-tanaw");
    return {
      success: true,
      message: `Subscription approved. Tenant "${result.tenant.name}" is now active.`,
    };
  } catch (error) {
    console.error("Failed to approve subscription:", error);
    return { success: false, error: "Failed to approve subscription." };
  }
}
