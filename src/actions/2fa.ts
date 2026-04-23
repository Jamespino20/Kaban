"use server";

import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";

export async function generate2FASecret() {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { user_id: session.user.user_id },
    include: { two_factor_auth: true },
  });

  if (!user) return { error: "User not found" };

  let secret = user.two_factor_auth?.totp_secret;

  if (!secret) {
    secret = generateSecret();
    await prisma.twoFactorAuth.upsert({
      where: { user_id: user.user_id },
      update: { totp_secret: secret },
      create: { user_id: user.user_id, totp_secret: secret },
    });
  }

  const otpauth = generateURI({
    secret: secret as string,
    label: user.email,
    issuer: "Agapay Treasury",
  });

  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return { secret, qrCodeUrl };
}

export async function verifyAndEnable2FA(token: string) {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { user_id: session.user.user_id },
    include: { two_factor_auth: true },
  });

  if (!user || !user.two_factor_auth?.totp_secret) {
    return { error: "2FA not initiated" };
  }

  const isValid = await verify({
    token,
    secret: user.two_factor_auth.totp_secret,
  });

  if (!isValid) return { error: "Maling code. Subukan muli." };

  await prisma.twoFactorAuth.update({
    where: { user_id: user.user_id },
    data: { is_enabled: true },
  });

  return { success: "Matagumpay na na-enable ang 2FA!" };
}

export async function disable2FA() {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Unauthorized" };
  }

  await prisma.twoFactorAuth.update({
    where: { user_id: session.user.user_id },
    data: { is_enabled: false },
  });

  return { success: "Na-disable na ang 2FA." };
}
