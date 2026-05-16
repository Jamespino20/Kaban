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

    const searchTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const firstNameTerm = searchTokens[0];
    const lastNameTerm = searchTokens.length > 1 ? searchTokens[searchTokens.length - 1] : undefined;

    const searchConditions: any[] = [
      { username: { contains: normalizedQuery } },
      { email: { contains: normalizedQuery } },
      { member_code: { contains: normalizedQuery } },
      { phone: { contains: normalizedQuery } },
      {
        profile: {
          is: {
            first_name: { contains: normalizedQuery },
          },
        },
      },
      {
        profile: {
          is: {
            middle_name: { contains: normalizedQuery },
          },
        },
      },
      {
        profile: {
          is: {
            last_name: { contains: normalizedQuery },
          },
        },
      },
      {
        profile: {
          is: {
            business_name: { contains: normalizedQuery },
          },
        },
      },
      {
        profile: {
          is: {
            occupation: { contains: normalizedQuery },
          },
        },
      },
    ];

    if (firstNameTerm && lastNameTerm) {
      searchConditions.push({
        profile: {
          is: {
            first_name: { contains: firstNameTerm },
            last_name: { contains: lastNameTerm },
          },
        },
      });
    }

    const users = await prisma.$withTenant(tenantId, async (tx: any) => {
      return await tx.user.findMany({
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
    });

    return { data: users };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search members." };
  }
}
