"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getUserNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { data: [], error: "Unauthorized" };

  const userId = parseInt(session.user.id);
  const tenantSlug = (session.user as any).tenantSlug as string | null;
  try {
    const notifications = await prisma.$withTenant(
      session.user.tenantId,
      async (tx: any) => {
        return await tx.notification.findMany({
          where: { user_id: userId },
          orderBy: { created_at: "desc" },
          take: 20,
        });
      },
    );

    return { data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "Failed to fetch notifications" };
  }
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  const userId = parseInt(session.user.id);
  const tenantSlug = (session.user as any).tenantSlug as string | null;
  try {
    const count = await prisma.$withTenant(
      session.user.tenantId,
      async (tx: any) => {
        return await tx.notification.count({
          where: {
            user_id: userId,
            is_read: false,
          },
        });
      },
    );

    return { count };
  } catch (error) {
    return { count: 0 };
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = parseInt(session.user.id);
  const tenantSlug = (session.user as any).tenantSlug as string | null;
  try {
    await prisma.$withTenant(session.user.tenantId, async (tx: any) => {
      await tx.notification.update({
        where: { id, user_id: userId },
        data: { is_read: true },
      });
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = parseInt(session.user.id);
  const tenantSlug = (session.user as any).tenantSlug as string | null;
  try {
    await prisma.$withTenant(session.user.tenantId, async (tx: any) => {
      await tx.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true },
      });
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark all as read" };
  }
}
