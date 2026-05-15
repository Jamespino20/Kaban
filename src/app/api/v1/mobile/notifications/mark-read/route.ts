import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

const MarkReadSchema = z.object({
  notification_ids: z.array(z.string().min(1)).optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = MarkReadSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { notification_ids, all } = validated.data;

    if (all) {
      await prisma.notification.updateMany({
        where: { user_id: auth.user_id, is_read: false },
        data: { is_read: true },
      });
    } else if (notification_ids && notification_ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: notification_ids }, user_id: auth.user_id },
        data: { is_read: true },
      });
    } else {
      return NextResponse.json({ status: "error", message: "Provide notification_ids or set all: true." }, { status: 400 });
    }

    return NextResponse.json({ status: "success", data: { message: "Notifications marked as read." } });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
