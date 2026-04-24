"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { Role, UserStatus, RepaymentFrequency } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  computeLoanQuote,
  MICROFINANCE_POLICY,
  validateLoanRequestAgainstPolicy,
} from "@/lib/microfinance-policy";

const LoanApplicationSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  amount: z.coerce
    .number()
    .min(
      MICROFINANCE_POLICY.minAmount,
      `Minimum PHP ${MICROFINANCE_POLICY.minAmount.toLocaleString()} is required`,
    ),
  term_months: z.coerce
    .number()
    .min(
      MICROFINANCE_POLICY.minTermMonths,
      `Minimum ${MICROFINANCE_POLICY.minTermMonths} months is required`,
    )
    .max(
      MICROFINANCE_POLICY.maxTermMonths,
      `Maximum ${MICROFINANCE_POLICY.maxTermMonths} months is allowed`,
    ),
  guarantor_ids: z
    .array(z.coerce.number())
    .min(
      MICROFINANCE_POLICY.minGuarantors,
      `At least ${MICROFINANCE_POLICY.minGuarantors} guarantor is required`,
    )
    .max(
      MICROFINANCE_POLICY.maxGuarantors,
      `At most ${MICROFINANCE_POLICY.maxGuarantors} guarantors are allowed`,
    ),
  repayment_frequency: z
    .nativeEnum(RepaymentFrequency)
    .default(RepaymentFrequency.monthly),
});

export const applyForLoan = async (
  values: z.infer<typeof LoanApplicationSchema>,
) => {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Not authenticated or tenant not found!" };
  }

  if (session.user.role !== "member" || !session.user.tenantId) {
    return { error: "Not authenticated or tenant not found!" };
  }

  const tenantId = session.user.tenantId;
  const userId = session.user.user_id;

  const validatedFields = LoanApplicationSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    product_id,
    amount,
    term_months,
    guarantor_ids,
    repayment_frequency,
  } = validatedFields.data;

  try {
    const [product, member] = await Promise.all([
      prisma.loanProduct.findFirst({
        where: { product_id, tenant_id: tenantId },
      }),
      prisma.user.findUnique({
        where: { user_id: userId },
        select: {
          interest_tier: true,
        },
      }),
    ]);

    if (!product || !product.is_active) {
      return { error: "Product not available." };
    }

    if (!member) {
      return { error: "Member account not found." };
    }

    if (
      amount < Number(product.min_amount) ||
      amount > Number(product.max_amount)
    ) {
      return {
        error: `Amount must be between PHP ${Number(product.min_amount).toLocaleString()} and PHP ${Number(product.max_amount).toLocaleString()}.`,
      };
    }

    if (term_months > product.max_term_months) {
      return { error: `Max term is ${product.max_term_months} months.` };
    }

    const uniqueGuarantorIds = [...new Set(guarantor_ids)].filter(
      (guarantorId) => guarantorId !== userId,
    );
    const policyValidationError = validateLoanRequestAgainstPolicy({
      amount,
      termMonths: term_months,
      guarantorCount: uniqueGuarantorIds.length,
      tier: member.interest_tier,
    });

    if (policyValidationError) {
      return { error: policyValidationError };
    }

    const eligibleGuarantors = await prisma.user.findMany({
      where: {
        user_id: { in: uniqueGuarantorIds },
        tenant_id: tenantId,
        role: Role.member,
        status: UserStatus.active,
      },
      select: { user_id: true },
    });

    if (eligibleGuarantors.length !== uniqueGuarantorIds.length) {
      return {
        error: "Selected guarantors must be active members of your branch.",
      };
    }

    const quote = computeLoanQuote({
      principalAmount: amount,
      termMonths: term_months,
      monthlyRatePercent: Number(product.interest_rate_percent),
    });

    await prisma.$transaction(async (tx: any) => {
      const loan = await tx.loan.create({
        data: {
          user_id: userId,
          product_id,
          term_months,
          repayment_frequency,
          status: "pending",
          tenant_id: tenantId,
          loan_reference: `LN-${tenantId}-${Date.now()}`,
          principal_amount: amount,
          purpose: "General Purpose",
          interest_applied: quote.totalInterest,
          principal_receivable: amount,
          interest_receivable: quote.totalInterest,
          fees_applied: quote.processingFee,
          total_payable: quote.totalPayable,
          balance_remaining: quote.totalPayable,
        },
      });

      await tx.loanGuarantee.createMany({
        data: uniqueGuarantorIds.map((guarantorId) => ({
          loan_id: loan.loan_id,
          guarantor_id: guarantorId,
          status: "pending" as const,
        })),
      });
    });

    revalidatePath("/agapay-tanaw");
    revalidatePath("/agapay-pintig");
    return { success: "Application submitted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong!" };
  }
};
