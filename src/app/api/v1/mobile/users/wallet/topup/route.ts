import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

const TopupSchema = z.object({
  amount: z.number().positive(),
  method_label: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = TopupSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { amount, method_label } = validated.data;

    const topup = await prisma.topUpRequest.create({
      data: {
        tenant_id: auth.tenant_id,
        user_id: auth.user_id,
        request_type: "deposit",
        amount,
        method_label: method_label || null,
        status: "pending",
      },
    });

    return NextResponse.json({ status: "success", data: topup }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
