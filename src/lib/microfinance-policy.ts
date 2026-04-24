import {
  InterestTier,
  ScheduleStatus,
  RepaymentFrequency,
} from "@prisma/client";

export const MICROFINANCE_POLICY = {
  minAmount: 5_000,
  maxAmount: 100_000,
  minTermMonths: 3,
  maxTermMonths: 12,
  minGuarantors: 1,
  maxGuarantors: 2,
  processingFeeRate: 0.02,
  processingFeeMinimum: 50,
  missedPenaltyCapRate: 0.2,
  gracePeriodDays: 14,
  compassionActionsPerLoanCycle: 1,
} as const;

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

export const TIER_POLICIES: Record<InterestTier, TierPolicy> = {
  [InterestTier.T1_5_PERCENT]: {
    tier: InterestTier.T1_5_PERCENT,
    label: "Starter",
    shortLabel: "5%",
    capAmount: 5_000,
    monthlyRatePercent: 5,
    trustScoreMin: 0,
    trustScoreMax: 54,
    recommendedMaxTermMonths: 3,
  },
  [InterestTier.T2_4_5_PERCENT]: {
    tier: InterestTier.T2_4_5_PERCENT,
    label: "Starter Plus",
    shortLabel: "4.5%",
    capAmount: 10_000,
    monthlyRatePercent: 4.5,
    trustScoreMin: 55,
    trustScoreMax: 64,
    recommendedMaxTermMonths: 4,
  },
  [InterestTier.T3_4_PERCENT]: {
    tier: InterestTier.T3_4_PERCENT,
    label: "Growth",
    shortLabel: "4%",
    capAmount: 20_000,
    monthlyRatePercent: 4,
    trustScoreMin: 65,
    trustScoreMax: 74,
    recommendedMaxTermMonths: 6,
  },
  [InterestTier.T4_3_5_PERCENT]: {
    tier: InterestTier.T4_3_5_PERCENT,
    label: "Trusted",
    shortLabel: "3.5%",
    capAmount: 50_000,
    monthlyRatePercent: 3.5,
    trustScoreMin: 75,
    trustScoreMax: 84,
    recommendedMaxTermMonths: 9,
  },
  [InterestTier.T5_3_PERCENT]: {
    tier: InterestTier.T5_3_PERCENT,
    label: "Elite",
    shortLabel: "3%",
    capAmount: 100_000,
    monthlyRatePercent: 3,
    trustScoreMin: 85,
    trustScoreMax: 100,
    recommendedMaxTermMonths: 12,
  },
};

export type LoanQuote = {
  principalAmount: number;
  termMonths: number;
  monthlyRatePercent: number;
  frequency: RepaymentFrequency;
  totalInterest: number;
  processingFee: number;
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
  return `${policy.label} (${policy.monthlyRatePercent}% buwanan)`;
}

export function getAvailableCreditForTier(
  tier: InterestTier | null | undefined,
  outstandingBalance = 0,
) {
  const capAmount = getTierPolicy(tier).capAmount;
  return roundMoney(Math.max(0, capAmount - Math.max(0, outstandingBalance)));
}

export function computeProcessingFee(principalAmount: number) {
  return roundMoney(
    Math.max(
      MICROFINANCE_POLICY.processingFeeMinimum,
      principalAmount * MICROFINANCE_POLICY.processingFeeRate,
    ),
  );
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
  const totalPayable = roundMoney(
    normalizedPrincipal + totalInterest + processingFee,
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
  return "Penalty applies only on the missed installment: 2% (1–3 araw), 5% (4–7 araw), 8% (8–14 araw), 12% (15+ araw), capped at 20% ng na-miss na hulog.";
}

export function getCompassionPolicyCopy() {
  return "May compassion support para sa valid hardship cases: 1–2 linggong grace period, restructure, o temporary penalty freeze. Limitado ito sa isang compassion action kada loan cycle.";
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
    return `Maximum amount must stay within the current Elite cap of PHP ${MICROFINANCE_POLICY.maxAmount.toLocaleString()}.`;
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
}: {
  amount: number;
  termMonths: number;
  guarantorCount: number;
  tier: InterestTier | null | undefined;
}) {
  const tierPolicy = getTierPolicy(tier);

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

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
