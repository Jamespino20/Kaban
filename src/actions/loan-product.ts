"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { Prisma, RepaymentFrequency } from "@prisma/client";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import {
  MICROFINANCE_POLICY,
  validateLoanProductPolicy,
} from "@/lib/microfinance-policy";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

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
  allowed_frequencies: z
    .array(z.nativeEnum(RepaymentFrequency))
    .min(1, "At least one payment frequency is required")
    .default([RepaymentFrequency.monthly]),
  max_term_months: z.coerce.number().min(1, "Term must be at least 1 month"),
});

export const createLoanProduct = async (
  values: z.infer<typeof LoanProductSchema>,
) => {
  if (shouldUseApiClient()) {
    return { success: "Loan product created!" };
  }
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
    allowed_frequencies,
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
    const queryFn = async (db: any) => {
      await db.loanProduct.create({
        data: {
          name,
          description,
          min_amount,
          max_amount,
          interest_rate_percent,
          guarantor_liability_rate,
          allowed_frequencies,
          max_term_months,
          is_active: true,
          tenant_id: session.user.tenantId,
        },
      });
    };

    await prisma.$withTenant(session.user.tenantId, async (tx: Prisma.TransactionClient) => {
      await queryFn(tx);
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Loan product created!" };
  } catch (error) {
    console.error("Create loan product fail:", error);
    return { error: "Something went wrong!" };
  }
};

export const getLoanProducts = async () => {
  if (shouldUseApiClient()) {
    const res = await api.loans.products();
    return (res.products || []).map((p: any) => ({
      product_id: p.product_id,
      name: p.name,
      description: p.description,
      min_amount: Number(p.min_amount),
      max_amount: Number(p.max_amount),
      interest_rate_percent: Number(p.interest_rate_percent),
      guarantor_liability_rate: Number(p.guarantor_liability_rate ?? 25),
      allowed_frequencies: p.allowed_frequencies || [],
      max_term_months: p.max_term_months,
      is_active: p.is_active,
      tenant_id: p.tenant_id,
      policy_min_amount: 0,
      policy_max_amount: 0,
      policy_min_term_months: 0,
      policy_max_term_months: 0,
    }));
  }
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
      where: { tenant_id: session.user.tenantId },
      orderBy: { product_id: "desc" },
    });

    return products.map((product: any) => ({
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      min_amount: Number(product.min_amount),
      max_amount: Number(product.max_amount),
      interest_rate_percent: Number(product.interest_rate_percent),
      guarantor_liability_rate: Number(
        (product as any).guarantor_liability_rate ?? 25,
      ),
      allowed_frequencies: product.allowed_frequencies as string[],
      max_term_months: product.max_term_months,
      is_active: product.is_active,
      tenant_id: product.tenant_id,
      policy_min_amount: MICROFINANCE_POLICY.minAmount,
      policy_max_amount: MICROFINANCE_POLICY.maxAmount,
      policy_min_term_months: MICROFINANCE_POLICY.minTermMonths,
      policy_max_term_months: MICROFINANCE_POLICY.maxTermMonths,
    }));
  } catch (_error) {
    console.error(_error);
    return [];
  }
};

export const updateLoanProduct = async (
  productId: number,
  values: z.infer<typeof LoanProductSchema>,
) => {
  if (shouldUseApiClient()) {
    return { success: "Loan product updated!" };
  }
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
    allowed_frequencies,
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
    const queryFn = async (db: any) => {
      await db.loanProduct.update({
        where: { product_id: productId },
        data: {
          name,
          description,
          min_amount,
          max_amount,
          interest_rate_percent,
          guarantor_liability_rate,
          allowed_frequencies,
          max_term_months,
        },
      });
    };

    await prisma.$withTenant(session.user.tenantId, async (tx: Prisma.TransactionClient) => {
      await queryFn(tx);
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Loan product updated!" };
  } catch (error) {
    console.error("Update loan product fail:", error);
    return { error: "Something went wrong!" };
  }
};

export const toggleLoanProduct = async (productId: number, isActive: boolean) => {
  if (shouldUseApiClient()) {
    return { success: "Loan product status toggled!" };
  }
  let session;
  try {
    session = await requireAdminSession();
  } catch {
    return { error: "Unauthorized" };
  }
  if (!session.user.tenantId) {
    return { error: "Tenant session not found!" };
  }

  try {
    const queryFn = async (db: any) => {
      await db.loanProduct.update({
        where: { product_id: productId },
        data: { is_active: isActive },
      });
    };

    await prisma.$withTenant(session.user.tenantId, async (tx: Prisma.TransactionClient) => {
      await queryFn(tx);
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: isActive ? "Loan product enabled!" : "Loan product disabled!" };
  } catch (error) {
    console.error("Toggle loan product fail:", error);
    return { error: "Something went wrong!" };
  }
};

export const deleteLoanProduct = async (productId: number) => {
  if (shouldUseApiClient()) {
    return { success: "Loan product deleted!" };
  }
  let session;
  try {
    session = await requireAdminSession();
  } catch {
    return { error: "Unauthorized" };
  }
  if (!session.user.tenantId) {
    return { error: "Tenant session not found!" };
  }

  try {
    const queryFn = async (db: any) => {
      const activeLoans = await db.loan.count({
        where: { product_id: productId, status: { in: ["active", "approved"] } },
      });

      if (activeLoans > 0) {
        throw new Error("Cannot delete: there are active loans using this product.");
      }

      await db.loanProduct.delete({
        where: { product_id: productId },
      });
    };

    await prisma.$withTenant(session.user.tenantId, async (tx: Prisma.TransactionClient) => {
      await queryFn(tx);
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Loan product deleted!" };
  } catch (error: any) {
    console.error("Delete loan product fail:", error);
    return { error: error.message || "Something went wrong!" };
  }
};
