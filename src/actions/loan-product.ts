"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const LoanProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  min_amount: z.number().min(0, "Min amount must be positive"),
  max_amount: z.number().min(0, "Max amount must be positive"),
  interest_rate_percent: z.number().min(0, "Interest rate must be positive"),
  max_term_months: z.number().min(1, "Term must be at least 1 month"),
});

export const createLoanProduct = async (
  values: z.infer<typeof LoanProductSchema>,
) => {
  const session = await auth();
  if (
    !session?.user?.tenantId ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
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
    max_term_months,
  } = validatedFields.data;

  try {
    await prisma.loanProduct.create({
      data: {
        name,
        description,
        min_amount,
        max_amount,
        interest_rate_percent,
        max_term_months,
        is_active: true,
        tenant_id: session.user.tenantId,
      },
    });

    revalidatePath("/agapay-pintig");
    return { success: "Loan product created!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};

export const getLoanProducts = async () => {
  const session = await auth();
  if (
    !session?.user?.tenantId ||
    (session.user.role !== "admin" && session.user.role !== "superadmin")
  ) {
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
    return products.map((product: any) => ({
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      min_amount: Number(product.min_amount),
      max_amount: Number(product.max_amount),
      interest_rate_percent: Number(product.interest_rate_percent),
      max_term_months: product.max_term_months,
      is_active: product.is_active,
      tenant_id: product.tenant_id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
