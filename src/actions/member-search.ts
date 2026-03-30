"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function searchEligibleGuarantors(query: string) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.tenantId) {
    return { error: "Not authenticated!" };
  }

  if (!query || query.length < 3) {
    return { data: [] };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        tenant_id: session.user.tenantId,
        user_id: { not: parseInt(session.user.id) }, // Cannot guarantee oneself
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          {
            profile: {
              first_name: { contains: query, mode: "insensitive" },
            },
          },
          {
            profile: {
              last_name: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        profile: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      take: 5, // Limit results
    });

    return { data: users };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search members." };
  }
}
