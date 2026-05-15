import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const notifications = await prisma.notification.findMany({
      where: { user_id: auth.user_id },
      orderBy: { created_at: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        action_url: true,
        is_read: true,
        created_at: true,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { user_id: auth.user_id, is_read: false },
    });

    return NextResponse.json({
      status: "success",
      data: {
        notifications,
        unread_count: unreadCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
