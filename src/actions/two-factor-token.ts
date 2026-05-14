"use server";

import prisma from "@/lib/prisma";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await prisma.authToken.findUnique({
      where: { token, type: "TWO_FACTOR" }
    });
    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (
  email: string,
  tenantId: number | null,
) => {
  try {
    const twoFactorToken = await prisma.authToken.findFirst({
      where: { email: normalizeEmail(email), tenant_id: tenantId, type: "TWO_FACTOR" },
    });
    return twoFactorToken;
  } catch {
    return null;
  }
};
