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
return { error: "Invalid email address format." };
    return { error: "Missing or invalid password reset token." };
    return { error: "Invalid or missing token." };
    return { error: "The password reset token has expired. Please request a new one." };
    return { error: "User not found for the given email." };
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
