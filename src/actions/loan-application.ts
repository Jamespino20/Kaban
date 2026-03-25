"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const LoanApplicationSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required"),
  amount: z.coerce.number().min(500, "Minimum ₱500 is required"),
  term_months: z.coerce.number().min(1, "Minimum 1 month is required"),
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

  const { product_id, amount, term_months } = validatedFields.data;

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

    // 2. Create the loan record
    await prisma.loan.create({
      data: {
        user_id: parseInt(session.user.id),
        product_id,
        term_months,
        status: "pending",
        tenant_id: session.user.tenantId,
        loan_reference: `LN-${session.user.tenantId}-${Date.now()}`, // Added a temp reference logic
        principal_amount: amount,
        purpose: "General Purpose", // Added a temp purpose
        interest_applied: 0,
        total_payable: amount,
        balance_remaining: amount,
      },
    });

    revalidatePath("/pintuan");
    return { success: "Application submitted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong!" };
  }
};
