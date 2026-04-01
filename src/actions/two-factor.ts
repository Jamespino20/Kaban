"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";
import qrcode from "qrcode";

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export async function generateTwoFactorSecret() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const secret = totp.generateSecret();
  const email = session.user.email || "";
  const uri = totp.toURI({
    label: email,
    issuer: "Asenso Treasury",
    secret,
  });
  const qrCodeUrl = await qrcode.toDataURL(uri);

  return { secret, qrCodeUrl };
}

export async function enableTwoFactor(token: string, secret: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await totp.verify(token, { secret });
  if (!result.valid) return { error: "Invalid token" };

  await prisma.twoFactorAuth.upsert({
    where: { user_id: parseInt(session.user.id) },
    update: {
      totp_secret: secret,
      is_enabled: true,
    },
    create: {
      user_id: parseInt(session.user.id),
      totp_secret: secret,
      is_enabled: true,
    },
  });

  return { success: true };
}

export async function getTwoFactorStatus() {
  const session = await auth();
  if (!session?.user?.id) return { isEnabled: false };

  const tfa = await prisma.twoFactorAuth.findUnique({
    where: { user_id: parseInt(session.user.id) },
  });

  return { isEnabled: tfa?.is_enabled || false };
}
