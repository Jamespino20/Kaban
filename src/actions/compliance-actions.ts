"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export const acceptConsent = async (version: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await prisma.user.update({
      where: { user_id: parseInt(session.user.id) },
      data: {
        consent_accepted_at: new Date(),
        consent_version: version,
      },
    });

    return { success: "Consent recorded" };
  } catch (error) {
    console.error("Consent recording error:", error);
    return { error: "Failed to record consent" };
  }
};

export const submitCoopApplication = async (values: {
  name: string;
  email: string;
  phone: string;
  region: string;
  membersCount: string;
  message?: string;
}) => {
  try {
    // We use the Tenant model with 'prospect' status for applications
    // or just log it to FeedbackEntry for now if we don't want to create
    // a full tenant yet.
    // However, creating a 'prospect' tenant is more in line with the multi-tenant architecture.

    const slug = values.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .substring(0, 50);

    await prisma.tenant.create({
      data: {
        name: values.name,
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        entitlement_status: "prospect",
        entitlement_notes: `Application from ${values.email}. Phone: ${values.phone}. Region: ${values.region}. Estimated Members: ${values.membersCount}. Message: ${values.message}`,
      },
    });

    // Also Log as feedback for immediate visibility to Superadmins
    await prisma.feedbackEntry.create({
      data: {
        name: values.name,
        email: values.email,
        category: "COOP_APPLICATION",
        subject: `New Cooperative Application: ${values.name}`,
        message: `Region: ${values.region}\nMembers: ${values.membersCount}\nPhone: ${values.phone}\n\nMessage: ${values.message}`,
      },
    });

    return {
      success: "Application submitted! Our team will contact you soon.",
    };
  } catch (error) {
    console.error("Coop application error:", error);
    return { error: "Nagkaroon ng problema sa pag-submit. Subukan muli." };
  }
};
