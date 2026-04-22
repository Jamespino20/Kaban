"use server";

import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { getDbUrl } from "@/lib/db-url";

export async function getAvailableTenants(username: string, password?: string) {
  try {
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

    return { success: true, tenants: validTenants };
  } catch (error) {
    console.error("Identity lookup failed:", error);
    return { error: "Something went wrong" };
  }
}
