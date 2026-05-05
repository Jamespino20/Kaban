import prisma, { getBranchPrisma } from "@/lib/prisma";
import { Role, UserStatus, RepaymentFrequency } from "@prisma/client";
import {
  computeLoanQuote,
  evaluateOverindebtedness,
  validateLoanRequestAgainstPolicy,
} from "@/lib/microfinance-policy";
import { logInteraction } from "@/lib/analytics-logger";

export interface LoanApplicationParams {
  product_id: number;
  amount: number;
  term_months: number;
  guarantor_ids: number[];
  repayment_frequency: RepaymentFrequency;
}

export interface UserContext {
  user_id: number;
  tenant_id: number;
  tenant_slug?: string | null;
  role: string;
  email: string;
}

export class LoanService {
  /**
   * Agnostic loan application logic that can be called from Server Actions (Web)
   * or REST API Controllers (Mobile).
   */
  static async applyForLoan(ctx: UserContext, params: LoanApplicationParams) {
    const {
      user_id: userId,
      tenant_id: tenantId,
      email,
      tenant_slug: tenantSlug,
    } = ctx;
    const db = getBranchPrisma(tenantSlug || null);
    const {
      product_id,
      amount,
      term_months,
      guarantor_ids,
      repayment_frequency,
    } = params;

    const [product, member] = await Promise.all([
      db.loanProduct.findFirst({
        where: { product_id, tenant_id: tenantId },
      }),
      db.user.findUnique({
        where: { user_id: userId },
        select: {
          email: true,
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

    // Business logic: Check accounts across branches (Agapay multi-tenant logic)
    const relatedAccounts = await prisma.user.findMany({
      where: {
        email: member.email,
        role: Role.member,
      },
      select: {
        user_id: true,
      },
    });

    const relatedAccountIds = relatedAccounts.map((account) => account.user_id);

    const [activeLoansAcrossBranches, defaultedLoanCount, overdueLoanCount] =
      await Promise.all([
        prisma.loan.findMany({
          where: {
            user_id: { in: relatedAccountIds },
            status: { in: ["pending", "approved", "active"] },
          },
          select: {
            balance_remaining: true,
          },
        }),
        prisma.loan.count({
          where: {
            user_id: { in: relatedAccountIds },
            status: "defaulted",
          },
        }),
        prisma.loan.count({
          where: {
            user_id: { in: relatedAccountIds },
            schedules: {
              some: { status: "overdue" },
            },
          },
        }),
      ]);

    const totalOutstandingBalance = activeLoansAcrossBranches.reduce(
      (sum, loan) => sum + Number(loan.balance_remaining),
      0,
    );

    // Policy Check: Overindebtedness
    const overindebtedness = evaluateOverindebtedness({
      tier: member.interest_tier,
      totalOutstandingBalance,
      activeLoanCount: activeLoansAcrossBranches.length,
      overdueLoanCount,
      defaultedLoanCount,
    });

    if (overindebtedness.blocked) {
      return { error: overindebtedness.reason };
    }

    // Policy Check: Product boundaries
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

    // Policy Check: Guarantors
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

    const eligibleGuarantors = await db.user.findMany({
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

    // Compute Quote
    const quote = computeLoanQuote({
      principalAmount: amount,
      termMonths: term_months,
      monthlyRatePercent: Number(product.interest_rate_percent),
      frequency: repayment_frequency,
    });

    // Execute Transaction
    await db.$transaction(async (tx: any) => {
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

    // Audit Logging
    await logInteraction({
      eventType: "LOAN_APPLICATION_SUBMITTED",
      tenantId,
      userId,
      metadata: {
        amount,
        term_months,
        product_id,
        repayment_frequency,
      },
    });

    return { success: "Application submitted successfully!" };
  }
}
