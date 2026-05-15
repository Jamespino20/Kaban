import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json({ status: "error", message: "conversation_id is required." }, { status: 400 });
    }

    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversation_id_user_id: { conversation_id: conversationId, user_id: auth.user_id } },
    });

    if (!isParticipant) {
      return NextResponse.json({ status: "error", message: "Access denied." }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        content: true,
        is_broadcast: true,
        created_at: true,
        updated_at: true,
        sender_id: true,
        reply_to_id: true,
        sender: {
          select: {
            user_id: true,
            username: true,
            profile: { select: { first_name: true, last_name: true, photo_url: true } },
          },
        },
      },
    });

    return NextResponse.json({ status: "success", data: messages });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

const SendMessageSchema = z.object({
  conversation_id: z.string().min(1),
  content: z.string().min(1),
  reply_to_id: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = SendMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { conversation_id, content, reply_to_id } = validated.data;

    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversation_id_user_id: { conversation_id, user_id: auth.user_id } },
    });

    if (!isParticipant) {
      return NextResponse.json({ status: "error", message: "Access denied." }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        tenant_id: auth.tenant_id,
        sender_id: auth.user_id,
        content,
        conversation_id,
        reply_to_id: reply_to_id || null,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        sender_id: true,
        reply_to_id: true,
        sender: {
          select: {
            user_id: true,
            username: true,
            profile: { select: { first_name: true, last_name: true, photo_url: true } },
          },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversation_id },
      data: { updated_at: new Date() },
    });

    return NextResponse.json({ status: "success", data: message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
