"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendTenantScopedPasswordResetEmail } from "@/lib/mail";

const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  const email = validatedFields.data.email.trim().toLowerCase();

  const existingUsers = await prisma.user.findMany({
    where: {
      email,
      status: {
        not: "suspended",
      },
    },
    select: {
      user_id: true,
      tenant_id: true,
      tenant: {
        select: {
          name: true,
        },
      },
    },
  });

  if (existingUsers.length === 0) {
    return { success: "Kapag may katugmang account, magpapadala kami ng reset link sa iyong email." };
  }

  const uniqueTenantIds = Array.from(
    new Set(existingUsers.map((user) => user.tenant_id)),
  );

  for (const tenantId of uniqueTenantIds) {
    const matchingUser = existingUsers.find((user) => user.tenant_id === tenantId);
    const passwordResetToken = await generatePasswordResetToken(email, tenantId);

    await sendTenantScopedPasswordResetEmail({
      email: passwordResetToken.email,
      token: passwordResetToken.token,
      tenantName: matchingUser?.tenant?.name,
    });
  }

  return {
    success:
      "Kapag may katugmang account, ipinadala na ang reset instructions sa iyong email.",
  };
};
