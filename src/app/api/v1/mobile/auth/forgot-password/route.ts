import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ForgotPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid email." }, { status: 400 });
    }

    const { email } = validated.data;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return NextResponse.json({ status: "success", data: { message: "If the email exists, a reset link has been sent." } });
    }

    const passwordResetToken = await generatePasswordResetToken(email, user.tenant_id);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return NextResponse.json({ status: "success", data: { message: "If the email exists, a reset link has been sent." } });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
