export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  totalMembers: number;
  totalLoans: number;
  repaymentRate: number;
  defaultRate: number;
  newSignupsThisMonth: number;
  pendingApplications: number;
  totalFUM: number;
  portfolioAtRisk: number;
}

const openers = [
  "This week's platform health check shows",
  "An analysis of current cooperative metrics reveals",
  "The Agapay ecosystem is performing as follows:",
  "Based on the latest data aggregation,",
  "A snapshot of platform-wide operations indicates",
];

const goodRepayment = [
  "Repayment discipline remains strong at {rate}%, reflecting healthy borrower behavior across all regions.",
  "Members continue to demonstrate reliable repayment habits, with an overall rate of {rate}%.",
  "The {rate}% repayment rate signals robust financial health across the cooperative network.",
  "Loan repayment consistency is commendable at {rate}%, well above industry benchmarks.",
];

const badRepayment = [
  "The repayment rate of {rate}% requires attention — proactive intervention is recommended for at-risk accounts.",
  "At {rate}%, the repayment rate is below target. Consider reviewing collection strategies.",
  "Repayment performance at {rate}% suggests tightening liquidity among some member segments.",
  "With a repayment rate of {rate}%, targeted compassion actions may be needed for delinquent accounts.",
];

const lowDefault = [
  "Defaults are well-contained at {rate}%, demonstrating effective risk management across the portfolio.",
  "With a default rate of just {rate}%, portfolio quality remains exceptional.",
  "The {rate}% default rate underscores strong credit evaluation and member screening.",
  "Default rates remain impressively low at {rate}%, reflecting sound underwriting discipline.",
];

const highDefault = [
  "The default rate of {rate}% is elevated — tighter credit screening and collection protocols may be needed.",
  "At {rate}%, defaults are trending above acceptable thresholds. Consider reviewing loan product criteria.",
  "Default rates at {rate}% signal potential weaknesses in the collections pipeline.",
  "A default rate of {rate}% warrants closer monitoring of high-risk member cohorts.",
];

const goodMemberGrowth = [
  "New member signups are trending positively at {count} this month, indicating healthy ecosystem growth.",
  "The platform welcomed {count} new members this month, reflecting strong acquisition momentum.",
  "Member acquisition remains robust with {count} new registrations in the current period.",
  "With {count} new signups this month, the cooperative network continues to expand steadily.",
];

const lowMemberGrowth = [
  "Member acquisition is slower this period with {count} new signups recorded.",
  "At {count} new members this month, growth has plateaued — community outreach campaigns may help.",
  "New member additions are modest at {count}, suggesting an opportunity for targeted engagement initiatives.",
  "The platform recorded {count} new signups, indicating a quieter acquisition period than previous months.",
];

const goodFUM = [
  "Funds under management stand at ₱{amount}, reflecting growing member savings and investor confidence.",
  "Total liquidity of ₱{amount} provides a solid capital base for loan disbursement operations.",
  "The FUM of ₱{amount} signals healthy capital mobilization across the cooperative network.",
  "With ₱{amount} in total funds, the platform maintains strong operational liquidity.",
];

const lowFUM = [
  "Total funds under management at ₱{amount} suggest room for deeper savings mobilization initiatives.",
  "At ₱{amount}, the liquidity pool could benefit from targeted savings campaigns to strengthen the lending base.",
  "FUM stands at ₱{amount} — encouraging higher member savings rates could expand the capital pool.",
];

const goodTenantGrowth = [
  "Active tenant cooperatives total {count}, with {active} currently operational and serving members across regions.",
  "The platform supports {count} registered cooperatives, of which {active} are actively transacting.",
  "With {count} tenant organizations onboarded and {active} active, the network shows healthy adoption trends.",
];

const lowTenantGrowth = [
  "Of {count} registered tenants, {active} are currently active — onboarding support may improve activation rates.",
  "Tenant adoption stands at {active} active out of {count} registered — continued engagement is recommended.",
];

const lowPAR = [
  "Portfolio at risk is well-controlled at {rate}%, indicating healthy loan performance across the board.",
  "At just {rate}%, the portfolio-at-risk metric reflects sound collection and monitoring practices.",
  "Risk exposure is minimal at {rate}%, suggesting strong overall portfolio quality.",
  "The PAR of {rate}% shows that most borrowers are meeting their obligations on time.",
];

const highPAR = [
  "Portfolio at risk is elevated at {rate}%, requiring proactive intervention and enhanced monitoring strategies.",
  "The {rate}% PAR indicates a growing portion of the portfolio needs closer attention from collections teams.",
  "At {rate}%, portfolio at risk is above the comfort zone. Enhanced collection protocols should be considered.",
  "A PAR of {rate}% suggests some member segments are experiencing repayment stress and may need support.",
];

const closers = [
  "Overall, the platform remains in a stable operational position with targeted areas for improvement.",
  "Continued monitoring of these indicators will guide strategic decision-making in the coming weeks.",
  "Proactive engagement with underperforming metrics is recommended for the next reporting period.",
  "The data suggests a generally healthy ecosystem with clear opportunities for optimization.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function fmt(n: number, decimals = 1): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(decimals) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(decimals) + "K";
  return n.toFixed(decimals);
}

export function generateAiSummary(metrics: PlatformMetrics): {
  summary: string;
  highlights: string[];
  warnings: string[];
  generatedAt: Date;
} {
  const seed = Math.round(
    metrics.repaymentRate * 100 + metrics.totalLoans * 10 + metrics.totalFUM + metrics.defaultRate * 50,
  );
  const highlights: string[] = [];
  const warnings: string[] = [];
  const sentences: string[] = [];

  sentences.push(pick(openers, seed));

  // Repayment rate
  if (metrics.repaymentRate >= 90) {
    sentences.push(pick(goodRepayment, seed + 1).replace("{rate}", metrics.repaymentRate.toFixed(1)));
    highlights.push(`Repayment rate of ${metrics.repaymentRate.toFixed(1)}% — excellent member discipline`);
  } else if (metrics.repaymentRate >= 75) {
    sentences.push(pick(goodRepayment, seed + 1).replace("{rate}", metrics.repaymentRate.toFixed(1)));
    highlights.push(`Repayment rate at ${metrics.repaymentRate.toFixed(1)}% — healthy portfolio performance`);
  } else if (metrics.repaymentRate > 0) {
    sentences.push(pick(badRepayment, seed + 1).replace("{rate}", metrics.repaymentRate.toFixed(1)));
    warnings.push(`Repayment rate of ${metrics.repaymentRate.toFixed(1)}% needs attention`);
  }

  // Default rate
  if (metrics.defaultRate > 0 && metrics.defaultRate < 5) {
    sentences.push(pick(lowDefault, seed + 2).replace("{rate}", metrics.defaultRate.toFixed(1)));
    highlights.push(`Default rate at ${metrics.defaultRate.toFixed(1)}% — strong credit quality`);
  } else if (metrics.defaultRate >= 10) {
    sentences.push(pick(highDefault, seed + 2).replace("{rate}", metrics.defaultRate.toFixed(1)));
    warnings.push(`Default rate of ${metrics.defaultRate.toFixed(1)}% is elevated`);
  } else if (metrics.defaultRate >= 5) {
    sentences.push(pick(highDefault, seed + 2).replace("{rate}", metrics.defaultRate.toFixed(1)));
  }

  // Portfolio at Risk
  if (metrics.portfolioAtRisk > 0 && metrics.portfolioAtRisk < 10) {
    sentences.push(pick(lowPAR, seed + 3).replace("{rate}", metrics.portfolioAtRisk.toFixed(1)));
    highlights.push(`Portfolio at risk: ${metrics.portfolioAtRisk.toFixed(1)}% — well-controlled`);
  } else if (metrics.portfolioAtRisk >= 20) {
    sentences.push(pick(highPAR, seed + 3).replace("{rate}", metrics.portfolioAtRisk.toFixed(1)));
    warnings.push(`Portfolio at risk at ${metrics.portfolioAtRisk.toFixed(1)}% requires monitoring`);
  } else if (metrics.portfolioAtRisk >= 10) {
    sentences.push(pick(highPAR, seed + 3).replace("{rate}", metrics.portfolioAtRisk.toFixed(1)));
  }

  // Member signups
  if (metrics.newSignupsThisMonth >= 10) {
    sentences.push(
      pick(goodMemberGrowth, seed + 4).replace("{count}", String(metrics.newSignupsThisMonth)),
    );
    highlights.push(`${metrics.newSignupsThisMonth} new members this month — strong acquisition`);
  } else if (metrics.newSignupsThisMonth > 0) {
    sentences.push(
      pick(lowMemberGrowth, seed + 4).replace("{count}", String(metrics.newSignupsThisMonth)),
    );
  }

  // Tenant growth
  if (metrics.totalTenants > 0) {
    const active = metrics.activeTenants || metrics.totalTenants;
    const ratio = active / metrics.totalTenants;
    if (ratio >= 0.8) {
      sentences.push(
        pick(goodTenantGrowth, seed + 5)
          .replace("{count}", String(metrics.totalTenants))
          .replace("{active}", String(active)),
      );
      highlights.push(`${active} of ${metrics.totalTenants} tenants active — high adoption`);
    } else {
      sentences.push(
        pick(lowTenantGrowth, seed + 5)
          .replace("{count}", String(metrics.totalTenants))
          .replace("{active}", String(active)),
      );
    }
  }

  // FUM
  if (metrics.totalFUM >= 1_000_000) {
    sentences.push(
      pick(goodFUM, seed + 6).replace("{amount}", fmt(metrics.totalFUM)),
    );
    highlights.push(`Funds under management: ₱${fmt(metrics.totalFUM)} — healthy liquidity`);
  } else if (metrics.totalFUM > 0) {
    sentences.push(
      pick(lowFUM, seed + 6).replace("{amount}", fmt(metrics.totalFUM)),
    );
  }

  sentences.push(pick(closers, seed + 7));

  return {
    summary: sentences.join(" "),
    highlights,
    warnings,
    generatedAt: new Date(),
  };
}
