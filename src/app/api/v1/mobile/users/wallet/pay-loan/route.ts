import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";
import { v4 as uuidv4 } from "uuid";

const PayLoanSchema = z.object({
  loan_id: z.number().int().positive(),
  amount: z.number().positive(),
  method_label: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = PayLoanSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { loan_id, amount, method_label } = validated.data;

    const loan = await prisma.loan.findUnique({
      where: { loan_id },
      select: { loan_id: true, user_id: true, balance_remaining: true, status: true },
    });

    if (!loan || loan.user_id !== auth.user_id) {
      return NextResponse.json({ status: "error", message: "Loan not found." }, { status: 404 });
    }

    if (loan.balance_remaining <= 0) {
      return NextResponse.json({ status: "error", message: "Loan already paid." }, { status: 400 });
    }

    const savingsAccount = await prisma.savingsAccount.findUnique({
      where: { user_id_account_type: { user_id: auth.user_id, account_type: "personal_wallet" } },
    });

    const payAmount = Math.min(Number(amount), Number(loan.balance_remaining));

    if (!savingsAccount || Number(savingsAccount.balance) < payAmount) {
      return NextResponse.json({ status: "error", message: "Insufficient wallet balance." }, { status: 400 });
    }

    const method = await prisma.paymentMethod.findFirst({
      where: { tenant_id: auth.tenant_id, is_active: true },
      orderBy: { method_id: "asc" },
    });

    const payment = await prisma.payment.create({
      data: {
        loan_id,
        tenant_id: auth.tenant_id,
        method_id: method?.method_id || 1,
        payment_reference: `WALLET-${uuidv4().slice(0, 8).toUpperCase()}`,
        amount_paid: payAmount,
        status: "verified",
        verified_at: new Date(),
        verified_by: auth.user_id,
        notes: "Paid via mobile wallet",
      },
    });

    const newBalance = Number(loan.balance_remaining) - payAmount;
    await prisma.loan.update({
      where: { loan_id },
      data: {
        balance_remaining: newBalance,
        status: newBalance <= 0 ? "paid" : "active",
        paid_at: newBalance <= 0 ? new Date() : undefined,
      },
    });

    await prisma.savingsAccount.update({
      where: { account_id: savingsAccount.account_id },
      data: { balance: { decrement: payAmount } },
    });

    return NextResponse.json({ status: "success", data: payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
