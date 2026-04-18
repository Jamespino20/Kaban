"use server";

import prisma from "@/lib/prisma";

export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { is_active: true },
      select: {
        tenant_id: true,
        name: true,
        slug: true,
        tenant_group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return tenants;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
}
