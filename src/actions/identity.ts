"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export async function getAvailableTenants(username: string, password?: string) {
  // Use Neon client directly to avoid Prisma driver issues
  const sql = neon(
    "postgresql://neondb_owner:npg_Zi2m9NUxgIrC@ep-damp-river-a1bkchuk-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  );

  console.log("### AGAPAY ATOMIC IDENTITY LOOKUP ###");
  console.log("Input:", username);

  // 1. Fetch matching users without ANY joins or complex aliases
  const matchedUsers = await sql`
    SELECT user_id, tenant_id, role, password_hash, status, email, username
    FROM users
    WHERE (username = ${username} OR email = ${username})
    AND status != 'suspended'
  `;

  if (matchedUsers.length === 0) {
    console.log("Lookup: User not found");
    return { error: "User not found" };
  }

  const validTenants = [];

  for (const user of matchedUsers) {
    if (password) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        console.log("Lookup: Password mismatch for user_id:", user.user_id);
        continue;
      }
    }

    // 2. Fetch tenant details atomically
    const tenants = await sql`
      SELECT name, slug, tenant_group_id 
      FROM tenants 
      WHERE tenant_id = ${user.tenant_id}
    `;
    const tenant = tenants[0];

    let groupName = "Agapay HQ";
    if (tenant?.tenant_group_id) {
      const groups = await sql`
        SELECT name FROM tenant_groups WHERE id = ${tenant.tenant_group_id}
      `;
      if (groups[0]) groupName = groups[0].name;
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

  console.log("Lookup success. Tenants found:", validTenants.length);
  return { success: true, tenants: validTenants };
}
