import test from "node:test";
import assert from "node:assert/strict";
import { InterestTier, RepaymentFrequency } from "@prisma/client";
import {
  buildRepaymentSchedule,
  computeLoanQuote,
  determineInterestTierFromScore,
  evaluateOverindebtedness,
  getAvailableCreditForTier,
  validateBranchMembershipLimit,
  validateLoanRequestAgainstPolicy,
} from "@/lib/microfinance-policy";

test("trust score boundaries map to the full five-tier policy", () => {
  assert.equal(determineInterestTierFromScore(20), InterestTier.T1_5_PERCENT);
  assert.equal(determineInterestTierFromScore(55), InterestTier.T2_4_5_PERCENT);
  assert.equal(determineInterestTierFromScore(65), InterestTier.T3_4_PERCENT);
  assert.equal(determineInterestTierFromScore(75), InterestTier.T4_3_5_PERCENT);
  assert.equal(determineInterestTierFromScore(85), InterestTier.T5_3_PERCENT);
});

test("available credit shrinks with outstanding balance and never goes below zero", () => {
  assert.equal(getAvailableCreditForTier(InterestTier.T4_3_5_PERCENT, 12500), 37500);
  assert.equal(getAvailableCreditForTier(InterestTier.T1_5_PERCENT, 6000), 0);
});

test("loan request validation blocks excess cap and invalid guarantor count", () => {
  assert.match(
    validateLoanRequestAgainstPolicy({
      amount: 15000,
      termMonths: 4,
      guarantorCount: 1,
      tier: InterestTier.T2_4_5_PERCENT,
    }) || "",
    /supports up to PHP 10,000/i,
  );

  assert.match(
    validateLoanRequestAgainstPolicy({
      amount: 5000,
      termMonths: 3,
      guarantorCount: 3,
      tier: InterestTier.T1_5_PERCENT,
    }) || "",
    /require 1 to 2 guarantors/i,
  );
});

test("loan quote honors repayment frequency installment counts", () => {
  const weekly = computeLoanQuote({
    principalAmount: 12000,
    termMonths: 3,
    monthlyRatePercent: 4,
    frequency: RepaymentFrequency.weekly,
  });
  const biWeekly = computeLoanQuote({
    principalAmount: 12000,
    termMonths: 3,
    monthlyRatePercent: 4,
    frequency: RepaymentFrequency.bi_weekly,
  });
  const monthly = computeLoanQuote({
    principalAmount: 12000,
    termMonths: 3,
    monthlyRatePercent: 4,
    frequency: RepaymentFrequency.monthly,
  });

  assert.equal(weekly.installmentCount, 12);
  assert.equal(biWeekly.installmentCount, 6);
  assert.equal(monthly.installmentCount, 3);
});

test("repayment schedule uses the chosen cadence instead of staying monthly-only", () => {
  const weeklySchedule = buildRepaymentSchedule({
    loanId: 99,
    approvedAt: new Date("2026-04-01T00:00:00.000Z"),
    termMonths: 3,
    principalAmount: 12000,
    totalInterest: 1440,
    processingFee: 240,
    frequency: RepaymentFrequency.weekly,
  });

  assert.equal(weeklySchedule.length, 12);
  assert.equal(
    weeklySchedule[0].due_date.toISOString(),
    "2026-04-08T00:00:00.000Z",
  );
  assert.equal(
    weeklySchedule[1].due_date.toISOString(),
    "2026-04-15T00:00:00.000Z",
  );
});

test("branch membership policy blocks more than three tenant memberships", () => {
  assert.equal(validateBranchMembershipLimit(3), null);
  assert.match(
    validateBranchMembershipLimit(4) || "",
    /at most 3 branch memberships/i,
  );
});

test("overindebtedness blocks borrowers with overdue or excessive exposure", () => {
  const blockedByOverdue = evaluateOverindebtedness({
    tier: InterestTier.T3_4_PERCENT,
    totalOutstandingBalance: 4000,
    activeLoanCount: 1,
    overdueLoanCount: 1,
    defaultedLoanCount: 0,
  });
  assert.equal(blockedByOverdue.blocked, true);

  const blockedByExposure = evaluateOverindebtedness({
    tier: InterestTier.T2_4_5_PERCENT,
    totalOutstandingBalance: 9000,
    activeLoanCount: 1,
    overdueLoanCount: 0,
    defaultedLoanCount: 0,
  });
  assert.equal(blockedByExposure.blocked, true);

  const healthyBorrower = evaluateOverindebtedness({
    tier: InterestTier.T4_3_5_PERCENT,
    totalOutstandingBalance: 5000,
    activeLoanCount: 1,
    overdueLoanCount: 0,
    defaultedLoanCount: 0,
  });
  assert.equal(healthyBorrower.blocked, false);
});
