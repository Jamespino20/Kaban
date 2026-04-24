"use server";

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { getDbUrl } from "@/lib/db-url";

export async function getAvailableTenants(username: string, password?: string) {
  try {
    let authenticatedSession = null;
    if (!password) {
      try {
        authenticatedSession = await requireAuthenticatedSession();
      } catch {
        return { error: "Unauthorized" };
      }

      const normalizedLookup = username.trim().toLowerCase();
      const sessionEmail = authenticatedSession.user.email?.trim().toLowerCase();
      if (!sessionEmail || sessionEmail !== normalizedLookup) {
        return { error: "Unauthorized" };
      }
    }

    const connectionString = getDbUrl();
    console.log(
      "SURGERY: Connection String Status:",
      connectionString ? "PRESENT" : "MISSING!",
    );

    if (!connectionString) {
      console.error("CRITICAL: DATABASE_URL is missing in identity.ts action!");
      return { error: "System configuration error: Database URL not found" };
    }

    const sql = neon(connectionString);

    if (!password && authenticatedSession?.user.role === "superadmin") {
      const tenants = await sql`
        SELECT
          t.tenant_id,
          t.name,
          t.slug,
          tg.name AS group_name
        FROM tenants t
        LEFT JOIN tenant_groups tg ON tg.id = t.tenant_group_id
        WHERE t.is_active = true
        ORDER BY t.name ASC
      `;

      return {
        success: true,
        tenants: tenants.map((tenant: any) => ({
          tenant_id: tenant.tenant_id,
          name: tenant.name,
          groupName: tenant.group_name || "Agapay HQ",
          slug: tenant.slug,
          role: "superadmin",
        })),
      };
    }

    // Atomic SQL queries — no Prisma adapter dependency
    const users: any[] = await sql`
      SELECT 
        user_id as id, tenant_id, role, password_hash, status, email, username
      FROM users
      WHERE (username = ${username} OR email = ${username})
      AND status != 'suspended'
    `;

    if (users.length === 0) return { error: "User not found" };

    const validTenants = [];

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
          SELECT name, slug, tenant_group_id 
          FROM tenants 
          WHERE tenant_id = ${user.tenant_id}
        `;
        tenant = tenants[0];

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
      });
    }

    if (validTenants.length === 0) return { error: "Invalid credentials" };

    return {
      success: true,
      tenants: validTenants.filter((tenant, index, self) => {
        return (
          index ===
          self.findIndex(
            (candidate) => candidate.tenant_id === tenant.tenant_id,
          )
        );
      }),
    };
  } catch (error) {
    console.error("Identity lookup failed:", error);
    return { error: "Something went wrong" };
  }
}
