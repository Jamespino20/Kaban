"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getUserNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { data: [], error: "Unauthorized" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: parseInt(session.user.id) },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    return { data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: "Failed to fetch notifications" };
  }
}

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  try {
    const count = await prisma.notification.count({
      where: {
        user_id: parseInt(session.user.id),
        is_read: false,
      },
    });

    return { count };
  } catch (error) {
    return { count: 0 };
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.notification.update({
      where: { id, user_id: parseInt(session.user.id) },
      data: { is_read: true },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.notification.updateMany({
      where: { user_id: parseInt(session.user.id), is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to mark all as read" };
  }
}
