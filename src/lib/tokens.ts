import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const generateVerificationToken = async (
  email: string,
  tenantId: number | null,
) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour
  const normalizedEmail = normalizeEmail(email);

  const existingToken = await prisma.verificationToken.findFirst({
    where: { email: normalizedEmail, tenant_id: tenantId },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      tenant_id: tenantId,
      email: normalizedEmail,
      token,
      expires,
    },
  });

  return {
    ...verificationToken,
    email,
  };
};

export const generateTwoFactorToken = async (
  email: string,
  tenantId: number | null,
) => {
  const token = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour
  const normalizedEmail = normalizeEmail(email);

  const existingToken = await prisma.twoFactorToken.findFirst({
    where: { email: normalizedEmail, tenant_id: tenantId },
  });

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      tenant_id: tenantId,
      email: normalizedEmail,
      token,
      expires,
    },
  });

  return {
    ...twoFactorToken,
    email,
  };
};
