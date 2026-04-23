"use server";

import prisma from "@/lib/prisma";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await prisma.twoFactorToken.findUnique({
      where: { token }
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
    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: { email: normalizeEmail(email), tenant_id: tenantId },
    });
    return twoFactorToken;
  } catch {
    return null;
  }
};
