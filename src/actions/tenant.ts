"use server";

import prisma from "@/lib/prisma";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

export async function getTenants() {
  if (shouldUseApiClient()) {
    const res = await api.tenants.list();
    return res.tenants || [];
  }
  try {
    const tenants = await prisma.tenant.findMany({
      where: { is_active: true, entitlement_status: "active" },
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
