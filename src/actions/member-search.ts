"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { Role, UserStatus } from "@prisma/client";

export async function searchEligibleGuarantors(query: string) {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Not authenticated!" };
  }

  if (!session.user.tenantId) {
    return { error: "Not authenticated!" };
  }

  const normalizedQuery = query.trim().replace(/^@/, "");
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return { data: [] };
  }

  try {
    const tenantId = session.user.tenantId;
    if (!tenantId) return { data: [] };

    const [firstNameTerm, lastNameTerm] = normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

    const searchConditions: any[] = [
      { username: { contains: normalizedQuery, mode: "insensitive" } },
      { email: { contains: normalizedQuery, mode: "insensitive" } },
      {
        profile: {
          is: {
            first_name: { contains: normalizedQuery, mode: "insensitive" },
          },
        },
      },
      {
        profile: {
          is: {
            last_name: { contains: normalizedQuery, mode: "insensitive" },
          },
        },
      },
      {
        profile: {
          is: {
            business_name: { contains: normalizedQuery, mode: "insensitive" },
          },
        },
      },
      {
        profile: {
          is: {
            occupation: { contains: normalizedQuery, mode: "insensitive" },
          },
        },
      },
    ];

    if (firstNameTerm && lastNameTerm) {
      searchConditions.push({
        profile: {
          is: {
            first_name: { contains: firstNameTerm, mode: "insensitive" },
            last_name: { contains: lastNameTerm, mode: "insensitive" },
          },
        },
      });
    }

    const users = await prisma.user.findMany({
      where: {
        tenant_id: tenantId,
        user_id: { not: session.user.user_id },
        role: Role.member,
        status: UserStatus.active,
        OR: searchConditions,
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
      take: 8,
    });

    return { data: users };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search members." };
  }
}
