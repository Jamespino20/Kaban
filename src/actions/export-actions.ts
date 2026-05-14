"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";

type CsvRow = (string | number | boolean | null | undefined)[];

function buildCsv(rows: CsvRow[]): string {
  return rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? "");
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\n");
}

export async function exportRestrictedModuleData(moduleName: string) {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    throw new Error("No tenant context. Please log in as a tenant user.");
  }

  const rows: CsvRow[] = [];

  switch (moduleName) {
    case "E-Wallet": {
      const transactions = await prisma.$withTenant(tenantId, async (tx: any) => {
        return tx.savingsTransaction.findMany({
          where: { tenant_id: tenantId },
          include: {
            account: {
              include: { user: { select: { username: true, member_code: true } } },
            },
          },
          orderBy: { processed_at: "desc" },
          take: 2000,
        });
      });
      rows.push(["Transaction ID", "Member Code", "Username", "Account Type", "Transaction Type", "Amount", "Status", "Date"]);
      for (const tx of transactions) {
        rows.push([
          tx.transaction_id,
          tx.account.user.member_code ?? "",
          tx.account.user.username,
          tx.account.account_type,
          tx.transaction_type,
          Number(tx.amount).toFixed(2),
          tx.status,
          tx.processed_at.toISOString(),
        ]);
      }
      break;
    }

    case "Loaning Node":
    case "Loan Application":
    case "My Loans & Repayment": {
      const loans = await prisma.$withTenant(tenantId, async (tx: any) => {
        return tx.loan.findMany({
          where: { tenant_id: tenantId },
          include: {
            user: { select: { username: true, member_code: true } },
            product: { select: { name: true } },
          },
          orderBy: { applied_at: "desc" },
          take: 2000,
        });
      });
      rows.push(["Loan Ref", "Member Code", "Username", "Product", "Principal", "Balance Remaining", "Status", "Applied At", "Approved At"]);
      for (const loan of loans) {
        rows.push([
          loan.loan_reference,
          loan.user.member_code ?? "",
          loan.user.username,
          loan.product.name,
          Number(loan.principal_amount).toFixed(2),
          Number(loan.balance_remaining).toFixed(2),
          loan.status,
          loan.applied_at.toISOString(),
          loan.approved_at?.toISOString() ?? "",
        ]);
      }
      break;
    }

    case "Community": {
      const conversations = await prisma.$withTenant(tenantId, async (tx: any) => {
        return tx.conversation.findMany({
          where: { tenant_id: tenantId },
          include: {
            creator: { select: { username: true } },
            _count: { select: { messages: true, participants: true } },
          },
          orderBy: { created_at: "desc" },
          take: 2000,
        });
      });
      rows.push(["Conversation ID", "Type", "Title", "Creator", "Participants", "Messages", "Created At"]);
      for (const conv of conversations) {
        rows.push([
          conv.id,
          conv.type,
          conv.title ?? "Untitled",
          conv.creator?.username ?? "System",
          conv._count.participants,
          conv._count.messages,
          conv.created_at.toISOString(),
        ]);
      }
      break;
    }

    case "Audit Logs": {
      const logs = await prisma.$withTenant(tenantId, async (tx: any) => {
        return tx.auditLog.findMany({
          where: { tenant_id: tenantId },
          include: { user: { select: { username: true } } },
          orderBy: { created_at: "desc" },
          take: 2000,
        });
      });
      rows.push(["Log ID", "Date", "User", "Role", "Module", "Action", "Category", "Severity", "Entity Type", "Entity ID"]);
      for (const log of logs) {
        rows.push([
          log.log_id,
          log.created_at.toISOString(),
          log.user?.username ?? "System",
          log.actor_role ?? "",
          log.module,
          log.action,
          log.action_category,
          log.severity,
          log.entity_type,
          log.entity_id ?? "",
        ]);
      }
      break;
    }

    case "Analytics Module": {
      const [usersCount, loansCount, txCount, activeLoans, pendingLoans] = await prisma.$withTenant(tenantId, async (tx: any) => {
        return Promise.all([
          tx.user.count({ where: { tenant_id: tenantId } }),
          tx.loan.count({ where: { tenant_id: tenantId } }),
          tx.savingsTransaction.count({ where: { tenant_id: tenantId } }),
          tx.loan.count({ where: { tenant_id: tenantId, status: "active" } }),
          tx.loan.count({ where: { tenant_id: tenantId, status: "pending" } }),
        ]);
      });
      rows.push(["Metric", "Value"]);
      rows.push(["Total Users", usersCount]);
      rows.push(["Total Loans", loansCount]);
      rows.push(["Active Loans", activeLoans]);
      rows.push(["Pending Loans", pendingLoans]);
      rows.push(["Total Wallet Transactions", txCount]);
      break;
    }

    case "Content & Branding": {
      const tenant = await prisma.tenant.findUnique({
        where: { tenant_id: tenantId },
        select: { name: true, slug: true, brand_color: true, accent_color: true, font_pairing: true },
      });
      rows.push(["Setting", "Value"]);
      rows.push(["Tenant Name", tenant?.name ?? ""]);
      rows.push(["Tenant Slug", tenant?.slug ?? ""]);
      rows.push(["Brand Color", tenant?.brand_color ?? "Not set"]);
      rows.push(["Accent Color", tenant?.accent_color ?? "Not set"]);
      rows.push(["Font Pairing", tenant?.font_pairing ?? "inter_outfit"]);
      break;
    }

    default: {
      rows.push(["Info"]);
      rows.push([`No historical data export available for module: ${moduleName}`]);
    }
  }

  return { success: true, csvContent: buildCsv(rows) };
}
