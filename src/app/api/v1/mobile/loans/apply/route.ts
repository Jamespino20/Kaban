import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";
import { v4 as uuidv4 } from "uuid";

const ApplyLoanSchema = z.object({
  product_id: z.number().int().positive(),
  amount: z.number().positive(),
  term_months: z.number().int().positive(),
  purpose: z.string().min(1),
  repayment_frequency: z.enum(["weekly", "bi_weekly", "monthly"]).optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = ApplyLoanSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields.", errors: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { product_id, amount, term_months, purpose, repayment_frequency } = validated.data;

    const product = await prisma.loanProduct.findUnique({
      where: { product_id },
      select: { product_id: true, tenant_id: true, interest_rate_percent: true, min_amount: true, max_amount: true, max_term_months: true, name: true },
    });

    if (!product || product.tenant_id !== auth.tenant_id) {
      return NextResponse.json({ status: "error", message: "Loan product not found." }, { status: 404 });
    }

    if (amount < Number(product.min_amount) || amount > Number(product.max_amount)) {
      return NextResponse.json({ status: "error", message: `Amount must be between ${product.min_amount} and ${product.max_amount}.` }, { status: 400 });
    }

    if (term_months > product.max_term_months) {
      return NextResponse.json({ status: "error", message: `Max term is ${product.max_term_months} months.` }, { status: 400 });
    }

    const interestApplied = Number(amount) * (Number(product.interest_rate_percent) / 100) * term_months;
    const totalPayable = Number(amount) + interestApplied;
    const loanReference = `LN-${auth.tenant_id}-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const loan = await prisma.loan.create({
      data: {
        tenant_id: auth.tenant_id,
        user_id: auth.user_id,
        product_id,
        loan_reference: loanReference,
        principal_amount: amount,
        purpose,
        term_months,
        interest_applied: interestApplied,
        principal_receivable: amount,
        interest_receivable: interestApplied,
        fees_applied: 0,
        total_payable: totalPayable,
        balance_remaining: totalPayable,
        status: "pending",
        repayment_frequency: repayment_frequency || "monthly",
      },
    });

    return NextResponse.json({ status: "success", data: loan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
