"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
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
    return { error: "Token has expired!" };
  }

  // Find users with this email (might be multi-tenant, let's update all for this email)
  // Agapay ties identities to email, although they get different user_id per tenant.
  const existingUsers = await prisma.user.findMany({
    where: { email: existingToken.email },
  });

  if (existingUsers.length === 0) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password for all tenant profiles tied to this email
  await prisma.user.updateMany({
    where: { email: existingToken.email },
    data: { password_hash: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
};
