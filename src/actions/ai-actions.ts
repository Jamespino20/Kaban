"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAISnapshot() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  const role = session?.user?.role;
  if (!tenantId || !role) throw new Error("Unauthorized");

  // Fetch relevant metrics for "AI Analysis"
  const [metrics, overdueLoans, recentPayments] = await Promise.all([
    prisma.loan.aggregate({
      where: { tenant_id: tenantId },
      _sum: { amount_approved: true },
      _count: true,
    }),
    prisma.loanSchedule.count({
      where: { tenant_id: tenantId, status: "overdue" },
    }),
    prisma.payment.findMany({
      where: { tenant_id: tenantId, status: "verified" },
      orderBy: { verified_at: "desc" },
      take: 20,
    }),
  ]);

  // Rule-based heuristic engine (Simulated AI Insight)
  const insights = [];

  const delinquencyRate =
    metrics._count > 0 ? (overdueLoans / metrics._count) * 100 : 0;

  if (delinquencyRate > 15) {
    insights.push({
      type: "warning",
      title: "Elevated Risk Detected",
      message: `Your current delinquency rate is ${delinquencyRate.toFixed(1)}%. Consider triggering the "Compassion Policy" for affected regions.`,
    });
  } else if (delinquencyRate < 5 && metrics._count > 50) {
    insights.push({
      type: "success",
      title: "Strong Portfolio Health",
      message:
        "Portfilio health is exceptional. It may be a good time to increase the Growth Tier loan limits to ₱25,000.",
    });
  }

  // Trend Analysis
  const recentTotal = recentPayments.reduce(
    (acc: number, p: { amount_paid: any }) => acc + Number(p.amount_paid),
    0,
  );
  if (recentTotal > 100000) {
    insights.push({
      type: "info",
      title: "Liquidity Surge",
      message:
        "Recent high collection volume detected. Recommend transferring ₱50k to the Reserve Fund for interest dividends.",
    });
  }

  return {
    insights,
    timestamp: new Date().toISOString(),
    analysisMode: "Socio-Economic Engine v2.1",
  };
}

export async function getMemberFinancialTips() {
  const session = await auth();
  const userId = session?.user?.user_id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: {
      loans: {
        where: { status: "active" },
        include: {
          schedules: {
            where: { status: "pending" },
            orderBy: { due_date: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  const tips = [
    {
      title: "Trust Building",
      message:
        "Paying 2 days before the due date increases your Peer Trust score by 15% faster.",
    },
    {
      title: "Savings Tip",
      message:
        "Members with at least ₱1,000 in Regular Savings get priority approval for Elite Tier upgrades.",
    },
  ];

  if (
    user?.loans.some(
      (l: { schedules: string | any[] }) => l.schedules.length > 0,
    )
  ) {
    tips.push({
      title: "Repayment Strategy",
      message:
        "Your next payment is coming up. Small weekly top-ups to your wallet can make the full installment easier to handle.",
    });
  }

  return tips;
}
