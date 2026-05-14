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

  const existingToken = await prisma.authToken.findFirst({
    where: { email: normalizedEmail, tenant_id: tenantId, type: "VERIFICATION" },
  });

  if (existingToken) {
    await prisma.authToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await prisma.authToken.create({
    data: {
      tenant_id: tenantId,
      email: normalizedEmail,
      token,
      expires,
      type: "VERIFICATION",
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

  const existingToken = await prisma.authToken.findFirst({
    where: { email: normalizedEmail, tenant_id: tenantId, type: "TWO_FACTOR" },
  });

  if (existingToken) {
    await prisma.authToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await prisma.authToken.create({
    data: {
      tenant_id: tenantId,
      email: normalizedEmail,
      token,
      expires,
      type: "TWO_FACTOR",
    },
  });

  return {
    ...twoFactorToken,
    email,
  };
};

export const generatePasswordResetToken = async (
  email: string,
  tenantId: number | null,
) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour
  const normalizedEmail = normalizeEmail(email);

  const existingToken = await prisma.authToken.findFirst({
    where: { email: normalizedEmail, tenant_id: tenantId, type: "PASSWORD_RESET" },
  });

  if (existingToken) {
    await prisma.authToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prisma.authToken.create({
    data: {
      tenant_id: tenantId,
      email: normalizedEmail,
      token,
      expires,
      type: "PASSWORD_RESET",
    },
  });

  return {
    ...passwordResetToken,
    email,
  };
};
