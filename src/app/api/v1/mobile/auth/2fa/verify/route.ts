import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { createAuthToken } from "@/app/api/v1/mobile/_helpers";

const Verify2faSchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = Verify2faSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { userId, code } = validated.data;

    const twoFa = await prisma.twoFactorAuth.findUnique({ where: { user_id: userId } });
    if (!twoFa || !twoFa.is_enabled) {
      return NextResponse.json({ status: "error", message: "2FA not enabled." }, { status: 400 });
    }

    const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } = await import("otplib");
    const totp = new TOTP({ crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() });
    const isValid = totp.verify(code, { secret: twoFa.totp_secret });

    if (!isValid) {
      return NextResponse.json({ status: "error", message: "Invalid 2FA code." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { user_id: true, tenant_id: true, role: true, username: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
    }

    const token = await createAuthToken(user.user_id, user.tenant_id!);

    return NextResponse.json({
      status: "success",
      data: { token, user: { id: user.user_id, ...user, tenant_id: user.tenant_id } },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
