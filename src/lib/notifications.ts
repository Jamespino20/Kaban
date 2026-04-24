import prisma from "@/lib/prisma";
import { NotificationChannel, NotificationType } from "@prisma/client";
import { sendSystemNotificationEmail } from "@/lib/mail";

export async function createNotification(input: {
  userId: number;
  tenantId?: number | null;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  channel?: NotificationChannel;
}) {
  const notification = await prisma.notification.create({
    data: {
      user_id: input.userId,
      tenant_id: input.tenantId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl ?? null,
      channel: input.channel ?? NotificationChannel.in_app,
    },
    include: {
      recipient: true,
    },
  });

  if (
    (notification.channel === NotificationChannel.email ||
      notification.channel === NotificationChannel.both) &&
    notification.recipient.email
  ) {
    await sendSystemNotificationEmail({
      to: notification.recipient.email,
      subject: `Agapay: ${notification.title}`,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.action_url,
    });

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        emailed_at: new Date(),
      },
    });
  }

  return notification;
}
