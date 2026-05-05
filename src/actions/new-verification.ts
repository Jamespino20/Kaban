"use server";

import prisma, { getBranchPrisma } from "@/lib/prisma";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (
  email: string,
  tenantId: number | null,
) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email: normalizeEmail(email), tenant_id: tenantId },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

export const getUserByEmail = async (
  email: string,
  tenantId: number | null,
) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: normalizeEmail(email), tenant_id: tenantId },
    });
    return user;
  } catch {
    return null;
  }
};

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(
    existingToken.email,
    existingToken.tenant_id ?? null,
  );

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  // Resolve tenant slug for branch-scoped update
  let tenantSlug = "malolos";
  if (existingToken.tenant_id) {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: existingToken.tenant_id },
      select: { slug: true },
    });
    if (tenant?.slug) tenantSlug = tenant.slug;
  }

  const db = getBranchPrisma(tenantSlug);

  await db.user.update({
    where: { user_id: existingUser.user_id },
    data: {
      status: "active",
      email: normalizeEmail(existingToken.email),
    },
  });

  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};
