"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role, UserStatus } from "@prisma/client";

export async function getTenantMembers() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  const members = await prisma.user.findMany({
    where: {
      tenant_id: session.user.tenantId,
      role: Role.member,
    },
    include: {
      profile: true,
      loans: {
        select: {
          loan_id: true,
          status: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return members;
}

export async function getPendingApprovals() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.tenantId) {
    throw new Error("Unauthorized");
  }

  // Fetch pending loans
  const pendingLoans = await prisma.loan.findMany({
    where: {
      tenant_id: session.user.tenantId,
      status: "pending",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      product: true,
    },
    orderBy: {
      applied_at: "asc",
    },
  });

  // Fetch users with pending verification documents
  const pendingVerifications = await prisma.user.findMany({
    where: {
      tenant_id: session.user.tenantId,
      status: UserStatus.pending,
      documents: {
        some: {
          verification_status: "pending",
        },
      },
    },
    include: {
      profile: true,
      documents: true,
    },
  });

  return {
    loans: pendingLoans,
    verifications: pendingVerifications,
  };
}
