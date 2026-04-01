"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const LoanApplicationSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  amount: z.coerce.number().min(100, "Minimum ₱100 is required"),
  term_months: z.coerce.number().min(1, "Minimum 1 month is required"),
  guarantor_ids: z
    .array(z.coerce.number())
    .min(3, "At least 3 guarantors are required for Paluwagan 2.0"),
});

export const applyForLoan = async (
  values: z.infer<typeof LoanApplicationSchema>,
) => {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.tenantId) {
    return { error: "Not authenticated or tenant not found!" };
  }

  const validatedFields = LoanApplicationSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { product_id, amount, term_months, guarantor_ids } =
    validatedFields.data;

  try {
    // 1. Double check the product exists and constraints are met
    const product = await prisma.loanProduct.findUnique({
      where: { product_id },
    });

    if (!product || !product.is_active) {
      return { error: "Product not available." };
    }

    if (
      amount < Number(product.min_amount) ||
      amount > Number(product.max_amount)
    ) {
      return {
        error: `Amount must be between ₱${Number(product.min_amount).toLocaleString()} and ₱${Number(product.max_amount).toLocaleString()}`,
      };
    }

    if (term_months > product.max_term_months) {
      return { error: `Max term is ${product.max_term_months} months.` };
    }

    // 2. Server-side calculation (must match client-side UI for transparency)
    const rate = Number(product.interest_rate_percent) / 100;
    const totalInterest = amount * rate * term_months;
    const processingFee = Math.max(50, amount * 0.02);
    const totalPayable = amount + totalInterest + processingFee;

    // 2. Create the loan record and guarantees in a transaction
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          user_id: parseInt(session.user.id),
          product_id,
          term_months,
          status: "pending",
          tenant_id: session.user.tenantId,
          loan_reference: `LN-${session.user.tenantId}-${Date.now()}`,
          principal_amount: amount,
          purpose: "General Purpose",
          interest_applied: totalInterest,
          fees_applied: processingFee,
          total_payable: totalPayable,
          balance_remaining: totalPayable,
        },
      });

      // 3. Create the LoanGuarantee records for the Paluwagan 2.0 group
      if (guarantor_ids && guarantor_ids.length >= 3) {
        const guaranteeData = guarantor_ids.map((gId) => ({
          loan_id: loan.loan_id,
          guarantor_id: gId,
          status: "pending" as const,
        }));

        await tx.loanGuarantee.createMany({
          data: guaranteeData,
        });
      }
    });

    revalidatePath("/asenso-katuwang");
    return { success: "Application submitted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong!" };
  }
};
