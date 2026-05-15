import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function checkSubscriptionStatus(tenantId: number) {
  const sub = await prisma.tenantSubscription.findFirst({
    where: { tenant_id: tenantId, status: "active" },
    orderBy: { created_at: "desc" },
    include: { plan: true },
  });

  if (!sub) return { status: "no_subscription" };

  const now = new Date();
  const endDate = new Date(sub.end_date);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  const daysOverdue = Math.ceil((now.getTime() - endDate.getTime()) / 86400000);

  // Notify at 14, 7, 3 days before expiry
  if (daysUntilExpiry === 14 || daysUntilExpiry === 7 || daysUntilExpiry === 3) {
    const operators = await prisma.user.findMany({
      where: { tenant_id: tenantId, role: "operator", status: "active" },
    });
    for (const op of operators) {
      await createNotification({
        userId: op.user_id,
        tenantId,
        type: "tenant_suspended",
        title: "Subscription Expiring Soon",
        body: `Your subscription ends in ${daysUntilExpiry} days. Renew to avoid service suspension.`,
      });
    }
  }

  // Auto-suspend if more than 1 day overdue
  if (daysOverdue > 1) {
    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { entitlement_status: "suspended" },
    });
    return { status: "suspended", daysOverdue, plan: sub.plan };
  }

  if (daysUntilExpiry <= 0) {
    return { status: "expiring_today", daysUntilExpiry };
  }

  return { status: "active", daysUntilExpiry, plan: sub.plan };
}

export async function renewSubscription(
  tenantId: number,
  paymentReference: string,
  billingCycle: "monthly" | "quarterly" | "semi_annually" | "annually",
) {
  const currentSub = await prisma.tenantSubscription.findFirst({
    where: { tenant_id: tenantId },
    orderBy: { created_at: "desc" },
  });

  if (!currentSub) return { error: "No current subscription found" };

  // Calculate new period: start from now (or end of current if still active)
  const now = new Date();
  const baseDate = currentSub.end_date > now ? currentSub.end_date : now;
  const newStart = new Date(baseDate);
  const newEnd = new Date(baseDate);

  switch (billingCycle) {
    case "monthly": newEnd.setMonth(newEnd.getMonth() + 1); break;
    case "quarterly": newEnd.setMonth(newEnd.getMonth() + 3); break;
    case "semi_annually": newEnd.setMonth(newEnd.getMonth() + 6); break;
    case "annually": newEnd.setMonth(newEnd.getMonth() + 12); break;
  }

  await prisma.tenantSubscription.create({
    data: {
      tenant_id: tenantId,
      plan_id: currentSub.plan_id,
      billing_cycle: billingCycle,
      status: "active",
      start_date: newStart,
      end_date: newEnd,
    },
  });

  // Reactivate tenant
  await prisma.tenant.update({
    where: { tenant_id: tenantId },
    data: { entitlement_status: "active" },
  });

  // Notify operators
  const operators = await prisma.user.findMany({
    where: { tenant_id: tenantId, role: "operator", status: "active" },
  });
  for (const op of operators) {
    await createNotification({
      userId: op.user_id,
      tenantId,
      type: "tenant_approved",
      title: "Subscription Renewed",
      body: `Your subscription has been renewed until ${newEnd.toLocaleDateString()}.`,
    });
  }

  return { success: true, startDate: newStart, endDate: newEnd };
}
