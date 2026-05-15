"use server";

import { generateAiSummary } from "@/lib/ai-insights";
import { getDashboardMetrics } from "@/actions/admin-actions";

export async function getAiSummary() {
  const metrics = await getDashboardMetrics();
  return generateAiSummary({
    totalTenants: metrics.totalTenants || 0,
    activeTenants: metrics.activeTenants || 0,
    totalMembers: metrics.totalMembers || 0,
    totalLoans: metrics.activeLoans || 0,
    repaymentRate: metrics.repaymentRate || 0,
    defaultRate: metrics.defaultRate || 0,
    newSignupsThisMonth: metrics.newSignupsThisMonth || 0,
    pendingApplications: metrics.pendingApplications || 0,
    totalFUM: metrics.totalLiquidity || 0,
    portfolioAtRisk: metrics.riskExposure || 0,
  });
}
