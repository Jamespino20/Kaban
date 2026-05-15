import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const loans = await prisma.loan.findMany({
      where: { user_id: auth.user_id },
      orderBy: { applied_at: "desc" },
      select: {
        loan_id: true,
        loan_reference: true,
        principal_amount: true,
        interest_applied: true,
        fees_applied: true,
        total_payable: true,
        balance_remaining: true,
        status: true,
        term_months: true,
        repayment_frequency: true,
        applied_at: true,
        approved_at: true,
        paid_at: true,
        purpose: true,
        product: { select: { name: true } },
      },
    });

    return NextResponse.json({ status: "success", data: loans });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
