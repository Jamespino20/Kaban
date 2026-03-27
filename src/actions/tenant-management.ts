"use server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

// 0. Get List of Regions (Public for Registration)
export async function getRegions() {
  try {
    const regions = await prisma.tenantGroup.findMany({
      where: { is_active: true },
      select: { id: true, name: true, reg_code: true },
      orderBy: { name: "asc" },
    });
    return regions;
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return [];
  }
}

// 0.5 Get Tenants by Region (Public for Registration)
export async function getTenantsByRegion(regionId: number) {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { tenant_group_id: regionId, is_active: true },
      select: { tenant_id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
    return tenants;
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return [];
  }
}

// 1. Get List of Tenants
export async function getTenants() {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    return [];
  }

  try {
    const tenants = await (prisma.tenant as any).findMany({
      include: {
        tenant_group: true,
        _count: {
          select: { users: true, loans: true, savings: true },
        },
        decommissioned_backups: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return tenants;
  } catch {
    // Fallback if adapter doesn't support includes
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: "asc" },
    });
    return tenants.map((t: any) => ({
      ...t,
      tenant_group: null,
      _count: { users: 0, loans: 0, savings: 0 },
      decommissioned_backups: [],
    }));
  }
}

// 2. Decommission Branch
export async function decommissionBranch(tenantId: number) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  try {
    // Transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Mark tenant as inactive

      const tenant = await tx.tenant.update({
        where: { tenant_id: tenantId },
        data: { is_active: false },
      });

      // 2. Extract Full Transaction History for Backup
      const users = await tx.user.findMany({
        where: { tenant_id: tenantId },
        include: {
          profile: true,
          loans: {
            include: {
              payments: true,
              schedules: true,
            },
          },
          savings_accounts: {
            include: {
              transactions: true,
            },
          },
        },
      });

      // 3. Generate CSV Content
      let csvContent =
        "Member Code,Name,Role,Status,Total Loans,Total Savings Balance\n";
      users.forEach((u: any) => {
        const name = u.profile
          ? `${u.profile.first_name} ${u.profile.last_name}`
          : "Unknown";
        const totalSavings = u.savings_accounts.reduce(
          (sum: number, acc: any) => sum + Number(acc.balance),
          0,
        );
        csvContent += `${u.member_code || "N/A"},"${name}",${u.role},${u.status},${u.loans.length},${totalSavings}\n`;
        // In a real banking CSV, we would iterate through `payments` and `transactions` deeply.
        // For this automated snapshot, we aggregate the high-level metrics.
      });

      // 4. Save CSV locally
      const backupDir = path.join(process.cwd(), "public", "backups");
      await fs.mkdir(backupDir, { recursive: true });
      const fileName = `backup_${tenant.slug}_${Date.now()}.csv`;
      const filePath = path.join(backupDir, fileName);

      await fs.writeFile(filePath, csvContent);
      const fileUrl = `/backups/${fileName}`;

      // 5. Create Metadata Record
      const backupRecord = await tx.decommissionedBackup.create({
        data: {
          tenant_id: tenantId,
          file_url: fileUrl,
        },
      });

      // 6. Log Audit
      await tx.auditLog.create({
        data: {
          action: "DECOMMISSION_BRANCH",
          entity_type: "Tenant",
          entity_id: tenantId,
          user_id: parseInt(session.user.id),
          new_values: { is_active: false, backup_url: fileUrl },
        },
      });

      return { tenant, backup: backupRecord };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Decommissioning failed:", error);
    return {
      success: false,
      error: "Failed to decommission branch and generate backup.",
    };
  }
}

// 3. Create Region (Superadmin)
export async function createRegion(name: string, regCode: string) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  try {
    const region = await prisma.tenantGroup.create({
      data: { name, reg_code: regCode },
    });

    return { success: true, data: region };
  } catch (error) {
    console.error("Failed to create region:", error);
    return { success: false, error: "Failed to create region." };
  }
}

// 4. Create Branch (Superadmin)
export async function createBranch(
  name: string,
  slug: string,
  groupId: number,
) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  try {
    const branch = await prisma.tenant.create({
      data: { name, slug, tenant_group_id: groupId },
    });

    return { success: true, data: branch };
  } catch (error) {
    console.error("Failed to create branch:", error);
    return { success: false, error: "Failed to create branch." };
  }
}

// 5. Get Audit Logs (Admin/Superadmin)
export async function getAuditLogs(tenantId?: number) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "superadmin" && session.user.role !== "admin")
  ) {
    throw new Error("Unauthorized");
  }

  try {
    const logs = await prisma.auditLog.findMany({
      where: session.user.role === "superadmin" ? {} : { tenant_id: tenantId },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });
    return (logs as any).map((log: any) => ({
      ...log,
      username: log.user?.username || "System",
    }));
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}
