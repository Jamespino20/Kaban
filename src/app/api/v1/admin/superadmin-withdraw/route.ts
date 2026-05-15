import { NextResponse } from "next/server";
import * as z from "zod";
import { withdrawSuperadminEarnings } from "@/actions/superadmin-actions";

const WithdrawSchema = z.object({
  amount: z.number().positive(),
  methodLabel: z.string().optional(),
  externalReference: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = WithdrawSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid withdrawal request." },
        { status: 400 },
      );
    }

    const { amount, methodLabel, externalReference } = parsed.data;
    const result = await withdrawSuperadminEarnings(amount, methodLabel, externalReference);

    if (!result.success) {
      return NextResponse.json(
        { status: "error", message: result.error || "Unable to process withdrawal." },
        { status: 400 },
      );
    }

    return NextResponse.json({ status: "success", message: result.message || "Withdrawal completed." });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Server error processing withdrawal." },
      { status: 500 },
    );
  }
}
