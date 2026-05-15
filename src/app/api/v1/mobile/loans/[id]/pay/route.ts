import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";
import { v4 as uuidv4 } from "uuid";

const PayInstallmentSchema = z.object({
  schedule_id: z.number().int().positive(),
  amount: z.number().positive(),
  method_label: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const loanId = parseInt(id, 10);
    if (isNaN(loanId)) {
      return NextResponse.json({ status: "error", message: "Invalid loan ID." }, { status: 400 });
    }

    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = PayInstallmentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { schedule_id, amount, method_label } = validated.data;

    const loan = await prisma.loan.findUnique({
      where: { loan_id: loanId },
      select: { loan_id: true, user_id: true, tenant_id: true, balance_remaining: true },
    });

    if (!loan || loan.user_id !== auth.user_id) {
      return NextResponse.json({ status: "error", message: "Loan not found." }, { status: 404 });
    }

    const schedule = await prisma.loanSchedule.findUnique({
      where: { schedule_id },
      select: { schedule_id: true, loan_id: true, total_due: true, status: true },
    });

    if (!schedule || schedule.loan_id !== loanId) {
      return NextResponse.json({ status: "error", message: "Schedule entry not found." }, { status: 404 });
    }

    if (schedule.status === "paid") {
      return NextResponse.json({ status: "error", message: "Installment already paid." }, { status: 400 });
    }

    const method = await prisma.paymentMethod.findFirst({
      where: { tenant_id: auth.tenant_id, is_active: true },
      orderBy: { method_id: "asc" },
    });

    const payment = await prisma.payment.create({
      data: {
        loan_id: loanId,
        tenant_id: auth.tenant_id,
        method_id: method?.method_id || 1,
        payment_reference: `INST-${uuidv4().slice(0, 8).toUpperCase()}`,
        amount_paid: amount,
        status: "pending",
        notes: method_label || "Installment payment via mobile",
      },
    });

    return NextResponse.json({ status: "success", data: payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
