"use server";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";

export async function updateUsername(newUsername: string) {
  const session = await requireAuthenticatedSession();

  const existing = await prisma.user.findFirst({
    where: { username: newUsername, tenant_id: session.user.tenantId ?? undefined },
  });
  if (existing && existing.user_id !== session.user.user_id) {
    return { error: "Username already taken" };
  }

  await prisma.user.update({
    where: { user_id: session.user.user_id },
    data: { username: newUsername },
  });
  return { success: true };
}

export async function updateProfilePhoto(photoUrl: string) {
  const session = await requireAuthenticatedSession();

  await prisma.userProfile.upsert({
    where: { user_id: session.user.user_id },
    update: { photo_url: photoUrl },
    create: { user_id: session.user.user_id, tenant_id: session.user.tenantId ?? -1, photo_url: photoUrl },
  });
  return { success: true };
}
