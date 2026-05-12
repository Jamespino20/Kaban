"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export const acceptConsent = async (version: string) => {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    if (!session.user.tenantId) return { error: "Tenant not found" };

    const queryFn = async (db: any) => {
      await db.user.update({
        where: { user_id: parseInt(session.user.id!) },
        data: {
          consent_accepted_at: new Date(),
          consent_version: version,
        },
      });
    };

    await prisma.$withTenant(session.user.tenantId, async (tx) => {
      await queryFn(tx);
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
  tenant_group_id?: number;
  membersCount: string;
  message?: string;
  selectedPlanId?: string;
  docs?: {
    validId: string | null;
    barangayCert: string | null;
    businessPermit: string | null;
  };
  billing?: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    cardLast4: string;
  };
}) => {
  try {
    const planLabel = values.selectedPlanId
      ? values.selectedPlanId.toUpperCase()
      : "NONE";
    const cycleLabel = "One-time Payment";

    // We use the Tenant model with 'prospect' status for applications
    const slug = values.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .substring(0, 50);

    const docNotes = values.docs
      ? `\nDocuments: ${values.docs.validId ? "ID (v)" : "(x)"}, ${values.docs.barangayCert ? "Cert (v)" : "(x)"}, ${values.docs.businessPermit ? "Permit (v)" : "(x)"}`
      : "";

    const billingNotes = values.billing
      ? `\nBilling: ${values.billing.name} (${values.billing.email}), ${values.billing.address}, ${values.billing.city} ${values.billing.zip}. Card: ****${values.billing.cardLast4}`
      : "";

    const application = await prisma.tenantApplication.create({
      data: {
        tenant_name: values.name,
        tenant_slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        applicant_name: values.billing?.name || values.name,
        applicant_email: values.email,
        applicant_phone: values.phone,
        estimated_members: parseInt(values.membersCount) || 0,
        tenant_group_id: values.tenant_group_id ?? null,
        status: "pending",
        submitted_by: 0, // Using 0 for Guest/Public submissions
        documents: values.docs ? (values.docs as any) : null,
        brand_color: "#10b981", // Default Emerald
      },
    });

    // Also Log as feedback for immediate visibility to Superadmins
    await prisma.feedbackEntry.create({
      data: {
        name: values.name,
        email: values.email,
        category: "COOP_APPLICATION",
        subject: `New Cooperative Application: ${values.name}`,
        message: `Region: ${values.region}\nMembers: ${values.membersCount}\nPhone: ${values.phone}\nPlan: ${planLabel}\n\nMessage: ${values.message}${billingNotes}`,
      },
    });

    return {
      success: "Application submitted! Our team will contact you soon.",
    };
  } catch (error) {
    console.error("Coop application error:", error);
    return { error: "Failed to submit your application. Please try again." };
  }
};
