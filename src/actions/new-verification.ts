"use server";

import prisma from "@/lib/prisma";
import { parseScopedIdentity } from "@/lib/scoped-identity";

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
      where: { email: `${tenantId ?? "global"}::${email.toLowerCase()}` },
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
    const user = await prisma.user.findFirst({ where: { email, tenant_id: tenantId } });
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

  const { email, tenantId } = parseScopedIdentity(existingToken.email);
  const existingUser = await getUserByEmail(email, tenantId);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await prisma.user.update({
    where: { user_id: existingUser.user_id },
    data: {
      status: "active", // Updated from 'pending' to 'active'
      email,
    },
  });

  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};
