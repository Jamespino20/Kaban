"use server";

import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { validateTenantMembershipLimit, calculateInitialTier } from "@/lib/microfinance-policy";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

interface User {
  id: number;
  tenant_id: number | null;
  role: string;
  password_hash: string;
  status: string;
  email: string;
  username: string;
}

interface Tenant {
  tenant_id: number | null;
  name: string;
  groupName: string;
  slug: string;
  role: string;
  brand_color?: string;
  accent_color?: string;
  logo_url?: string;
}

export async function getAvailableTenants(
  username: string,
  password?: string,
  tenantSlug?: string,
) {
  try {
    let authenticatedSession = null;
    if (!password) {
      try {
        authenticatedSession = await requireAuthenticatedSession();
      } catch {
        return { error: "Unauthorized" };
      }

      const normalizedLookup = username.trim().toLowerCase();
      const sessionEmail = authenticatedSession.user.email
        ?.trim()
        .toLowerCase();
      if (!sessionEmail || sessionEmail !== normalizedLookup) {
        return { error: "Unauthorized" };
      }
    }



    if (!password && authenticatedSession?.user.role === "superadmin") {
      const tenants = await sql`
        SELECT
          t.tenant_id,
          t.name,
          t.slug,
          t.brand_color,
          t.accent_color,
          t.logo_url,
          tg.name AS group_name
        FROM tenants t
        LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
        WHERE t.is_active = true AND t.entitlement_status = 'active'
        ORDER BY t.name ASC
      `;

      return {
        success: true,
        tenants: (
          tenants as unknown as {
            tenant_id: number;
            name: string;
            group_name?: string;
            slug: string;
            brand_color?: string;
            accent_color?: string;
            logo_url?: string;
          }[]
        ).map((tenant) => ({
          tenant_id: tenant.tenant_id,
          name: tenant.name,
          groupName: tenant.group_name || "Agapay HQ",
          slug: tenant.slug,
          role: "superadmin",
          brand_color: tenant.brand_color,
          accent_color: tenant.accent_color,
          logo_url: tenant.logo_url,
        })),
      };
    }

    // Atomic SQL query — no fragmented schema searching needed in single-schema architecture
    const combinedUsers = (await sql`
      SELECT user_id as id, tenant_id, role, password_hash, status, email, username
      FROM users
      WHERE (username = ${username} OR email = ${username})
      AND status != 'suspended'
    `) as User[];

    return processUsers(combinedUsers, sql, password);
  } catch (error) {
    console.error("Identity lookup failed:", error);
    return { error: "Something went wrong. Please try again or contact support if the issue persists." };
  }
}

async function processUsers(users: User[], sql: any, password?: string) {
  if (users.length === 0) return { error: "User not found. Please check the username/email you entered and try again." };

  const validTenants: Tenant[] = [];

  for (const user of users) {
    if (password) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) continue;
    }

    // Fetch tenant details atomically
    let tenant = null;
    let groupName = "Agapay HQ";

    if (user.tenant_id) {
      const tenants = await sql`
        SELECT name, slug, tenant_group_id, brand_color, accent_color, logo_url
        FROM tenants 
        WHERE tenant_id = ${user.tenant_id}
        AND is_active = true
        AND entitlement_status = 'active'
      `;
      tenant = tenants[0];

      if (!tenant) continue;

      if (tenant?.tenant_group_id) {
        const groups = await sql`
          SELECT name FROM tenant_groups WHERE id = ${tenant.tenant_group_id}
        `;
        if (groups[0]) groupName = groups[0].name;
      }
    }

    validTenants.push({
      tenant_id: user.tenant_id,
      name: tenant?.name || "Global / System Admin",
      groupName: groupName,
      slug: tenant?.slug || "global",
      role: user.role,
      brand_color: tenant?.brand_color,
      accent_color: tenant?.accent_color,
      logo_url: tenant?.logo_url,
    });
  }

  if (validTenants.length === 0) return { error: "Invalid credentials. Please check your username and password, or reset your password if you've forgotten it." };

  const dedupedTenants = validTenants.filter((tenant, index, self) => {
    return (
      index ===
      self.findIndex((candidate) => candidate.tenant_id === tenant.tenant_id)
    );
  });

  const primaryRole = dedupedTenants[0]?.role;
  if (primaryRole && primaryRole !== "superadmin") {
    const membershipError = validateTenantMembershipLimit(
      dedupedTenants.filter((tenant) => tenant.tenant_id).length,
    );

    if (membershipError) {
      return { error: membershipError };
    }
  }

  return {
    success: true,
    tenants: dedupedTenants,
  };
}

export async function approveIdentityVerification(userId: number) {
  const { requireAdminSession } = await import("@/lib/authorization");
  const prisma = (await import("@/lib/prisma")).default;
  const { createNotification } = await import("@/lib/notifications");
  const { revalidatePath } = await import("next/cache");

  const session = await requireAdminSession();
  const tenantId = session.user.tenantId;
  if (!tenantId) return { error: "Tenant context required." };

  try {
    await prisma.$withTenant(tenantId, async (tx: any) => {
      const profile = await tx.userProfile.findUnique({
        where: { user_id: userId },
      });

      const initialTier = calculateInitialTier({
        minIncome: profile?.income_min ? Number(profile.income_min) : null,
        maxIncome: profile?.income_max ? Number(profile.income_max) : null,
        incomeRange: profile?.income_range,
      });

      await tx.user.update({
        where: { user_id: userId },
        data: { 
          status: "active",
          interest_tier: initialTier,
        },
      });

      await tx.userDocument.updateMany({
        where: { user_id: userId, tenant_id: tenantId, verification_status: "pending" },
        data: { verification_status: "verified" },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: session.user.user_id,
          action: "IDENTITY_APPROVED",
          entity_type: "User",
          entity_id: userId,
          module: "members",
          action_category: "update",
          severity: "info",
        },
      });
    });

    await createNotification({
      userId,
      tenantId,
      type: "identity_verified",
      title: "Identity Verified",
      body: "Your identity has been verified. You can now apply for loans.",
      actionUrl: "/agapay-pintig",
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Identity approved and member activated." };
  } catch (error) {
    console.error("approveIdentityVerification failed:", error);
    return { error: "Failed to approve identity. Please try again." };
  }
}

export async function rejectIdentityVerification(userId: number, reason: string) {
  const { requireAdminSession } = await import("@/lib/authorization");
  const prisma = (await import("@/lib/prisma")).default;
  const { createNotification } = await import("@/lib/notifications");
  const { revalidatePath } = await import("next/cache");

  const session = await requireAdminSession();
  const tenantId = session.user.tenantId;
  if (!tenantId) return { error: "Tenant context required." };

  try {
    await prisma.$withTenant(tenantId, async (tx: any) => {
      await tx.userDocument.updateMany({
        where: { user_id: userId, tenant_id: tenantId, verification_status: "pending" },
        data: { verification_status: "rejected" },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: session.user.user_id,
          action: "IDENTITY_REJECTED",
          entity_type: "User",
          entity_id: userId,
          module: "members",
          action_category: "update",
          severity: "warning",
          new_values: { reason },
        },
      });
    });

    await createNotification({
      userId,
      tenantId,
      type: "identity_rejected",
      title: "Identity Verification Rejected",
      body: reason
        ? `Your identity verification was rejected. Reason: ${reason}`
        : "Your identity verification was rejected. Please re-upload valid documents.",
      actionUrl: "/agapay-pintig?tab=profile",
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Identity verification rejected." };
  } catch (error) {
    console.error("rejectIdentityVerification failed:", error);
    return { error: "Failed to reject identity. Please try again." };
  }
}
