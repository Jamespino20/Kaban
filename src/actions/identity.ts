"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function getAvailableTenants(username: string, password?: string) {
  try {
    // 1. Find all users matching the username/email
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: username }, { email: username }],
        status: { not: "suspended" },
      },
      include: {
        tenant: {
          include: {
            tenant_group: true,
          },
        },
      },
    });

    if (users.length === 0) return { error: "User not found" };

    // 2. If password provided, filter by correct password
    // (We do this to avoid leaking which branches an email belongs to without a password)
    const validTenants = [];

    for (const user of users) {
      if (password) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) continue;
      }

      validTenants.push({
        tenant_id: user.tenant_id,
        name: user.tenant?.name || "Global / System Admin",
        groupName: user.tenant?.tenant_group?.name || "Agapay HQ",
        slug: user.tenant?.slug || "global",
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
