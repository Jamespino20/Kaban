import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function checkSubscriptionStatus(tenantId: number) {
  const sub = await prisma.tenantSubscription.findFirst({
    where: { tenant_id: tenantId, status: "active" },
    orderBy: { created_at: "desc" },
  });

  if (!sub) return { status: "no_subscription" };

  const now = new Date();
  const endDate = new Date(sub.end_date);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  const daysOverdue = Math.ceil((now.getTime() - endDate.getTime()) / 86400000);

  // Notify 14 days before expiry
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
    return { status: "suspended", daysOverdue };
  }

  if (daysUntilExpiry <= 0) {
    return { status: "expiring_today", daysUntilExpiry };
  }

  return { status: "active", daysUntilExpiry };
}
