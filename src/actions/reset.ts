"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  // Find all users with this email (if multi-tenant ignores tenant temporarily for reset,
  // or we just pick the primary/global one to send the email).
  // In Agapay, if email is used across tenants, we send a token with tenant_id: null
  // or just send it for the first found user and apply it everywhere.
  // We'll tie the token to the first found user's tenant for simplicity, or
  // ideally update all instances if they share credentials.
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(
    email,
    existingUser.tenant_id,
  );

  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Reset email sent!" };
};
