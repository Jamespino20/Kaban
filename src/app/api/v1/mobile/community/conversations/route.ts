import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const conversations = await prisma.conversation.findMany({
      where: {
        tenant_id: auth.tenant_id,
        participants: { some: { user_id: auth.user_id } },
      },
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        created_at: true,
        updated_at: true,
        participants: {
          select: {
            user: {
              select: {
                user_id: true,
                username: true,
                profile: { select: { first_name: true, last_name: true, photo_url: true } },
              },
            },
            last_read_at: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { created_at: "desc" },
          select: { content: true, created_at: true, sender_id: true },
        },
      },
    });

    return NextResponse.json({ status: "success", data: conversations });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
