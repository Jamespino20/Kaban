import type {
  InterestTier as PrismaInterestTier,
  ScheduleStatus as PrismaScheduleStatus,
  RepaymentFrequency as PrismaRepaymentFrequency,
} from "@prisma/client";

export type InterestTier = PrismaInterestTier;
export const InterestTier = {
  T1_5_PERCENT: "T1_5_PERCENT",
  T2_4_5_PERCENT: "T2_4_5_PERCENT",
  T3_4_PERCENT: "T3_4_PERCENT",
  T4_3_5_PERCENT: "T4_3_5_PERCENT",
  T5_3_PERCENT: "T5_3_PERCENT",
} as const;

export type ScheduleStatus = PrismaScheduleStatus;
export const ScheduleStatus = {
  pending: "pending",
  paid: "paid",
  missed: "missed",
  forgiven: "forgiven",
  restructured: "restructured",
} as const;

export type RepaymentFrequency = PrismaRepaymentFrequency;
export const RepaymentFrequency = {
  weekly: "weekly",
  bi_weekly: "bi_weekly",
  monthly: "monthly",
} as const;

export const MICROFINANCE_POLICY = {
  minAmount: 2_000,
  maxAmount: 1_000_000,
  maxTenantMembershipsPerUser: 2,
  minTermMonths: 3,
  maxTermMonths: 12,
  minGuarantors: 1,
  maxGuarantors: 2,
  defaultGuarantorLiabilityRate: 25,
  processingFee: 20,
  serviceFee: 50,
  missedPenaltyCapRate: 0.2,
  gracePeriodDays: 14,
  compassionActionsPerLoanCycle: 1,
  overindebtedExposureRate: 0.8,
  maxConcurrentLoansAcrossTenants: 1,
  fullPaymentDiscountRate: 1.0, // 100% interest waiver on early full payment
  debtServiceRatioCap: 0.4,    // 40% DSR policy
} as const;

export const INCOME_RANGE_MAPPING: Record<string, number> = {
  "below_10k": 8000,
  "10k_20k": 15000,
  "20k_30k": 25000,
  "30k_50k": 40000,
  "50k_100k": 75000,
  "above_100k": 120000,
};

export interface TierPolicy {
  tier: InterestTier;
  label: string;
  shortLabel: string;
  capAmount: number;
  monthlyRatePercent: number;
  trustScoreMin: number;
  trustScoreMax: number;
  recommendedMaxTermMonths: number;
}

export interface LoanProductTemplate {
  key: string;
  name: string;
  minAmount: number;
  maxAmount: number | null;
  description: string;
}

export const TIER_POLICIES: Record<InterestTier, TierPolicy> = {
  [InterestTier.T1_5_PERCENT]: {
    tier: InterestTier.T1_5_PERCENT,
    label: "Gabay",
    shortLabel: "5%",
    capAmount: 5_000,
    monthlyRatePercent: 5,
    trustScoreMin: 0,
    trustScoreMax: 54,
    recommendedMaxTermMonths: 3,
  },
  [InterestTier.T2_4_5_PERCENT]: {
    tier: InterestTier.T2_4_5_PERCENT,
    label: "Bagong Sigla",
    shortLabel: "4.5%",
    capAmount: 29_000,
    monthlyRatePercent: 4.5,
    trustScoreMin: 55,
    trustScoreMax: 64,
    recommendedMaxTermMonths: 4,
  },
  [InterestTier.T3_4_PERCENT]: {
    tier: InterestTier.T3_4_PERCENT,
    label: "Kasapi",
    shortLabel: "4%",
    capAmount: 59_000,
    monthlyRatePercent: 4,
    trustScoreMin: 65,
    trustScoreMax: 74,
    recommendedMaxTermMonths: 6,
  },
  [InterestTier.T4_3_5_PERCENT]: {
    tier: InterestTier.T4_3_5_PERCENT,
    label: "Katuwang",
    shortLabel: "3.5%",
    capAmount: 100_000,
    monthlyRatePercent: 3.5,
    trustScoreMin: 75,
    trustScoreMax: 84,
    recommendedMaxTermMonths: 9,
  },
  [InterestTier.T5_3_PERCENT]: {
    tier: InterestTier.T5_3_PERCENT,
    label: "Ka-Agapay",
    shortLabel: "3%",
    capAmount: 1_000_000,
    monthlyRatePercent: 3,
    trustScoreMin: 85,
    trustScoreMax: 100,
    recommendedMaxTermMonths: 12,
  },
};

export const SAMPLE_LOAN_PRODUCT_TEMPLATES: readonly LoanProductTemplate[] = [
  {
    key: "agapay-sari-sari",
    name: "Agapay Sari-Sari",
    minAmount: 2_000,
    maxAmount: 5_000,
    description: "Small working-capital loans for micro-retail needs.",
  },
  {
    key: "agapay-negosyo",
    name: "Agapay Negosyo",
    minAmount: 6_000,
    maxAmount: 29_000,
    description: "Business support loans for early expansion needs.",
  },
  {
    key: "agapay-paluwagan",
    name: "Agapay Paluwagan",
    minAmount: 30_000,
    maxAmount: 59_000,
    description: "Larger cooperative loans for planned member growth.",
  },
  {
    key: "agapay-angat",
    name: "Agapay Angat",
    minAmount: 60_000,
    maxAmount: null,
    description: "Higher-value loans for strong borrowers and special cases.",
  },
] as const;

export type LoanQuote = {
  principalAmount: number;
  termMonths: number;
  monthlyRatePercent: number;
  frequency: RepaymentFrequency;
  totalInterest: number;
  processingFee: number;
  serviceFee: number;
  totalPayable: number;
  installmentAmount: number;
  installmentCount: number;
};

export function getTierPolicy(
  tier: InterestTier | null | undefined,
): TierPolicy {
  return TIER_POLICIES[tier ?? InterestTier.T1_5_PERCENT];
}

export function determineInterestTierFromScore(score: number): InterestTier {
  if (score >= TIER_POLICIES[InterestTier.T5_3_PERCENT].trustScoreMin) {
    return InterestTier.T5_3_PERCENT;
  }
  if (score >= TIER_POLICIES[InterestTier.T4_3_5_PERCENT].trustScoreMin) {
    return InterestTier.T4_3_5_PERCENT;
  }
  if (score >= TIER_POLICIES[InterestTier.T3_4_PERCENT].trustScoreMin) {
    return InterestTier.T3_4_PERCENT;
  }
  if (score >= TIER_POLICIES[InterestTier.T2_4_5_PERCENT].trustScoreMin) {
    return InterestTier.T2_4_5_PERCENT;
  }
  return InterestTier.T1_5_PERCENT;
}

export function formatTierLabel(tier: InterestTier | null | undefined) {
  const policy = getTierPolicy(tier);
  return `${policy.label} (${policy.monthlyRatePercent}% monthly)`;
}

export function getAvailableCreditForTier(
  tier: InterestTier | null | undefined,
  outstandingBalance = 0,
) {
  const capAmount = getTierPolicy(tier).capAmount;
  return roundMoney(Math.max(0, capAmount - Math.max(0, outstandingBalance)));
}

export function computeProcessingFee(principalAmount: number) {
  return roundMoney(MICROFINANCE_POLICY.processingFee);
}

export function computeServiceFee() {
  return roundMoney(MICROFINANCE_POLICY.serviceFee);
}

export function computeLoanQuote({
  principalAmount,
  termMonths,
  monthlyRatePercent,
  frequency = RepaymentFrequency.monthly,
}: {
  principalAmount: number;
  termMonths: number;
  monthlyRatePercent: number;
  frequency?: RepaymentFrequency;
}): LoanQuote {
  const normalizedPrincipal = roundMoney(principalAmount);
  const normalizedTerm = Math.max(
    MICROFINANCE_POLICY.minTermMonths,
    termMonths,
  );
  const normalizedRate = clamp(monthlyRatePercent, 3, 5);
  const totalInterest = roundMoney(
    normalizedPrincipal * (normalizedRate / 100) * normalizedTerm,
  );
  const processingFee = computeProcessingFee(normalizedPrincipal);
  const serviceFee = computeServiceFee();
  const totalPayable = roundMoney(
    normalizedPrincipal + totalInterest + processingFee + serviceFee,
  );

  let installmentCount = normalizedTerm;
  if (frequency === RepaymentFrequency.weekly) {
    installmentCount = normalizedTerm * 4;
  } else if (frequency === RepaymentFrequency.bi_weekly) {
    installmentCount = normalizedTerm * 2;
  }

  const installmentAmount = roundMoney(totalPayable / installmentCount);

  return {
    principalAmount: normalizedPrincipal,
    termMonths: normalizedTerm,
    monthlyRatePercent: normalizedRate,
    frequency,
    totalInterest,
    processingFee,
    serviceFee,
    totalPayable,
    installmentAmount,
    installmentCount,
  };
}

export function buildRepaymentSchedule({
  loanId,
  approvedAt,
  termMonths,
  principalAmount,
  totalInterest,
  processingFee,
  frequency = RepaymentFrequency.monthly,
}: {
  loanId: number;
  approvedAt: Date;
  termMonths: number;
  principalAmount: number;
  totalInterest: number;
  processingFee: number;
  frequency?: RepaymentFrequency;
}) {
  let installmentCount = termMonths;
  if (frequency === RepaymentFrequency.weekly) {
    installmentCount = termMonths * 4;
  } else if (frequency === RepaymentFrequency.bi_weekly) {
    installmentCount = termMonths * 2;
  }

  const principalPerInstallment = roundMoney(
    principalAmount / installmentCount,
  );
  const interestPerInstallment = roundMoney(totalInterest / installmentCount);

  return Array.from({ length: installmentCount }, (_, index) => {
    const dueDate = new Date(approvedAt);
    if (frequency === RepaymentFrequency.weekly) {
      dueDate.setDate(dueDate.getDate() + (index + 1) * 7);
    } else if (frequency === RepaymentFrequency.bi_weekly) {
      dueDate.setDate(dueDate.getDate() + (index + 1) * 14);
    } else {
      dueDate.setMonth(dueDate.getMonth() + index + 1);
    }

    const isLastInstallment = index === installmentCount - 1;
    const principalPaidBefore = principalPerInstallment * index;
    const interestPaidBefore = interestPerInstallment * index;

    // Frontload the processing fee on the last installment (or first, but original code used last)
    const principalPortion = isLastInstallment
      ? roundMoney(principalAmount - principalPaidBefore)
      : principalPerInstallment;

    const interestPortion = isLastInstallment
      ? roundMoney(totalInterest - interestPaidBefore + processingFee)
      : interestPerInstallment;

    return {
      loan_id: loanId,
      installment_number: index + 1,
      due_date: dueDate,
      principal_amount: principalPortion,
      interest_amount: interestPortion,
      total_due: roundMoney(principalPortion + interestPortion),
      penalty_applied: 0,
      days_late: 0,
      status: ScheduleStatus.pending,
    };
  });
}

export function calculateMissedInstallmentPenalty(
  installmentAmount: number,
  daysLate: number,
) {
  const amount = Math.max(0, installmentAmount);
  const cappedPenalty = amount * MICROFINANCE_POLICY.missedPenaltyCapRate;

  let penaltyRate = 0;
  if (daysLate >= 30) {
    penaltyRate = 0.12;
  } else if (daysLate >= 15) {
    penaltyRate = 0.12;
  } else if (daysLate >= 8) {
    penaltyRate = 0.08;
  } else if (daysLate >= 4) {
    penaltyRate = 0.05;
  } else if (daysLate >= 1) {
    penaltyRate = 0.02;
  }

  return roundMoney(Math.min(amount * penaltyRate, cappedPenalty));
}

export function getPenaltyPolicyCopy() {
  return "Penalty applies only on the missed installment: 2% (1–3 days), 5% (4–7 days), 8% (8–14 days), 12% (15+ days), capped at 20% of the missed installment.";
}

export function getCompassionPolicyCopy() {
  return "Compassion support available for valid hardship cases: 1–2 weeks grace period, restructuring, or temporary penalty freeze. Limited to one compassion action per loan cycle.";
}

export function validateLoanProductPolicy({
  minAmount,
  maxAmount,
  interestRatePercent,
  maxTermMonths,
}: {
  minAmount: number;
  maxAmount: number;
  interestRatePercent: number;
  maxTermMonths: number;
}) {
  if (minAmount < MICROFINANCE_POLICY.minAmount) {
    return `Minimum amount must be at least PHP ${MICROFINANCE_POLICY.minAmount.toLocaleString()}.`;
  }
  if (maxAmount > MICROFINANCE_POLICY.maxAmount) {
    return `Maximum amount must stay within the current Kaagapay cap of PHP ${MICROFINANCE_POLICY.maxAmount.toLocaleString()}.`;
  }
  if (minAmount > maxAmount) {
    return "Minimum amount cannot exceed maximum amount.";
  }
  if (interestRatePercent < 3 || interestRatePercent > 5) {
    return "Interest rate must stay within the Agapay policy band of 3% to 5% monthly.";
  }
  if (
    maxTermMonths < MICROFINANCE_POLICY.minTermMonths ||
    maxTermMonths > MICROFINANCE_POLICY.maxTermMonths
  ) {
    return `Loan term must stay between ${MICROFINANCE_POLICY.minTermMonths} and ${MICROFINANCE_POLICY.maxTermMonths} months.`;
  }
  return null;
}

export function validateLoanRequestAgainstPolicy({
  amount,
  termMonths,
  guarantorCount,
  tier,
  minIncome,
  maxIncome,
  incomeRange,
}: {
  amount: number;
  termMonths: number;
  guarantorCount: number;
  tier: InterestTier | null | undefined;
  minIncome?: number | null;
  maxIncome?: number | null;
  incomeRange?: string | null;
}) {
  const tierPolicy = getTierPolicy(tier);

  // 1. Basic DSR Check
  const maxMonthlyRepayment = calculateMaxMonthlyRepayment({
    minIncome,
    maxIncome,
    incomeRange,
  });

  const estimatedMonthlyRepayment = amount / termMonths;

  if (maxMonthlyRepayment > 0 && estimatedMonthlyRepayment > maxMonthlyRepayment) {
    const formattedMaxAmt = (maxMonthlyRepayment * termMonths).toLocaleString();
    return `Loan amount exceeds your repayment capacity based on Agapay's Debt Service Ratio (DSR) policy. For a ${termMonths}-month term, your max eligible amount is approximately PHP ${formattedMaxAmt}.`;
  }

  if (amount < MICROFINANCE_POLICY.minAmount) {
    return `Minimum loan amount is PHP ${MICROFINANCE_POLICY.minAmount.toLocaleString()}.`;
  }
  if (amount > tierPolicy.capAmount) {
    return `Your current ${tierPolicy.label} tier supports up to PHP ${tierPolicy.capAmount.toLocaleString()} only.`;
  }
  if (
    termMonths < MICROFINANCE_POLICY.minTermMonths ||
    termMonths > MICROFINANCE_POLICY.maxTermMonths
  ) {
    return `Loan term must stay between ${MICROFINANCE_POLICY.minTermMonths} and ${MICROFINANCE_POLICY.maxTermMonths} months.`;
  }
  if (
    guarantorCount < MICROFINANCE_POLICY.minGuarantors ||
    guarantorCount > MICROFINANCE_POLICY.maxGuarantors
  ) {
    return `Loan applications require ${MICROFINANCE_POLICY.minGuarantors} to ${MICROFINANCE_POLICY.maxGuarantors} guarantors.`;
  }

  return null;
}

/**
 * Calculates the maximum monthly repayment capability based on DSR policy.
 * DSR = (Monthly Installments) / (Monthly Gross Income)
 */
export function calculateMaxMonthlyRepayment({
  minIncome,
  maxIncome,
  incomeRange,
}: {
  minIncome?: number | null;
  maxIncome?: number | null;
  incomeRange?: string | null;
}): number {
  let monthlyIncome = 0;

  if (minIncome != null && maxIncome != null) {
    // Use the average of the range as requested by the user
    monthlyIncome = (minIncome + maxIncome) / 2;
  } else if (minIncome != null) {
    monthlyIncome = minIncome;
  } else if (incomeRange) {
    monthlyIncome = INCOME_RANGE_MAPPING[incomeRange] || 0;
  }

  if (monthlyIncome <= 0) return 0;

  return roundMoney(monthlyIncome * MICROFINANCE_POLICY.debtServiceRatioCap);
}

export function validateTenantMembershipLimit(membershipCount: number) {
  if (membershipCount > MICROFINANCE_POLICY.maxTenantMembershipsPerUser) {
    return `A non-superadmin account may hold at most ${MICROFINANCE_POLICY.maxTenantMembershipsPerUser} tenant memberships.`;
  }

  return null;
}

export function evaluateOverindebtedness({
  tier,
  totalOutstandingBalance,
  activeLoanCount,
  overdueLoanCount,
  defaultedLoanCount,
}: {
  tier: InterestTier | null | undefined;
  totalOutstandingBalance: number;
  activeLoanCount: number;
  overdueLoanCount: number;
  defaultedLoanCount: number;
}) {
  const tierPolicy = getTierPolicy(tier);
  const exposureCap = roundMoney(
    tierPolicy.capAmount * MICROFINANCE_POLICY.overindebtedExposureRate,
  );

  if (defaultedLoanCount > 0) {
    return {
      blocked: true,
      reason:
        "You have a defaulted loan record in the system. Resolve this first before applying for a new loan.",
    };
  }

  if (overdueLoanCount > 0) {
    return {
      blocked: true,
      reason:
        "You have an overdue repayment in one of your tenant accounts. Please settle this before applying for a new loan.",
    };
  }

  if (activeLoanCount >= MICROFINANCE_POLICY.maxConcurrentLoansAcrossTenants) {
    return {
      blocked: true,
      reason: `Maximum of ${MICROFINANCE_POLICY.maxConcurrentLoansAcrossTenants} concurrent loans allowed across all your tenant accounts.`,
    };
  }

  if (totalOutstandingBalance >= exposureCap) {
    return {
      blocked: true,
      reason: `Your total outstanding balance exceeds the safe exposure threshold for the ${tierPolicy.label} tier. Repay part of your existing loans before applying again.`,
    };
  }

  return { blocked: false as const };
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
