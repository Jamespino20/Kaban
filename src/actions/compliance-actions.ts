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
  docs?: {
    validId: string | null;
    barangayCert: string | null;
    businessPermit: string | null;
  };
}) => {
  try {
    // We use the Tenant model with 'prospect' status for applications
    const slug = values.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .substring(0, 50);

    const docNotes = values.docs
      ? `\nDocuments: ${values.docs.validId ? "ID (v)" : "(x)"}, ${values.docs.barangayCert ? "Cert (v)" : "(x)"}, ${values.docs.businessPermit ? "Permit (v)" : "(x)"}`
      : "";

    await prisma.tenant.create({
      data: {
        name: values.name,
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        entitlement_status: "prospect",
        entitlement_notes: `Application from ${values.email}. Phone: ${values.phone}. Region: ${values.region}. Estimated Members: ${values.membersCount}. Message: ${values.message}${docNotes}`,
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
    return { error: "Failed to record your consent. Please try again." };
  }
};
