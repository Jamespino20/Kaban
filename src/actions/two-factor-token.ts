"use server";

import prisma from "@/lib/prisma";
import { createScopedIdentity } from "@/lib/scoped-identity";

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
      where: { email: createScopedIdentity(email, tenantId) },
    });
    return twoFactorToken;
  } catch {
    return null;
  }
};
