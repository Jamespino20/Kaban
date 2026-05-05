"use server";

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { getDbUrl } from "@/lib/db-url";
import { validateBranchMembershipLimit } from "@/lib/microfinance-policy";

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
}

export async function getAvailableTenants(
  username: string,
  password?: string,
  branchSlug?: string,
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

    const connectionString = getDbUrl();
    if (!connectionString) {
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
        tenants: (
          tenants as unknown as {
            tenant_id: number;
            name: string;
            group_name?: string;
            slug: string;
          }[]
        ).map((tenant) => ({
          tenant_id: tenant.tenant_id,
          name: tenant.name,
          groupName: tenant.group_name || "Agapay HQ",
          slug: tenant.slug,
          role: "superadmin",
        })),
      };
    }

    // Atomic SQL queries — no Prisma adapter dependency
    // We check BOTH the public schema (for superadmins/global users)
    // AND the branch-specific schema if provided (for isolated members).
    const normalizedBranch = branchSlug?.toLowerCase().trim();
    const isGlobal =
      !normalizedBranch ||
      normalizedBranch === "main" ||
      normalizedBranch === "global";

    // 1. Fetch all active tenants to know which schemas to search
    const allTenants = await sql`
      SELECT tenant_id, name, slug 
      FROM tenants 
      WHERE is_active = true
    `;

    // 2. Identify target schemas to search
    const schemasToSearch: string[] = ["public"];

    if (!isGlobal && normalizedBranch !== "malolos") {
      // If a specific branch is requested (and it's not malolos which is public)
      const target = allTenants.find((t) => t.slug === normalizedBranch);
      if (target) {
        schemasToSearch.push(target.slug);
      }
    } else if (isGlobal) {
      // Global login: Search ALL active schemas to find the user's accounts
      allTenants.forEach((t) => {
        if (t.slug && t.slug !== "malolos") {
          schemasToSearch.push(t.slug);
        }
      });
    }

    // 3. Execute queries in parallel for all identified schemas
    const userQueries = schemasToSearch.map(async (schema) => {
      try {
        if (schema === "public") {
          return await sql`
            SELECT user_id as id, tenant_id, role, password_hash, status, email, username
            FROM public.users
            WHERE (username = ${username} OR email = ${username})
            AND status != 'suspended'
          `;
        } else {
          const result = await sql.query(
            `
            SELECT user_id as id, tenant_id, role, password_hash, status, email, username
            FROM "${schema}".users
            WHERE (username = $1 OR email = $1)
            AND status != 'suspended'
          `,
            [username],
          );
          return (result as any).rows || result || [];
        }
      } catch (err) {
        console.warn(`Schema lookup failed for ${schema}:`, err);
        return [];
      }
    });

    const queryResults = await Promise.all(userQueries);
    const combinedUsers = queryResults.flat() as User[];

    return processUsers(combinedUsers, sql, password);
  } catch (error) {
    console.error("Identity lookup failed:", error);
    return { error: "Something went wrong" };
  }
}

async function processUsers(users: User[], sql: any, password?: string) {
  if (users.length === 0) return { error: "User not found" };

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

  const dedupedTenants = validTenants.filter((tenant, index, self) => {
    return (
      index ===
      self.findIndex((candidate) => candidate.tenant_id === tenant.tenant_id)
    );
  });

  const primaryRole = dedupedTenants[0]?.role;
  if (primaryRole && primaryRole !== "superadmin") {
    const membershipError = validateBranchMembershipLimit(
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
