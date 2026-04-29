"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const ResetSchema = z.object({
  email: z.string().email({
    message: "Kailangan ng valid na email",
  }),
  tenantId: z.string().optional(),
});

const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters ang kailangan",
  }),
});

export const requestPasswordReset = async (
  values: z.infer<typeof ResetSchema>,
) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Maling email!" };
  }

  const { email, tenantId } = validatedFields.success
    ? validatedFields.data
    : { email: "", tenantId: undefined };
  const normalizedEmail = email.toLowerCase().trim();
  const tId = tenantId ? parseInt(tenantId) : null;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      tenant_id: tId,
    },
  });

  if (!existingUser) {
    // For security, don't reveal if the user exists or not, but in this specific multi-tenant context,
    // we might want to be helpful. However, standard practice is to say "email sent".
    return { success: "Check your email for reset instructions." };
  }

  const passwordResetToken = await generatePasswordResetToken(
    normalizedEmail,
    tId,
  );
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Naipadala na ang reset link sa iyong email!" };
};

export const resetPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Maling fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Expired na ang token!" };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: existingToken.email,
      tenant_id: existingToken.tenant_id,
    },
  });

  if (!existingUser) {
    return { error: "Hindi mahanap ang user!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { user_id: existingUser.user_id },
    data: { password_hash: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Na-update na ang iyong password!" };
};
