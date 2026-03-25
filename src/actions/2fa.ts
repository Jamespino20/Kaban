"use server";

import * as otplib from "otplib";
import QRCode from "qrcode";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const { authenticator } = otplib;

export async function generate2FASecret() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(session.user.id) },
    include: { two_factor_auth: true },
  });

  if (!user) return { error: "User not found" };

  let secret = user.two_factor_auth?.totp_secret;

  if (!secret) {
    secret = authenticator.generateSecret();
    await prisma.twoFactorAuth.upsert({
      where: { user_id: user.user_id },
      update: { totp_secret: secret },
      create: { user_id: user.user_id, totp_secret: secret },
    });
  }

  const otpauth = authenticator.keyuri(
    user.email,
    "Kaban Treasury",
    secret as string,
  );

  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return { secret, qrCodeUrl };
}

export async function verifyAndEnable2FA(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(session.user.id) },
    include: { two_factor_auth: true },
  });

  if (!user || !user.two_factor_auth?.totp_secret) {
    return { error: "2FA not initiated" };
  }

  const isValid = authenticator.verify({
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
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.twoFactorAuth.update({
    where: { user_id: parseInt(session.user.id) },
    data: { is_enabled: false },
  });

  return { success: "Na-disable na ang 2FA." };
}
