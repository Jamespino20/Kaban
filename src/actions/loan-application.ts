"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { Role, UserStatus, RepaymentFrequency } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logInteraction } from "@/lib/analytics-logger";
import {
  computeLoanQuote,
  evaluateOverindebtedness,
  MICROFINANCE_POLICY,
  validateLoanRequestAgainstPolicy,
} from "@/lib/microfinance-policy";

import { LoanService } from "@/services/loan-service";

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

  const validatedFields = LoanApplicationSchema.safeParse(values);
  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
      .join("; ");
    return { error: `Validation failed: ${firstError || "Please check your inputs."}` };
  }

  try {
    const result = await LoanService.applyForLoan(
      {
        user_id: session.user.user_id,
        tenant_id: session.user.tenantId,
        tenant_slug: session.user.tenantSlug,
        role: session.user.role,
        email: session.user.email!,
      },
      validatedFields.data,
    );

    if (result.success) {
      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Loan application failed:", message);
    return { error: `Loan submission failed: ${message}` };
  }
};
