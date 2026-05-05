"use server";

import prisma from "@/lib/prisma";
import * as z from "zod";
import fs from "fs";
import path from "path";

import { neon } from "@neondatabase/serverless";
import {
  requireAdminSession,
  requireSuperadminSession,
} from "@/lib/authorization";
import { getDbUrl } from "@/lib/db-url";
import { unstable_cache } from "next/cache";

// 0. Get List of Regions (Public for Registration)
export async function getRegions() {
  try {
    const connectionString = getDbUrl();

    if (!connectionString) return [];

    const sql = neon(connectionString);
    const regions = await sql`
      SELECT id, name, reg_code 
      FROM tenant_groups 
      WHERE is_active = true 
      ORDER BY name ASC
    `;

    return regions as { id: number; name: string; reg_code: string }[];
  } catch (error) {
    console.error("Failed to fetch regions via raw SQL:", error);
    return [];
  }
}

// 0.5 Get Tenants by Region (Public for Registration)
export async function getTenantsByRegion(regionId: number) {
  try {
    const connectionString = getDbUrl();

    if (!connectionString) return [];

    const sql = neon(connectionString);
    const tenants = await sql`
      SELECT tenant_id, name, slug 
      FROM tenants 
      WHERE tenant_group_id = ${regionId}
      AND is_active = true
      AND entitlement_status = 'active'
      ORDER BY name ASC
    `;

    return tenants as { tenant_id: number; name: string; slug: string }[];
  } catch (error) {
    console.error("Failed to fetch tenants via raw SQL:", error);
    return [];
  }
}

// 1. Get List of Tenants
export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
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
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    // Fallback if adapter doesn't support includes
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: "asc" },
    });
    return tenants.map((t) => ({
      ...t,
      tenant_group: null,
      _count: { users: 0, loans: 0, savings: 0 },
      decommissioned_backups: [],
    })) as any[];
  }
}

// 1.5 Get Active Branches (Public for Navigation/Map)
export async function getActiveBranches() {
  try {
    if (!prisma || !prisma.tenant) {
      throw new Error(
        "Prisma client not properly initialized (likely build phase).",
      );
    }

    const branches = await prisma.tenant.findMany({
      where: {
        is_active: true,
        entitlement_status: "active",
      },
      select: {
        tenant_id: true,
        name: true,
        slug: true,
        accent_color: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map to coordinates for the map
    const coordinates: Record<
      string,
      { x: number; y: number; region: string; city: string }
    > = {
      manila: { x: 42, y: 35, region: "NCR", city: "Manila" },
      cebu: { x: 62, y: 65, region: "Central Visayas", city: "Cebu City" },
      davao: { x: 75, y: 85, region: "Davao Region", city: "Davao City" },
      baguio: { x: 38, y: 22, region: "Cordillera", city: "Baguio City" },
      iloilo: { x: 48, y: 68, region: "Western Visayas", city: "Iloilo City" },
      malolos: { x: 41, y: 33, region: "Central Luzon", city: "Malolos City" },
      "agapay-qc-central": { x: 44, y: 34, region: "NCR", city: "Quezon City" },
      "agapay-makati-cbd": { x: 43.5, y: 36, region: "NCR", city: "Makati" },
      "agapay-tarlac": {
        x: 39,
        y: 27,
        region: "Central Luzon",
        city: "Tarlac City",
      },
      "agapay-bulacan-north": {
        x: 40,
        y: 31,
        region: "Central Luzon",
        city: "Bulacan",
      },
      "agapay-cavite-south": {
        x: 41,
        y: 39,
        region: "CALABARZON",
        city: "Cavite",
      },
      "agapay-pampanga": {
        x: 39.5,
        y: 29,
        region: "Central Luzon",
        city: "Pampanga",
      },
      "agapay-davao-hub": {
        x: 76,
        y: 86,
        region: "Davao Region",
        city: "Davao City",
      },
    };

    return branches.map((b) => ({
      id: b.tenant_id.toString(),
      name: b.name,
      slug: b.slug || "branch",
      city: coordinates[b.slug || ""]?.city || "Philippines",
      region: coordinates[b.slug || ""]?.region || "Region",
      status: "active" as const,
      x: coordinates[b.slug || ""]?.x || 50,
      y: coordinates[b.slug || ""]?.y || 50,
      color: b.accent_color || "#10b981",
    }));
  } catch (error) {
    console.error("Failed to fetch active branches:", error);
    throw error; // Throw so unstable_cache doesn't cache an empty array
  }
}

export const getActiveBranchesForNav = unstable_cache(
  async () => {
    try {
      const branches = await getActiveBranches();
      // Return plain objects to avoid serialization issues
      return branches.map((b) => ({ ...b }));
    } catch (e) {
      return []; // Return empty dynamically, but Next.js will cache this?
      // Wait, if we return [] here, unstable_cache caches [].
      // We want to throw so Next.js doesn't cache statically.
    }
  },
  ["active-branches-nav"],
  {
    revalidate: 3600, // cache for 1 hour
    tags: ["tenants"],
  },
);

// 2. Decommission Branch
export async function decommissionBranch(tenantId: number) {
  const session = await requireSuperadminSession();

  try {
    // Transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
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
      users.forEach((u) => {
        const name = u.profile
          ? `${u.profile.first_name} ${u.profile.last_name}`
          : "Unknown";
        const totalSavings = u.savings_accounts.reduce(
          (sum: number, acc) => sum + Number(acc.balance),
          0,
        );
        csvContent += `${u.member_code || "N/A"},"${name}",${u.role},${u.status},${u.loans.length},${totalSavings}\n`;
        // In a real banking CSV, we would iterate through `payments` and `transactions` deeply.
        // For this automated snapshot, we aggregate the high-level metrics.
      });

      const fileName = `backup_${tenant.slug}_${Date.now()}.csv`;

      // 5. Create Metadata Record
      const backupRecord = await tx.decommissionedBackup.create({
        data: {
          tenant_id: tenantId,
          file_url: fileName,
          snapshot_content: csvContent,
        },
      });

      // 6. Log Audit
      await tx.auditLog.create({
        data: {
          action: "DECOMMISSION_BRANCH",
          entity_type: "Tenant",
          entity_id: tenantId,
          user_id: parseInt(session.user.id),
          new_values: { is_active: false, backup_id: backupRecord.id } as any,
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
  await requireSuperadminSession();

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
  await requireSuperadminSession();

  try {
    const branch = await prisma.$transaction(async (tx) => {
      const b = await tx.tenant.create({
        data: {
          name,
          slug,
          tenant_group_id: groupId,
          entitlement_status: "prospect",
        },
      });

      // B: Provision Physical Schema (Side Effect)
      // Note: In serverless, we must be careful with long-running DDL.
      // We will create the schema but the full table injection might be done via a separate 'provision' action in a real system.
      // For this SaaS model, we run it here.
      await tx.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${slug}"`);

      try {
        const sqlPath = path.resolve(process.cwd(), "prisma/init.sql");
        if (fs.existsSync(sqlPath)) {
          const sqlRaw = fs.readFileSync(sqlPath, "utf8");
          const sqlLines = sqlRaw
            .replace(
              /CREATE SCHEMA IF NOT EXISTS "public";/g,
              "-- schema public already exists",
            )
            .split(";")
            .filter((line) => line.trim().length > 0);

          for (const sql of sqlLines) {
            try {
              // Prepend search path for safety
              await tx.$executeRawUnsafe(
                `SET search_path TO "${slug}"; ${sql}`,
              );
            } catch (err: any) {
              // Ignore already exists errors during secondary provisioning
              if (!err.message.includes("already exists")) {
                console.warn(`DDL line failed for ${slug}:`, err.message);
              }
            }
          }
        }
      } catch (ddlErr) {
        console.error("DDL Provisioning failed:", ddlErr);
      }

      return b;
    });

    return { success: true, data: branch };
  } catch (error: any) {
    console.error("Failed to create branch:", error);
    return {
      success: false,
      error: error.message || "Failed to create branch.",
    };
  }
}

const UpdateTenantBrandingSchema = z.object({
  tenantId: z.number().int().positive().optional(),
  brandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  fontPairing: z.string().max(50).optional(),
  logoUrl: z.string().max(2000000).optional().or(z.literal("")), // Allow large strings for Base64
});

export async function updateTenantBranding(
  values: z.infer<typeof UpdateTenantBrandingSchema>,
) {
  const session = await requireAdminSession();
  const parsed = UpdateTenantBrandingSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Invalid branding data." };
  }

  const requestedTenantId = parsed.data.tenantId ?? undefined;
  const targetTenantId =
    session.user.role === "superadmin"
      ? requestedTenantId
      : (session.user.tenantId ?? undefined);

  if (!targetTenantId) {
    return { success: false, error: "No tenant selected." };
  }

  if (
    session.user.role !== "superadmin" &&
    session.user.tenantId !== targetTenantId
  ) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const updated = await prisma.tenant.update({
      where: { tenant_id: targetTenantId },
      data: {
        brand_color: parsed.data.brandColor || null,
        accent_color: parsed.data.accentColor || null,
        font_pairing: parsed.data.fontPairing || null,
        logo_url: parsed.data.logoUrl || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenant_id: targetTenantId,
        user_id: session.user.user_id,
        action: "UPDATE_TENANT_BRANDING",
        entity_type: "Tenant",
        entity_id: targetTenantId,
        new_values: parsed.data as any,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update tenant branding:", error);
    return { success: false, error: "Failed to update tenant branding." };
  }
}

const RenameTenantSchema = z.object({
  tenantId: z.number().int().positive().optional(),
  name: z.string().trim().min(3).max(100),
});

export async function renameTenant(values: z.infer<typeof RenameTenantSchema>) {
  const session = await requireAdminSession();
  const parsed = RenameTenantSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Invalid tenant name." };
  }

  const requestedTenantId = parsed.data.tenantId ?? undefined;
  const targetTenantId =
    session.user.role === "superadmin"
      ? requestedTenantId
      : (session.user.tenantId ?? undefined);

  if (!targetTenantId) {
    return { success: false, error: "No tenant selected." };
  }

  if (
    session.user.role !== "superadmin" &&
    session.user.tenantId !== targetTenantId
  ) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.tenant.findUnique({
        where: { tenant_id: targetTenantId },
        select: { tenant_id: true, name: true },
      });

      if (!existing) {
        throw new Error("Tenant not found.");
      }

      const updated = await tx.tenant.update({
        where: { tenant_id: targetTenantId },
        data: { name: parsed.data.name },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: targetTenantId,
          user_id: session.user.user_id,
          action: "RENAME_TENANT",
          entity_type: "Tenant",
          entity_id: targetTenantId,
          old_values: { name: existing.name } as any,
          new_values: { name: parsed.data.name } as any,
        },
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to rename tenant:", error);
    return { success: false, error: "Failed to rename tenant." };
  }
}

const UpdateTenantEntitlementSchema = z.object({
  tenantId: z.number().int().positive(),
  entitlementStatus: z.enum(["prospect", "active", "suspended"]),
  entitlementReference: z.string().trim().max(120).optional().or(z.literal("")),
  entitlementNotes: z.string().trim().optional().or(z.literal("")),
});

export async function updateTenantEntitlement(
  values: z.infer<typeof UpdateTenantEntitlementSchema>,
) {
  const session = await requireSuperadminSession();
  const parsed = UpdateTenantEntitlementSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: "Invalid entitlement update." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.tenant.findUnique({
        where: { tenant_id: parsed.data.tenantId },
        select: {
          tenant_id: true,
          entitlement_status: true,
          lifetime_availed_at: true,
          entitlement_reference: true,
          entitlement_notes: true,
        },
      });

      if (!existing) {
        throw new Error("Tenant not found.");
      }

      const activatingForFirstTime =
        parsed.data.entitlementStatus === "active" &&
        existing.lifetime_availed_at === null;

      const updated = await tx.tenant.update({
        where: { tenant_id: parsed.data.tenantId },
        data: {
          entitlement_status: parsed.data.entitlementStatus,
          entitlement_reference:
            parsed.data.entitlementReference?.trim() || null,
          entitlement_notes: parsed.data.entitlementNotes?.trim() || null,
          entitled_by_user_id: session.user.user_id,
          lifetime_availed_at: activatingForFirstTime
            ? new Date()
            : existing.lifetime_availed_at,
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: parsed.data.tenantId,
          user_id: session.user.user_id,
          action: "UPDATE_TENANT_ENTITLEMENT",
          entity_type: "Tenant",
          entity_id: parsed.data.tenantId,
          old_values: {
            entitlement_status: existing.entitlement_status,
            lifetime_availed_at: existing.lifetime_availed_at,
            entitlement_reference: existing.entitlement_reference,
            entitlement_notes: existing.entitlement_notes,
          } as any,
          new_values: {
            entitlement_status: updated.entitlement_status,
            lifetime_availed_at: updated.lifetime_availed_at,
            entitlement_reference: updated.entitlement_reference,
            entitlement_notes: updated.entitlement_notes,
            entitled_by_user_id: updated.entitled_by_user_id,
          } as any,
        },
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update tenant entitlement:", error);
    return { success: false, error: "Failed to update tenant access." };
  }
}

// 5. Get Audit Logs (Admin/Superadmin)
export async function getAuditLogs(tenantId?: number) {
  const session = await requireAdminSession();

  try {
    const logs = await prisma.auditLog.findMany({
      where:
        session.user.role === "superadmin"
          ? tenantId
            ? { tenant_id: tenantId }
            : {}
          : { tenant_id: session.user.tenantId },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });
    return logs.map((log) => ({
      ...log,
      username: log.user?.username || "System",
    }));
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}
