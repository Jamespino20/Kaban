"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import {
  MICROFINANCE_POLICY,
  validateLoanProductPolicy,
} from "@/lib/microfinance-policy";

const LoanProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  min_amount: z.coerce.number().min(0, "Min amount must be positive"),
  max_amount: z.coerce.number().min(0, "Max amount must be positive"),
  interest_rate_percent: z.coerce
    .number()
    .min(0, "Interest rate must be positive"),
  guarantor_liability_rate: z.coerce
    .number()
    .min(0, "Liability rate must be positive")
    .max(100, "Liability rate cannot exceed 100%"),
  max_term_months: z.coerce
    .number()
    .min(1, "Term must be at least 1 month"),
});

export const createLoanProduct = async (
  values: z.infer<typeof LoanProductSchema>,
) => {
  let session;
  try {
    session = await requireAdminSession();
  } catch {
    return { error: "Unauthorized" };
  }
  if (!session.user.tenantId) {
    return { error: "Tenant session not found!" };
  }

  const validatedFields = LoanProductSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const {
    name,
    description,
    min_amount,
    max_amount,
    interest_rate_percent,
    guarantor_liability_rate,
    max_term_months,
  } = validatedFields.data;

  const policyError = validateLoanProductPolicy({
    minAmount: min_amount,
    maxAmount: max_amount,
    interestRatePercent: interest_rate_percent,
    maxTermMonths: max_term_months,
  });

  if (policyError) {
    return { error: policyError };
  }

  try {
    await prisma.loanProduct.create({
      data: {
        name,
        description,
        min_amount,
        max_amount,
        interest_rate_percent,
        guarantor_liability_rate,
        max_term_months,
        is_active: true,
        tenant_id: session.user.tenantId,
      } as never,
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Loan product created!" };
  } catch {
    return { error: "Something went wrong!" };
  }
};

export const getLoanProducts = async () => {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return [];
  }
  if (!session.user.tenantId) {
    return [];
  }

  try {
    const products = await prisma.loanProduct.findMany({
      where: {
        tenant_id: session.user.tenantId,
      },
      orderBy: {
        product_id: "desc",
      },
    });
    return products.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      min_amount: Number(product.min_amount),
      max_amount: Number(product.max_amount),
      interest_rate_percent: Number(product.interest_rate_percent),
      guarantor_liability_rate: Number(
        (
          product as typeof product & {
            guarantor_liability_rate?: Prisma.Decimal | number | null;
          }
        ).guarantor_liability_rate ?? 25,
      ),
      max_term_months: product.max_term_months,
      is_active: product.is_active,
      tenant_id: product.tenant_id,
      policy_min_amount: MICROFINANCE_POLICY.minAmount,
      policy_max_amount: MICROFINANCE_POLICY.maxAmount,
      policy_min_term_months: MICROFINANCE_POLICY.minTermMonths,
      policy_max_term_months: MICROFINANCE_POLICY.maxTermMonths,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
