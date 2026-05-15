import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as z from "zod";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ResetPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { token, password } = validated.data;

    const tokenRecord = await prisma.authToken.findUnique({ where: { token } });
    if (!tokenRecord || tokenRecord.type !== "PASSWORD_RESET" || tokenRecord.expires < new Date()) {
      return NextResponse.json({ status: "error", message: "Invalid or expired token." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email: tokenRecord.email } });
    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { user_id: user.user_id }, data: { password_hash: hashedPassword } });
    await prisma.authToken.delete({ where: { id: tokenRecord.id } });

    return NextResponse.json({ status: "success", data: { message: "Password reset successfully." } });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
