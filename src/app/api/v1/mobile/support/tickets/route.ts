import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const tickets = await prisma.supportTicket.findMany({
      where: { requester_id: auth.user_id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        ticket_number: true,
        ticket_type: true,
        category: true,
        subject: true,
        status: true,
        priority: true,
        created_at: true,
        updated_at: true,
        assigned_to: true,
        resolved_at: true,
      },
    });

    return NextResponse.json({ status: "success", data: tickets });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

const CreateTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["wallet_issue", "loan_issue", "payment_issue", "member_complaint", "system_issue", "feature_request", "homepage_concern", "general_support", "testimonial", "concern", "general"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = CreateTicketSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields.", errors: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { subject, description, category, priority } = validated.data;

    const ticketNumber = `TK-${auth.tenant_id}-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticket_number: ticketNumber,
        tenant_id: auth.tenant_id,
        requester_id: auth.user_id,
        category: category || "general_support",
        subject,
        description,
        status: "open",
        priority: priority || "normal",
      },
    });

    return NextResponse.json({ status: "success", data: ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
