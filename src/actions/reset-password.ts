"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import {
  sendPasswordResetEmail,
  sendTenantScopedPasswordResetEmail,
} from "@/lib/mail";

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
  }

  const { email, tenantId } = validatedFields.data;
  const tenantIdInt = tenantId ? parseInt(tenantId) : null;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      tenant_id: tenantIdInt,
    },
  });

  if (!existingUser) {
    // Standard security: don't reveal if email exists, just say it's sent
    return {
      success: "Kung may account ka sa amin, naipadala na ang reset link.",
    };
  }

  const passwordResetToken = await generatePasswordResetToken(
    existingUser.email,
    existingUser.tenant_id,
  );

  if (existingUser.tenant_id) {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: existingUser.tenant_id },
      select: { name: true },
    });

    await sendTenantScopedPasswordResetEmail({
      email: passwordResetToken.email,
      token: passwordResetToken.token,
      tenantName: tenant?.name || "iyong cooperative",
    });
  } else {
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    );
  }

  return { success: "Naipadala na ang reset link sa iyong email!" };
};

export const resetPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing or invalid password reset token." };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid or missing password." };
  }

  const { password } = validatedFields.data;

  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Invalid or missing token." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return {
      error: "The password reset token has expired. Please request a new one.",
    };
  }

  // Use global client to find the user basic info first (including tenant)
  const existingUser = await prisma.user.findFirst({
    where: {
      email: existingToken.email,
      tenant_id: existingToken.tenant_id,
    },
  });

  if (!existingUser) {
    return { error: "User not found for the given email." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Resolve tenant slug for branch-scoped update
  let tenantSlug = "malolos";
  if (existingToken.tenant_id) {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: existingToken.tenant_id },
      select: { slug: true },
    });
    if (tenant?.slug) tenantSlug = tenant.slug;
  }

  await prisma.$withTenant(existingToken.tenant_id ?? 0, async (tx) => {
    await tx.user.update({
      where: { user_id: existingUser.user_id },
      data: { password_hash: hashedPassword },
    });
  });

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Na-update na ang iyong password!" };
};
