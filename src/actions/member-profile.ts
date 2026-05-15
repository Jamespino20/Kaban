"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

export async function updatePersonalInfo(values: {
  email?: string;
  phone?: string;
  occupation?: string;
  businessName?: string;
  photoUrl?: string;
}) {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;

  try {
    const userData: Record<string, any> = {};
    if (values.email) userData.email = values.email.toLowerCase();
    if (values.phone) userData.phone = values.phone;

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { user_id: userId },
        data: userData,
      });
    }

    const profileData: Record<string, any> = {};
    if (values.occupation !== undefined) profileData.occupation = values.occupation;
    if (values.businessName !== undefined) profileData.business_name = values.businessName;
    if (values.photoUrl !== undefined) profileData.photo_url = values.photoUrl;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { user_id: userId },
        create: { user_id: userId, ...profileData },
        update: profileData,
      });
    }

    revalidatePath("/agapay-pintig");
    return { success: "Profile updated successfully." };
  } catch (err: any) {
    return { error: err.message || "Failed to update profile." };
  }
}
