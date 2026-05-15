"use server";

import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";
import prisma from "@/lib/prisma";
import { requireSuperadminSession } from "@/lib/authorization";
import { unstable_cache } from "next/cache";

// Superadmin Overview Data
export async function getSuperadminOverview() {
  const session = await requireSuperadminSession();

  if (shouldUseApiClient()) {
    return api.admin.getOverview();
  }

  try {
    // Get global KPIs across all tenants
    const [
      totalFunds,
      totalActiveLoans,
      globalTrustScore,
      subscriptionRevenue,
      recentLogs,
      aiSnapshot,
    ] = await prisma.$transaction([
      // Total funds across all tenants (sum of wallet balances)
      prisma.$queryRaw`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM wallets
      `,

      // Total active loans across all tenants
      prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM loans WHERE status = 'active'
      `,

      // Global trust score (platform-wide average)
      prisma.$queryRaw`
        SELECT AVG(trust_score) as avg_score
        FROM users WHERE trust_score IS NOT NULL
      `,

      // Subscription revenue - total from all tenant subscriptions
      prisma.$queryRaw`
        SELECT COALESCE(SUM(sp.price_monthly), 0) as total_revenue
        FROM tenant_subscriptions ts
        JOIN subscription_plans sp ON sp.id = ts.plan_id
        WHERE ts.status = 'active'
      `,

      // Recent logs across all tenants (last 50)
      prisma.auditLog.findMany({
        orderBy: { created_at: "desc" },
        take: 50,
        include: {
          user: {
            select: { username: true },
          },
        },
      }),

      // AI-generated platform snapshot summary (placeholder - would integrate with AI service)
      (prisma as any).aiSnapshot
        ? (prisma as any).aiSnapshot.findFirst({
            orderBy: { created_at: "desc" },
          })
        : Promise.resolve(null),
    ]);

    // Process raw query results
    const fundsResult = Array.isArray(totalFunds) ? totalFunds[0] : totalFunds;
    const loansResult = Array.isArray(totalActiveLoans)
      ? totalActiveLoans[0]
      : totalActiveLoans;
    const trustResult = Array.isArray(globalTrustScore)
      ? globalTrustScore[0]
      : globalTrustScore;
    const subRevenue = Array.isArray(subscriptionRevenue)
      ? subscriptionRevenue[0]
      : subscriptionRevenue;

    return {
      success: true,
      data: {
        totalFunds: fundsResult?.total || 0,
        totalActiveLoans: Number(loansResult?.count || 0),
        totalSubscriptionRevenue: Number(subRevenue?.total_revenue || 0),
        globalTrustScore: trustResult?.avg_score
          ? Number(trustResult.avg_score)
          : 0,
        recentLogs: recentLogs.map((log: any) => ({
          ...log,
          username: log.user?.username || "System",
        })),
        aiSnapshot: aiSnapshot || null,
      },
    };
  } catch (error) {
    console.error("Failed to fetch superadmin overview:", error);
    return {
      success: false,
      error: "Failed to load overview data",
    };
  }
}

// SA-03: Tenant application document verification
export async function getTenantApplicationsForReview(filters?: {
  status?: "pending" | "approved" | "rejected";
  region?: string;
  search?: string;
}) {
  const session = await requireSuperadminSession();

  if (shouldUseApiClient()) {
    return api.admin.getTenantApplications();
  }

  try {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.region) {
      // Use tenant_group_id for ID-based filtering
      where.tenant_group_id = parseInt(filters.region);
    }

    const applications = await prisma.tenantApplication.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    // Enrich with tenant_group name and submitted_by user info
    const groupIds = [...new Set(applications.map((a: any) => a.tenant_group_id).filter(Boolean))];
    const groupMap = new Map<number, string>();
    if (groupIds.length > 0) {
      const groups = await prisma.tenantGroup.findMany({
        where: { id: { in: groupIds as number[] } },
        select: { id: true, name: true },
      });
      groups.forEach((g: any) => groupMap.set(g.id, g.name));
    }

    const submittedByIds = [...new Set(applications.map((a: any) => a.submitted_by).filter(Boolean))];
    const userMap = new Map<number, { username: string; email: string }>();
    if (submittedByIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { user_id: { in: submittedByIds as number[] } },
        select: { user_id: true, username: true, email: true },
      });
      users.forEach((u: any) => userMap.set(u.user_id, u));
    }

    const enriched = applications.map((app: any) => ({
      ...app,
      tenant_group: app.tenant_group_id ? { name: groupMap.get(app.tenant_group_id) || "Unknown Region" } : { name: "Unassigned" },
      submitted_by_user: userMap.get(app.submitted_by) || null,
    }));

    let filtered = enriched;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = enriched.filter(
        (app: any) =>
          app.tenant_name.toLowerCase().includes(searchLower) ||
          app.applicant_name?.toLowerCase().includes(searchLower) ||
          app.applicant_email.toLowerCase().includes(searchLower),
      );
    }

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error("Failed to fetch tenant applications:", error);
    return {
      success: false,
      error: "Failed to load applications",
    };
  }
}

export async function reviewTenantApplication(
  applicationId: number,
  action: "approve" | "reject",
  reviewNotes?: string,
) {
  const session = await requireSuperadminSession();

  try {
    const newStatus = action === "approve" ? "approved" : "rejected";

    const result = await prisma.$transaction(async (tx: any) => {
      const app = await tx.tenantApplication.findUnique({
        where: { application_id: applicationId },
      });

      if (!app) throw new Error(`Application not found for ID: ${applicationId}.`);

      const updated = await tx.tenantApplication.update({
        where: { application_id: applicationId },
        data: {
          status: newStatus,
          reviewed_by: session.user.user_id,
          reviewed_at: new Date(),
          review_notes: reviewNotes || null,
        },
      });

      if (action === "approve") {
        await tx.tenant.create({
          data: {
            name: app.tenant_name,
            slug: app.tenant_slug,
            tenant_group_id: app.tenant_group_id,
            entitlement_status: "prospect",
            brand_color: app.brand_color,
            accent_color: app.accent_color,
            logo_url: app.logo_url,
          },
        });
      } else if (action === "reject" && app.payment_proof_url) {
        // Refund payment on rejection
        await tx.billingInvoice.create({
          data: {
            tenant_id: 0,
            invoice_number: `REF-${app.application_id}-${Date.now()}`,
            amount: app.payment_amount || 0,
            status: "paid",
            due_date: new Date(),
            paid_at: new Date(),
            reference: `REFUND-TENANT-APP-${app.application_id}`,
            items: [{ type: "refund", reason: "Application rejected", applicationId: app.application_id }],
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: `TENANT_APPLICATION_${action.toUpperCase()}`,
          entity_type: "TenantApplication",
          entity_id: applicationId,
          user_id: session.user.user_id,
          new_values: { status: newStatus, reviewNotes } as any,
        },
      });

      return updated;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to review application:", error);
    return {
      success: false,
      error: "Failed to process application",
    };
  }
}

// SA-04: Global Management (tenant overview by region)
export async function getGlobalTenantManagement() {
  const session = await requireSuperadminSession();

  try {
    const tenantsByRegion = await prisma.$queryRaw`
      SELECT 
        COALESCE(tg.name, 'Unassigned') as region,
        COUNT(t.tenant_id) as tenant_count,
        SUM(CASE WHEN t.entitlement_status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN t.entitlement_status = 'suspended' THEN 1 ELSE 0 END) as suspended_count,
        COUNT(DISTINCT u.user_id) as member_count,
        COALESCE(SUM(l.principal_amount), 0) as total_portfolio,
        ROUND(AVG(u.trust_score), 2) as avg_trust_score
      FROM tenants t
      LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
      LEFT JOIN users u ON u.tenant_id = t.tenant_id AND u.role = 'member'
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id AND l.status = 'active'
      GROUP BY tg.id, tg.name
      ORDER BY tenant_count DESC
    `;

    const tenantList = await prisma.tenant.findMany({
      include: {
        tenant_group: {
          select: { name: true, reg_code: true },
        },
        _count: {
          select: { users: true, loans: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: {
        byRegion: tenantsByRegion || [],
        tenants: tenantList,
      },
    };
  } catch (error) {
    console.error("Failed to fetch global management:", error);
    return {
      success: false,
      error: "Failed to load management data",
    };
  }
}

// SA-05: Tenant lifecycle actions
export async function updateTenantLifecycle(
  tenantId: number,
  action: "avail" | "suspend" | "decommission" | "restore",
) {
  const session = await requireSuperadminSession();

  if (shouldUseApiClient()) {
    return api.admin.updateTenantLifecycle({ tenantId, action });
  }

  try {
    let updateData: any = {};
    let auditAction = "";

    switch (action) {
      case "avail":
        updateData = {
          entitlement_status: "active",
          lifetime_availed_at: new Date(),
          availed_type: "One-Time",
          entitled_by_user_id: session.user.user_id,
        };
        auditAction = "TENANT_AVAILED";
        break;
      case "suspend":
        updateData = { entitlement_status: "suspended" };
        auditAction = "TENANT_SUSPENDED";
        break;
      case "decommission":
        updateData = { entitlement_status: "decommissioned" };
        auditAction = "TENANT_DECOMMISSIONED";
        break;
      case "restore":
        updateData = { entitlement_status: "active" };
        auditAction = "TENANT_RESTORED";
        break;
    }

    const updated = await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: auditAction,
        entity_type: "Tenant",
        entity_id: tenantId,
        user_id: session.user.user_id,
        new_values: updateData as any,
      },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Failed to update tenant lifecycle:", error);
    return {
      success: false,
      error: "Failed to update tenant",
    };
  }
}

// SA-07: Homepage builder configuration
export async function getHomepageBuilderConfig(tenantId: number) {
  const session = await requireSuperadminSession();

  try {
    const portfolioHealth = await prisma.$queryRaw`
      SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        COUNT(l.loan_id) as total_loans,
        SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN l.status = 'delinquent' THEN 1 ELSE 0 END) as delinquent_loans,
        SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
        COALESCE(SUM(l.principal_amount), 0) as total_principal,
        COALESCE(AVG(l.interest_rate), 0) as avg_interest_rate
      FROM tenants t
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id AND l.status IN ('active', 'delinquent', 'defaulted')
      WHERE t.entitlement_status = 'active'
      GROUP BY t.tenant_id, t.name, t.slug
      ORDER BY total_principal DESC
    `;

    return {
      success: true,
      data: portfolioHealth,
    };
  } catch (error) {
    console.error("Failed to fetch portfolio health:", error);
    return {
      success: false,
      error: "Failed to load portfolio health",
    };
  }
}

// SA-15: Cross-tenant financial reports
export async function getCrossTenantFinancialReports(params: {
  startDate?: Date;
  endDate?: Date;
  region?: string;
}) {
  const session = await requireSuperadminSession();

  try {
    const dateFilter =
      params.startDate && params.endDate
        ? `AND l.applied_at BETWEEN '${params.startDate.toISOString()}' AND '${params.endDate.toISOString()}'`
        : "";

    const regionFilter = params.region
      ? `AND t.tenant_group_id = ${parseInt(params.region)}`
      : "";

    // Total disbursed vs repaid by region
    const disbursedVsRepaid = await prisma.$queryRaw`
      SELECT 
        COALESCE(t.region, 'Unassigned') as region,
        COUNT(l.loan_id) as total_loans,
        SUM(l.principal_amount) as total_disbursed,
        SUM(CASE WHEN l.status = 'paid' THEN l.total_payable ELSE 0 END) as total_repaid,
        SUM(CASE WHEN l.status IN ('active', 'delinquent') THEN l.balance_remaining ELSE 0 END) as outstanding_balance,
        AVG(l.interest_applied) as avg_interest_rate
      FROM tenants t
      LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id ${dateFilter}
      WHERE t.entitlement_status = 'active' ${regionFilter}
      GROUP BY tg.id, tg.name
      ORDER BY total_disbursed DESC
    `;

    // Default rates per region
    const defaultRatesByRegion = await prisma.$queryRaw`
      SELECT 
        COALESCE(t.region, 'Unassigned') as region,
        COUNT(l.loan_id) as total_loans,
        SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
        ROUND(
          CAST(SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) AS FLOAT) / 
          NULLIF(COUNT(l.loan_id), 0) * 100,
          2
        ) as default_rate_percent
      FROM tenants t
      LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id
      WHERE t.entitlement_status = 'active'
      GROUP BY tg.id, tg.name
      ORDER BY default_rate_percent DESC
    `;

    // Portfolio at risk
    const portfolioAtRisk = await prisma.$queryRaw`
      SELECT 
        COALESCE(t.region, 'Unassigned') as region,
        SUM(CASE WHEN l.status IN ('delinquent', 'defaulted') THEN l.balance_remaining ELSE 0 END) as at_risk_amount,
        SUM(l.balance_remaining) as total_outstanding,
        ROUND(
          CAST(SUM(CASE WHEN l.status IN ('delinquent', 'defaulted') THEN l.balance_remaining ELSE 0 END) AS FLOAT) / 
          NULLIF(SUM(l.balance_remaining), 0) * 100,
          2
        ) as risk_percentage
      FROM tenants t
      LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id AND l.status != 'paid'
      WHERE t.entitlement_status = 'active'
      GROUP BY tg.id, tg.name
      ORDER BY risk_percentage DESC
    `;

    return {
      success: true,
      data: {
        disbursedVsRepaid: disbursedVsRepaid || [],
        defaultRatesByRegion: defaultRatesByRegion || [],
        portfolioAtRisk: portfolioAtRisk || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch cross-tenant financial reports:", error);
    return {
      success: false,
      error: "Failed to load financial reports",
    };
  }
}

// SA-16: Tenant performance reports
export async function getTenantPerformanceReports(params: {
  tenantId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const session = await requireSuperadminSession();

  try {
    const tenantFilter = params.tenantId
      ? `AND t.tenant_id = ${params.tenantId}`
      : "";
    const dateFilter =
      params.startDate && params.endDate
        ? `AND l.applied_at BETWEEN '${params.startDate.toISOString()}' AND '${params.endDate.toISOString()}'`
        : "";

    // Growth trends - new members and loans over time
    const growthTrends = await prisma.$queryRaw`
      SELECT 
        t.tenant_id,
        t.name as tenant_name,
        DATE_FORMAT(u.created_at, '%Y-%m-01') as month,
        COUNT(DISTINCT u.user_id) as new_members,
        COUNT(DISTINCT l.loan_id) as new_loans
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.tenant_id AND u.role = 'member' ${dateFilter}
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id ${dateFilter}
      WHERE t.entitlement_status = 'active' ${tenantFilter}
      GROUP BY t.tenant_id, t.name, month
      ORDER BY month DESC
      LIMIT 100
    `;

    // Member acquisition and retention
    const memberAcquisition = await prisma.$queryRaw`
      SELECT 
        t.tenant_id,
        t.name as tenant_name,
        COUNT(DISTINCT u.user_id) as total_members,
        COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.user_id END) as active_members,
        COUNT(DISTINCT CASE WHEN u.status = 'pending' THEN u.user_id END) as pending_members,
        ROUND(
          CAST(COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.user_id END) AS FLOAT) / 
          NULLIF(COUNT(DISTINCT u.user_id), 0) * 100,
          2
        ) as activation_rate_percent
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.tenant_id AND u.role = 'member'
      WHERE t.entitlement_status = 'active' ${tenantFilter}
      GROUP BY t.tenant_id, t.name
      ORDER BY total_members DESC
    `;

    // Retention rates (members with active loans vs total)
    const retentionRates = await prisma.$queryRaw`
      SELECT 
        t.tenant_id,
        t.name as tenant_name,
        COUNT(DISTINCT u.user_id) as total_members,
        COUNT(DISTINCT l.user_id) as members_with_loans,
        ROUND(
          CAST(COUNT(DISTINCT l.user_id) AS FLOAT) / 
          NULLIF(COUNT(DISTINCT u.user_id), 0) * 100,
          2
        ) as loan_penetration_percent
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.tenant_id AND u.role = 'member'
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id AND l.status IN ('active', 'delinquent', 'paid')
      WHERE t.entitlement_status = 'active' ${tenantFilter}
      GROUP BY t.tenant_id, t.name
      ORDER BY loan_penetration_percent DESC
    `;

    return {
      success: true,
      data: {
        growthTrends: growthTrends || [],
        memberAcquisition: memberAcquisition || [],
        retentionRates: retentionRates || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch tenant performance reports:", error);
    return {
      success: false,
      error: "Failed to load performance reports",
    };
  }
}

// SA-17: Report exports and scheduling
export async function exportFinancialReportCSV(params: {
  reportType: "financial" | "performance" | "loans" | "members";
  startDate?: Date;
  endDate?: Date;
  region?: string;
  tenantId?: number;
}) {
  const session = await requireSuperadminSession();

  try {
    let query = "";
    let filename = "";

    switch (params.reportType) {
      case "financial":
        const dateFilterF =
          params.startDate && params.endDate
            ? `AND l.applied_at BETWEEN '${params.startDate.toISOString()}' AND '${params.endDate.toISOString()}'`
            : "";
        const regionFilterF = params.region
          ? `AND t.tenant_group_id = ${parseInt(params.region)}`
          : "";

        query = `
          SELECT 
            t.name as tenant_name,
            t.region as region,
            COUNT(l.loan_id) as total_loans,
            SUM(l.principal_amount) as total_disbursed,
            SUM(CASE WHEN l.status = 'paid' THEN l.total_payable ELSE 0 END) as total_repaid,
            SUM(CASE WHEN l.status IN ('active', 'delinquent') THEN l.balance_remaining ELSE 0 END) as outstanding,
            ROUND(CAST(SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(l.loan_id), 0) * 100, 2) as default_rate
          FROM tenants t
          LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
          LEFT JOIN loans l ON l.tenant_id = t.tenant_id ${dateFilterF}
          WHERE t.entitlement_status = 'active' ${regionFilterF}
          GROUP BY t.tenant_id, t.name, tg.name
          ORDER BY total_disbursed DESC
        `;
        filename = `financial-report-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "performance":
        const dateFilterP =
          params.startDate && params.endDate
            ? `AND l.applied_at BETWEEN '${params.startDate.toISOString()}' AND '${params.endDate.toISOString()}'`
            : "";
        const tenantFilterP = params.tenantId
          ? `AND t.tenant_id = ${params.tenantId}`
          : "";

        query = `
          SELECT 
            t.name as tenant_name,
            COUNT(DISTINCT u.user_id) as total_members,
            COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.user_id END) as active_members,
            COUNT(DISTINCT l.loan_id) as total_loans,
            COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.loan_id END) as active_loans,
            AVG(l.principal_amount) as avg_loan_amount
          FROM tenants t
          LEFT JOIN users u ON u.tenant_id = t.tenant_id AND u.role = 'member'
          LEFT JOIN loans l ON l.tenant_id = t.tenant_id ${dateFilterP}
          WHERE t.entitlement_status = 'active' ${tenantFilterP}
          GROUP BY t.tenant_id, t.name
          ORDER BY total_members DESC
        `;
        filename = `performance-report-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "loans":
        const dateFilterL =
          params.startDate && params.endDate
            ? `AND l.applied_at BETWEEN '${params.startDate.toISOString()}' AND '${params.endDate.toISOString()}'`
            : "";
        const tenantFilterL = params.tenantId
          ? `AND l.tenant_id = ${params.tenantId}`
          : "";

        query = `
          SELECT 
            l.loan_reference,
            t.name as tenant_name,
            u.username as borrower,
            lp.name as product,
            l.principal_amount,
            l.term_months,
            l.interest_applied,
            l.total_payable,
            l.balance_remaining,
            l.status,
            l.applied_at,
            l.approved_at
          FROM loans l
          JOIN tenants t ON t.tenant_id = l.tenant_id
          JOIN users u ON u.user_id = l.user_id
          JOIN loan_products lp ON lp.product_id = l.product_id
          WHERE 1=1 ${dateFilterL} ${tenantFilterL}
          ORDER BY l.applied_at DESC
          LIMIT 10000
        `;
        filename = `loans-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "members":
        const tenantFilterM = params.tenantId
          ? `AND u.tenant_id = ${params.tenantId}`
          : "";

        query = `
          SELECT 
            u.username,
            u.email,
            up.first_name,
            up.last_name,
            t.name as tenant_name,
            u.role,
            u.status,
            u.trust_score,
            u.interest_tier,
            u.created_at
          FROM users u
          LEFT JOIN user_profiles up ON up.user_id = u.user_id
          JOIN tenants t ON t.tenant_id = u.tenant_id
          WHERE u.role = 'member' ${tenantFilterM}
          ORDER BY u.created_at DESC
          LIMIT 10000
        `;
        filename = `members-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;
    }
    const result = await prisma.$queryRawUnsafe(query);
    // Generate CSV content
    const data = Array.isArray(result) ? result : [];
    if (data.length === 0) {
      return { success: false, error: "No data found for export" };
    }

    const headers = Object.keys(data[0] as object);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = (row as Record<string, unknown>)[header];
        const stringValue =
          value === null || value === undefined ? "" : String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = csvRows.join("\n");

    return {
      success: true,
      data: {
        filename,
        content: csvContent,
      },
    };
  } catch (error) {
    console.error("Failed to export report:", error);
    return {
      success: false,
      error: "Failed to export report",
    };
  }
}

// SA-19: Fraud and Risk Monitoring
export async function getFraudRiskMonitoring() {
  const session = await requireSuperadminSession();

  try {
    // Detect duplicate identities across tenants
    const duplicateIdentities = await prisma.$queryRaw`
      SELECT 
        up.phone,
        up.email,
        COUNT(DISTINCT up.user_id) as user_count,
        GROUP_CONCAT(DISTINCT t.name) as tenant_names,
        GROUP_CONCAT(DISTINCT CONCAT(up.first_name, ' ', up.last_name)) as full_names
      FROM user_profiles up
      JOIN tenants t ON t.tenant_id = up.tenant_id
      WHERE up.phone IS NOT NULL AND up.phone != ''
      GROUP BY up.phone, up.email
      HAVING COUNT(DISTINCT up.user_id) > 1
      ORDER BY user_count DESC
      LIMIT 50
    `;

    // Suspicious transaction patterns (large amounts, rapid loans)
    const suspiciousPatterns = await prisma.$queryRaw`
      SELECT 
        l.loan_id,
        l.loan_reference,
        t.name as tenant_name,
        u.username as borrower,
        l.principal_amount,
        l.status,
        l.applied_at,
        COUNT(l2.loan_id) as loan_count_same_week
      FROM loans l
      JOIN tenants t ON t.tenant_id = l.tenant_id
      JOIN users u ON u.user_id = l.user_id
      LEFT JOIN loans l2 ON l2.user_id = l.user_id 
        AND l2.tenant_id = l.tenant_id 
        AND l2.applied_at >= l.applied_at - INTERVAL 7 DAY
        AND l2.applied_at <= l.applied_at + INTERVAL 7 DAY
      WHERE l.principal_amount > 50000
      GROUP BY l.loan_id, l.loan_reference, t.name, u.username, l.principal_amount, l.status, l.applied_at
      HAVING COUNT(l2.loan_id) >= 3
      ORDER BY l.principal_amount DESC
      LIMIT 50
    `;

    // Cross-tenant fraud signals
    const crossTenantSignals = await prisma.$queryRaw`
      SELECT 
        up.first_name,
        up.last_name,
        up.phone,
        up.tin,
        COUNT(DISTINCT up.tenant_id) as tenant_count,
        GROUP_CONCAT(DISTINCT t.name) as tenant_names,
        GROUP_CONCAT(DISTINCT u.username SEPARATOR ', ') as usernames
      FROM user_profiles up
      JOIN users u ON u.user_id = up.user_id
      JOIN tenants t ON t.tenant_id = up.tenant_id
      WHERE (up.phone IS NOT NULL AND up.phone != '') 
        OR (up.tin IS NOT NULL AND up.tin != '')
      GROUP BY up.first_name, up.last_name, up.phone, up.tin
      HAVING COUNT(DISTINCT up.tenant_id) > 1
      ORDER BY tenant_count DESC
      LIMIT 50
    `;

    // High-risk tenants by default rate
    const highRiskTenants = await prisma.$queryRaw`
      SELECT 
        t.tenant_id,
        t.name as tenant_name,
        t.region,
        COUNT(l.loan_id) as total_loans,
        SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) as defaulted_loans,
        ROUND(
          CAST(SUM(CASE WHEN l.status = 'defaulted' THEN 1 ELSE 0 END) AS FLOAT) / 
          NULLIF(COUNT(l.loan_id), 0) * 100,
          2
        ) as default_rate_percent
      FROM tenants t
      LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
      LEFT JOIN loans l ON l.tenant_id = t.tenant_id
      WHERE t.entitlement_status = 'active'
      GROUP BY t.tenant_id, t.name, tg.name
      HAVING COUNT(l.loan_id) > 10
      ORDER BY default_rate_percent DESC
      LIMIT 20
    `;

    return {
      success: true,
      data: {
        duplicateIdentities: duplicateIdentities || [],
        suspiciousPatterns: suspiciousPatterns || [],
        crossTenantSignals: crossTenantSignals || [],
        highRiskTenants: highRiskTenants || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch fraud risk monitoring:", error);
    return {
      success: false,
      error: "Failed to load fraud risk data",
    };
  }
}

// SA-20: Community - Platform announcements (Superadmin can post global announcements)
export async function createPlatformAnnouncement(data: {
  title: string;
  content: string;
  targetAudience: "all" | "admins" | "lenders" | "members";
  priority: "low" | "normal" | "high" | "urgent";
  isPublished?: boolean;
}) {
  const session = await requireSuperadminSession();

  try {
    const announcement = await prisma.platformAnnouncement.create({
      data: {
        title: data.title,
        content: data.content,
        target_audience: data.targetAudience,
        priority: data.priority,
        created_by: session.user.user_id,
        is_published: data.isPublished ?? true,
        published_at: data.isPublished ? new Date() : null,
      },
    });

    // Send notifications to target audience when published
    if (data.isPublished !== false) {
      try {
        const targetUsers = await getTargetUsersForAnnouncement(data.targetAudience);
        for (const user of targetUsers) {
          await prisma.notification.create({
            data: {
              user_id: user.user_id,
              type: "tenant_announcement",
              title: data.title,
              body: data.content.substring(0, 200),
              action_url: "/agapay-pintig",
              channel: "in_app",
            },
          });
        }
      } catch (notifyErr) {
        console.error("Failed to send announcement notifications:", notifyErr);
      }
    }

    return {
      success: true,
      data: announcement,
    };
  } catch (error) {
    console.error("Failed to create platform announcement:", error);
    return {
      success: false,
      error: "Failed to create announcement",
    };
  }
}

async function getTargetUsersForAnnouncement(audience: string) {
  if (audience === "all") {
    return prisma.$queryRaw`
      SELECT user_id FROM users WHERE status = 'active'
    ` as Promise<{ user_id: number }[]>;
  } else if (audience === "admins") {
    return prisma.$queryRaw`
      SELECT user_id FROM users WHERE role IN ('operator', 'superadmin') AND status = 'active'
    ` as Promise<{ user_id: number }[]>;
  } else if (audience === "members") {
    return prisma.$queryRaw`
      SELECT user_id FROM users WHERE role = 'member' AND status = 'active'
    ` as Promise<{ user_id: number }[]>;
  }
  return [];
}

export async function publishPlatformAnnouncement(announcementId: number) {
  const session = await requireSuperadminSession();

  try {
    const announcement = await prisma.platformAnnouncement.update({
      where: { id: announcementId },
      data: {
        is_published: true,
        published_at: new Date(),
      },
    });

    return {
      success: true,
      data: announcement,
    };
  } catch (error) {
    console.error("Failed to publish platform announcement:", error);
    return {
      success: false,
      error: "Failed to publish announcement",
    };
  }
}

export async function getPlatformAnnouncements(limit = 20) {
  const session = await requireSuperadminSession();

  try {
    const announcements = await prisma.platformAnnouncement.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: announcements,
    };
  } catch (error) {
    console.error("Failed to fetch platform announcements:", error);
    return {
      success: false,
      error: "Failed to load announcements",
    };
  }
}

export async function deletePlatformAnnouncement(announcementId: number) {
  const session = await requireSuperadminSession();

  try {
    await prisma.platformAnnouncement.delete({
      where: { id: announcementId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return {
      success: false,
      error: "Failed to delete announcement",
    };
  }
}

// SA-21: Platform Configuration
export async function getPlatformConfig() {
  const session = await requireSuperadminSession();

  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM platform_config ORDER BY id DESC LIMIT 1
    `;
    const result = Array.isArray(config) ? config[0] : null;

    return {
      success: true,
      data: result
        ? {
            id: result.id,
            scoringWeights: result.scoring_weights,
            riskThresholds: result.risk_thresholds,
            defaultLoanConfig: result.default_loan_config,
            platformSettings: result.platform_settings,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch platform config:", error);
    return {
      success: false,
      error: "Failed to load platform config",
    };
  }
}

export async function updatePlatformConfig(data: {
  scoringWeights?: {
    repaymentBehavior?: number;
    savingsDiscipline?: number;
    loanUtilization?: number;
    membershipActivity?: number;
    peerValidation?: number;
  };
  riskThresholds?: {
    lowRisk?: number;
    mediumRisk?: number;
    highRisk?: number;
  };
  defaultLoanConfig?: {
    minAmount?: number;
    maxAmount?: number;
    defaultInterestRate?: number;
  };
  platformSettings?: {
    allowSelfRegistration?: boolean;
    requireIdentityVerification?: boolean;
    enableMentorship?: boolean;
    enableCommunity?: boolean;
  };
}) {
  const session = await requireSuperadminSession();

  try {
    const existing = await prisma.$queryRaw`
      SELECT id FROM platform_config ORDER BY id DESC LIMIT 1
    `;
    const existingArr = Array.isArray(existing) ? existing : [];

    if (existingArr.length > 0) {
      const existingId = existingArr[0].id;
      await prisma.$executeRaw`
        UPDATE platform_config SET 
          scoring_weights = ${JSON.stringify(data.scoringWeights)},
          risk_thresholds = ${JSON.stringify(data.riskThresholds)},
          default_loan_config = ${JSON.stringify(data.defaultLoanConfig)},
          platform_settings = ${JSON.stringify(data.platformSettings)},
          updated_at = NOW()
        WHERE id = ${existingId}
      `;

      const updated =
        await prisma.$queryRaw`SELECT * FROM platform_config WHERE id = ${existingId}`;

      return {
        success: true,
        data: Array.isArray(updated) ? updated[0] : null,
      };
    } else {
      await prisma.$executeRaw`
        INSERT INTO platform_config (scoring_weights, risk_thresholds, default_loan_config, platform_settings, created_at, updated_at)
        VALUES (
          ${JSON.stringify(data.scoringWeights)},
          ${JSON.stringify(data.riskThresholds)},
          ${JSON.stringify(data.defaultLoanConfig)},
          ${JSON.stringify(data.platformSettings)},
          NOW(),
          NOW()
        )
      `;

      const created =
        await prisma.$queryRaw`SELECT * FROM platform_config ORDER BY id DESC LIMIT 1`;

      return {
        success: true,
        data: Array.isArray(created) ? created[0] : null,
      };
    }
  } catch (error) {
    console.error("Failed to update platform config:", error);
    return {
      success: false,
      error: "Failed to update platform config",
    };
  }
}

// SA-22: Subscription and Billing
export async function getSubscriptionPlans() {
  const session = await requireSuperadminSession();

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { tier_name: "asc" },
    });

    return {
      success: true,
      data: plans,
    };
  } catch (error) {
    console.error("Failed to fetch subscription plans:", error);
    return {
      success: false,
      error: "Failed to load subscription plans",
    };
  }
}

export async function createSubscriptionPlan(data: {
  tierName: string;
  priceMonthly: number;
  priceAnnually: number;
  maxMembers: number;
  maxStorageMb: number;
  features: string[];
  isAddon?: boolean;
  tenantPrice?: number;
  tenantStorage?: number;
  description?: string;
}) {
  const session = await requireSuperadminSession();

  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        tier_name: data.tierName,
        price_monthly: data.priceMonthly,
        price_annually: data.priceAnnually,
        max_members: data.maxMembers,
        max_storage_mb: data.maxStorageMb,
        features: data.features,
        is_addon: data.isAddon || false,
        tenant_price: data.tenantPrice,
        tenant_storage: data.tenantStorage,
      },
    });

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error("Failed to create subscription plan:", error);
    return {
      success: false,
      error: "Failed to create subscription plan",
    };
  }
}

export async function updateSubscriptionPlan(
  planId: number,
  data: {
    tierName?: string;
    priceMonthly?: number;
    priceAnnually?: number;
    maxMembers?: number;
    maxStorageMb?: number;
    features?: string[];
  },
) {
  const session = await requireSuperadminSession();

  try {
    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        tier_name: data.tierName,
        price_monthly: data.priceMonthly,
        price_annually: data.priceAnnually,
        max_members: data.maxMembers,
        max_storage_mb: data.maxStorageMb,
        features: data.features,
      },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Failed to update subscription plan:", error);
    return {
      success: false,
      error: "Failed to update subscription plan",
    };
  }
}

export async function getTenantBillingInfo(tenantId: number) {
  const session = await requireSuperadminSession();

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
      include: {
        tenantSubscription: {
          include: { plan: true },
        },
      },
    });

    const invoices = await prisma.billingInvoice.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
      take: 12,
    });

    return {
      success: true,
      data: {
        tenant,
        invoices,
      },
    };
  } catch (error) {
    console.error("Failed to fetch tenant billing info:", error);
    return {
      success: false,
      error: "Failed to load billing info",
    };
  }
}

// SA-23: AI Configuration
export async function getAIConfig() {
  const session = await requireSuperadminSession();

  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM ai_config ORDER BY id DESC LIMIT 1
    `;
    const result = Array.isArray(config) ? config[0] : null;

    return {
      success: true,
      data: result
        ? {
            id: result.id,
            snapshotPrompts: result.snapshot_prompts,
            riskSensitivity: result.risk_sensitivity,
            notificationSettings: result.notification_settings,
            analysisConfig: result.analysis_config,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch AI config:", error);
    return {
      success: false,
      error: "Failed to load AI config",
    };
  }
}

export async function updateAIConfig(data: {
  snapshotPrompts?: {
    overview?: string;
    portfolio?: string;
    risk?: string;
    financial?: string;
  };
  riskSensitivity?: "low" | "medium" | "high";
  notificationSettings?: {
    enableRiskAlerts?: boolean;
    enablePortfolioInsights?: boolean;
    enableAutomatedReports?: boolean;
    reportFrequency?: "daily" | "weekly" | "monthly";
  };
  analysisConfig?: {
    maxLoanAmountToAnalyze?: number;
    minDataPointsForInsights?: number;
    anomalyDetectionThreshold?: number;
  };
}) {
  const session = await requireSuperadminSession();

  try {
    // Check if config exists
    const existing = await prisma.$queryRaw`
      SELECT id FROM ai_config ORDER BY id DESC LIMIT 1
    `;
    const existingArr = Array.isArray(existing) ? existing : [];

    if (existingArr.length > 0) {
      const existingId = existingArr[0].id;
      await prisma.$executeRaw`
        UPDATE ai_config SET 
          snapshot_prompts = ${JSON.stringify(data.snapshotPrompts)},
          risk_sensitivity = ${data.riskSensitivity},
          notification_settings = ${JSON.stringify(data.notificationSettings)},
          analysis_config = ${JSON.stringify(data.analysisConfig)},
          updated_at = NOW()
        WHERE id = ${existingId}
      `;

      const updated =
        await prisma.$queryRaw`SELECT * FROM ai_config WHERE id = ${existingId}`;

      return {
        success: true,
        data: Array.isArray(updated) ? updated[0] : null,
      };
    } else {
      await prisma.$executeRaw`
        INSERT INTO ai_config (snapshot_prompts, risk_sensitivity, notification_settings, analysis_config, created_at, updated_at)
        VALUES (
          ${JSON.stringify(data.snapshotPrompts)},
          ${data.riskSensitivity},
          ${JSON.stringify(data.notificationSettings)},
          ${JSON.stringify(data.analysisConfig)},
          NOW(),
          NOW()
        )
      `;

      const created =
        await prisma.$queryRaw`SELECT * FROM ai_config ORDER BY id DESC LIMIT 1`;

      return {
        success: true,
        data: Array.isArray(created) ? created[0] : null,
      };
    }
  } catch (error) {
    console.error("Failed to update AI config:", error);
    return {
      success: false,
      error: "Failed to update AI config",
    };
  }
}

// Superadmin: Get all tenant conversations for chat
export async function getAllTenantConversations() {
  try {
    const session = await requireSuperadminSession();
    const conversations = await prisma.conversation.findMany({
      where: {
        type: "operator_room",
      },
      include: {
        tenant: {
          select: { name: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updated_at: "desc" },
      take: 50,
    });
    return {
      success: true,
      data: conversations.map((c: any) => ({
        id: c.id,
        title: c.title || `Operator Room - ${c.tenant?.name || "Unknown"}`,
        messageCount: c._count.messages,
        updatedAt: c.updated_at,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch tenant conversations:", error);
    return {
      success: false,
      error: "Failed to load conversations",
    };
  }
}

// SA-24: Email/SMS Templates
export async function getNotificationTemplates() {
  const session = await requireSuperadminSession();

  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("Failed to fetch notification templates:", error);
    return {
      success: false,
      error: "Failed to load templates",
    };
  }
}

export async function createNotificationTemplate(data: {
  name: string;
  type: "email" | "sms" | "push";
  subject?: string;
  body: string;
  variables: string[];
  category: string;
}) {
  const session = await requireSuperadminSession();

  try {
    const template = await prisma.notificationTemplate.create({
      data: {
        name: data.name,
        type: data.type,
        subject: data.subject,
        body: data.body,
        variables: data.variables as any,
        category: data.category,
      },
    });

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Failed to create notification template:", error);
    return {
      success: false,
      error: "Failed to create template",
    };
  }
}

export async function updateNotificationTemplate(
  templateId: number,
  data: {
    name?: string;
    subject?: string;
    body?: string;
    variables?: string[];
    category?: string;
    isActive?: boolean;
  },
) {
  const session = await requireSuperadminSession();

  try {
    const updated = await prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables as any,
        category: data.category,
        is_active: data.isActive,
      },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Failed to update notification template:", error);
    return {
      success: false,
      error: "Failed to update template",
    };
  }
}

export async function broadcastPlatformMessage(data: {
  subject: string;
  message: string;
  targetAudience: string;
  channels: string[];
}) {
  const session = await requireSuperadminSession();

  try {
    // Get target users based on audience
    let users: { user_id: number; email?: string; phone?: string }[] = [];

    if (data.targetAudience === "all") {
      users = await prisma.$queryRaw`
        SELECT u.user_id, u.email, up.phone
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.user_id
        WHERE u.status = 'active'
      `;
    } else if (data.targetAudience === "admins") {
      users = await prisma.$queryRaw`
        SELECT u.user_id, u.email, up.phone
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.user_id
        WHERE u.role IN ('admin', 'superadmin') AND u.status = 'active'
      `;
    } else if (data.targetAudience === "lenders") {
      users = await prisma.$queryRaw`
        SELECT u.user_id, u.email, up.phone
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.user_id
        WHERE u.role = 'operator' AND u.status = 'active'
      `;
    } else if (data.targetAudience === "members") {
      users = await prisma.$queryRaw`
        SELECT u.user_id, u.email, up.phone
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.user_id
        WHERE u.role = 'member' AND u.status = 'active'
      `;
    }

    // Create notifications for each user using raw SQL to avoid type issues
    const userIds = (users as { user_id: number }[]).map(
      (user) => user.user_id,
    );

    if (userIds.length > 0) {
      for (const uid of userIds) {
        await prisma.$executeRaw`
          INSERT INTO notifications (id, user_id, type, title, body, is_read, created_at)
          VALUES (
            UUID(),
            ${uid},
            'tenant_announcement',
            ${data.subject},
            ${data.message},
            false,
            NOW()
          )
        `;
      }
    }

    return {
      success: true,
      data: {
        recipientCount: userIds.length,
      },
    };
  } catch (error) {
    console.error("Failed to broadcast message:", error);
    return {
      success: false,
      error: "Failed to broadcast message",
    };
  }
}

// SA-25: Security settings
export async function getSecuritySettings() {
  const session = await requireSuperadminSession();

  try {
    const settings = await prisma.$queryRaw`
      SELECT * FROM security_settings ORDER BY id DESC LIMIT 1
    `;
    const result = Array.isArray(settings) ? settings[0] : null;

    return {
      success: true,
      data: result
        ? {
            id: result.id,
            passwordPolicy: result.password_policy,
            sessionSettings: result.session_settings,
            twoFactorRequired: result.two_factor_required,
            twoFactorRoles: result.two_factor_roles,
            ipWhitelist: result.ip_whitelist,
            allowedDomains: result.allowed_domains,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch security settings:", error);
    return {
      success: false,
      error: "Failed to load security settings",
    };
  }
}

export async function updateSecuritySettings(data: {
  passwordPolicy?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
    expiryDays?: number;
  };
  sessionSettings?: {
    maxConcurrentSessions?: number;
    sessionTimeoutMinutes?: number;
    rememberDeviceDays?: number;
  };
  twoFactorRequired?: boolean;
  twoFactorRoles?: string[];
  ipWhitelist?: string[];
  allowedDomains?: string[];
}) {
  const session = await requireSuperadminSession();

  try {
    const existing = await prisma.$queryRaw`
      SELECT id FROM security_settings ORDER BY id DESC LIMIT 1
    `;
    const existingArr = Array.isArray(existing) ? existing : [];

    if (existingArr.length > 0) {
      const existingId = existingArr[0].id;
      await prisma.$executeRaw`
        UPDATE security_settings SET 
          password_policy = ${JSON.stringify(data.passwordPolicy)},
          session_settings = ${JSON.stringify(data.sessionSettings)},
          two_factor_required = ${data.twoFactorRequired},
          two_factor_roles = ${JSON.stringify(data.twoFactorRoles)},
          ip_whitelist = ${JSON.stringify(data.ipWhitelist)},
          allowed_domains = ${JSON.stringify(data.allowedDomains)},
          updated_at = NOW()
        WHERE id = ${existingId}
      `;

      const updated =
        await prisma.$queryRaw`SELECT * FROM security_settings WHERE id = ${existingId}`;

      return {
        success: true,
        data: Array.isArray(updated) ? updated[0] : null,
      };
    } else {
      await prisma.$executeRaw`
        INSERT INTO security_settings (password_policy, session_settings, two_factor_required, two_factor_roles, ip_whitelist, allowed_domains, created_at, updated_at)
        VALUES (
          ${JSON.stringify(data.passwordPolicy)},
          ${JSON.stringify(data.sessionSettings)},
          ${data.twoFactorRequired || false},
          ${JSON.stringify(data.twoFactorRoles || ["superadmin", "admin"])},
          ${JSON.stringify(data.ipWhitelist)},
          ${JSON.stringify(data.allowedDomains)},
          NOW(),
          NOW()
        )
      `;

      const created =
        await prisma.$queryRaw`SELECT * FROM security_settings ORDER BY id DESC LIMIT 1`;

      return {
        success: true,
        data: Array.isArray(created) ? created[0] : null,
      };
    }
  } catch (error) {
    console.error("Failed to update security settings:", error);
    return {
      success: false,
      error: "Failed to update security settings",
    };
  }
}

// Superadmin Aggregated Reporting & Risk Module Data

export async function getSuperadminReports() {
  await requireSuperadminSession();

  try {
    const totalTenants = await prisma.tenant.count({
      where: { is_active: true },
    });

    // Use raw queries wherever possible to avoid schema-scope issues
    const totalUsersRes = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) as count FROM users WHERE role = 'member'`;
    const totalUsers = Number(totalUsersRes[0]?.count || 0);

    const totalSavingsRes =
      await prisma.$queryRaw<{ total: number }[]>`SELECT COALESCE(SUM(balance), 0) as total FROM savings_accounts`;
    const totalSavingsVolume = Number(totalSavingsRes[0]?.total || 0);

    const loansAggRes = await prisma.$queryRaw<
      { total_principal: number; total_outstanding: number }[]
    >`
      SELECT 
        COALESCE(SUM(principal_amount), 0) as total_principal,
        COALESCE(SUM(balance_remaining), 0) as total_outstanding
      FROM loans
      WHERE status IN ('active', 'defaulted')
    `;
    const totalActiveLoanVolume = Number(
      loansAggRes[0]?.total_principal || 0,
    );
    const totalOutstandingBalance = Number(
      loansAggRes[0]?.total_outstanding || 0,
    );

    const activeLoansRes = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) as count FROM loans WHERE status = 'active'`;
    const activeLoansCount = Number(activeLoansRes[0]?.count || 0);

    // Performance Trends (Last 6 Months)
    const growthTrends = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-01') as month,
        COUNT(tenant_id) as new_tenants
      FROM tenants
      WHERE created_at >= NOW() - INTERVAL 6 MONTH
      GROUP BY month
      ORDER BY month ASC
    `;

    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-01') as month,
        COUNT(user_id) as new_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL 6 MONTH AND role = 'member'
      GROUP BY month
      ORDER BY month ASC
    `;

    // Member Acquisition
    const activeMembersRes =
      await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role = 'member'`;
    const pendingMembersRes =
      await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM users WHERE status = 'pending' AND role = 'member'`;

    const retention = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT u.user_id) as total_members,
        COUNT(DISTINCT l.user_id) as members_with_loans
      FROM users u
      LEFT JOIN loans l ON l.user_id = u.user_id AND l.status IN ('active', 'paid')
      WHERE u.role = 'member'
    `;

    return {
      success: true,
      data: {
        totalTenants,
        totalUsers,
        totalSavingsVolume,
        totalActiveLoanVolume,
        totalOutstandingBalance,
        activeLoansCount,
        performance: {
          growthTrends: Array.isArray(growthTrends) ? growthTrends : [],
          userGrowth: Array.isArray(userGrowth) ? userGrowth : [],
          acquisition: {
            active: Number(activeMembersRes[0]?.count || 0),
            pending: Number(pendingMembersRes[0]?.count || 0),
          },
          retention: Array.isArray(retention)
            ? retention[0]
            : { total_members: 0, members_with_loans: 0 },
        },
      },
    };
  } catch (error) {
    console.error("Failed to load superadmin reports:", error);
    return { success: false, error: "Failed to load superadmin reports." };
  }
}

export async function getSuperadminFraudMetrics() {
  await requireSuperadminSession();

  try {
    const delinquentLoansRes = await prisma.$queryRaw<{ balance: number; count: number }[]>`SELECT COALESCE(SUM(balance_remaining), 0) as balance, COUNT(*) as count FROM loans WHERE status = 'defaulted'`;
    const delinquentLoans = {
      _sum: { balance_remaining: delinquentLoansRes[0]?.balance || 0 },
      _count: delinquentLoansRes[0]?.count || 0,
    };

    // Recent critical audit logs
    const suspiciousActivities = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "DECOMMISSION_TENANT",
            "SYSTEM_ERROR",
            "SUSPICIOUS_LOGIN",
            "FAILED_LOGIN",
            "KYC_REJECTED",
            "FRAUD_FLAGGED",
          ],
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        tenant: { select: { name: true } },
        user: { select: { username: true } },
      },
    });

    const pendingVerifications = await prisma.userDocument.count({
      where: { verification_status: "pending" },
    });

    const rejectedVerifications = await prisma.userDocument.count({
      where: { verification_status: "rejected" },
    });

    return {
      success: true,
      data: {
        delinquentVolume: Number(delinquentLoans._sum?.balance_remaining || 0),
        delinquentCount: delinquentLoans._count || 0,
        pendingVerifications,
        rejectedVerifications,
        suspiciousActivities,
      },
    };
  } catch (error) {
    console.error("Failed to load fraud metrics:", error);
    return { success: false, error: "Failed to load fraud metrics." };
  }
}
