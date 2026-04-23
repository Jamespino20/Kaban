"use server";

import prisma from "@/lib/prisma";
import {
  requireAdminSession,
  requireAuthenticatedSession,
  requireSuperadminSession,
  requireTanawSession,
} from "@/lib/authorization";
import { sendFeedbackNotificationEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const CONTENT_STATUS = {
  pending: "pending_superadmin_review",
  published: "published",
  rejected: "rejected",
} as const;

const feedbackStatusSchema = z.enum(["open", "in_review", "resolved"]);

const faqProposalSchema = z.object({
  id: z.number().int().positive().optional(),
  question: z.string().trim().min(5).max(255),
  answer: z.string().trim().min(10),
  season_tag: z.string().trim().max(100).optional().or(z.literal("")),
});

const testimonialProposalSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(150),
  role_label: z.string().trim().min(2).max(150),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  content: z.string().trim().min(15),
  season_tag: z.string().trim().max(100).optional().or(z.literal("")),
});

const faqReviewSchema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["publish", "reject"]),
  question: z.string().trim().min(5).max(255),
  answer: z.string().trim().min(10),
  season_tag: z.string().trim().max(100).optional().or(z.literal("")),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  review_notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const testimonialReviewSchema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["publish", "reject"]),
  name: z.string().trim().min(2).max(150),
  role_label: z.string().trim().min(2).max(150),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  content: z.string().trim().min(15),
  season_tag: z.string().trim().max(100).optional().or(z.literal("")),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  review_notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().optional().or(z.literal("")),
  category: z.string().trim().min(2).max(100),
  page_path: z.string().trim().max(255).optional().or(z.literal("")),
  subject: z.string().trim().max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10),
});

const feedbackUpdateSchema = z.object({
  id: z.number().int().positive(),
  status: feedbackStatusSchema,
});

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/agapay-tanaw");
  revalidatePath("/agapay-pintig");
}

function ensureHomepageEditorRole(role?: string | null) {
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Unauthorized");
  }
}

export async function getHomepageContent() {
  const [faqs, testimonials] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: { is_active: true, workflow_status: CONTENT_STATUS.published },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
    prisma.homepageTestimonial.findMany({
      where: { is_active: true, workflow_status: CONTENT_STATUS.published },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
  ]);

  return { faqs, testimonials };
}

export async function getHomepageContentAdmin() {
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);

  const baseWhere =
    session.user.role === "superadmin"
      ? {}
      : { tenant_id: session.user.tenantId ?? -1 };

  const [faqs, testimonials] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: baseWhere,
      orderBy: [
        { workflow_status: "asc" },
        { sort_order: "asc" },
        { created_at: "desc" },
      ],
    }),
    prisma.homepageTestimonial.findMany({
      where: baseWhere,
      orderBy: [
        { workflow_status: "asc" },
        { sort_order: "asc" },
        { created_at: "desc" },
      ],
    }),
  ]);

  return { faqs, testimonials };
}

export async function submitHomepageFaqProposal(
  input: z.infer<typeof faqProposalSchema>,
) {
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const data = faqProposalSchema.parse(input);

    if (session.user.role === "admin" && !session.user.tenantId) {
      return { error: "Walang tenant context ang admin account na ito." };
    }

    if (data.id) {
      const existing = await prisma.homepageFaq.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Hindi makita ang FAQ proposal." };
      if (
        session.user.role !== "superadmin" &&
        existing.tenant_id !== session.user.tenantId
      ) {
        return { error: "Hindi ka puwedeng mag-edit ng proposal na ito." };
      }
      if (
        session.user.role !== "superadmin" &&
        existing.workflow_status === CONTENT_STATUS.published
      ) {
        return {
          error:
            "Tanging superadmin lang ang puwedeng magbago ng published FAQ.",
        };
      }
    }

    await prisma.homepageFaq.upsert({
      where: { id: data.id ?? 0 },
      update: {
        question: data.question,
        answer: data.answer,
        season_tag: data.season_tag || null,
        workflow_status:
          session.user.role === "superadmin"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.pending,
        review_notes: null,
        reviewed_by_user_id:
          session.user.role === "superadmin" ? session.user.user_id : null,
        submitted_by_user_id: session.user.user_id,
        tenant_id:
          session.user.role === "superadmin" ? null : session.user.tenantId,
      },
      create: {
        tenant_id:
          session.user.role === "superadmin" ? null : session.user.tenantId,
        question: data.question,
        answer: data.answer,
        season_tag: data.season_tag || null,
        workflow_status:
          session.user.role === "superadmin"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.pending,
        submitted_by_user_id: session.user.user_id,
        reviewed_by_user_id:
          session.user.role === "superadmin" ? session.user.user_id : null,
      },
    });

    revalidateContentPaths();
    return {
      success:
        session.user.role === "superadmin"
          ? "Na-publish na ang FAQ."
          : "Naipasa na ang FAQ proposal para sa superadmin review.",
    };
  } catch (error) {
    console.error("submitHomepageFaqProposal failed:", error);
    return { error: "Hindi maipasa ang FAQ proposal." };
  }
}

export async function submitHomepageTestimonialProposal(
  input: z.infer<typeof testimonialProposalSchema>,
) {
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const data = testimonialProposalSchema.parse(input);

    if (session.user.role === "admin" && !session.user.tenantId) {
      return { error: "Walang tenant context ang admin account na ito." };
    }

    if (data.id) {
      const existing = await prisma.homepageTestimonial.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Hindi makita ang testimonial proposal." };
      if (
        session.user.role !== "superadmin" &&
        existing.tenant_id !== session.user.tenantId
      ) {
        return { error: "Hindi ka puwedeng mag-edit ng proposal na ito." };
      }
      if (
        session.user.role !== "superadmin" &&
        existing.workflow_status === CONTENT_STATUS.published
      ) {
        return {
          error:
            "Tanging superadmin lang ang puwedeng magbago ng published testimonial.",
        };
      }
    }

    await prisma.homepageTestimonial.upsert({
      where: { id: data.id ?? 0 },
      update: {
        name: data.name,
        role_label: data.role_label,
        photo_url: data.photo_url || null,
        content: data.content,
        season_tag: data.season_tag || null,
        workflow_status:
          session.user.role === "superadmin"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.pending,
        review_notes: null,
        reviewed_by_user_id:
          session.user.role === "superadmin" ? session.user.user_id : null,
        submitted_by_user_id: session.user.user_id,
        tenant_id:
          session.user.role === "superadmin" ? null : session.user.tenantId,
      },
      create: {
        tenant_id:
          session.user.role === "superadmin" ? null : session.user.tenantId,
        name: data.name,
        role_label: data.role_label,
        photo_url: data.photo_url || null,
        content: data.content,
        season_tag: data.season_tag || null,
        workflow_status:
          session.user.role === "superadmin"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.pending,
        submitted_by_user_id: session.user.user_id,
        reviewed_by_user_id:
          session.user.role === "superadmin" ? session.user.user_id : null,
      },
    });

    revalidateContentPaths();
    return {
      success:
        session.user.role === "superadmin"
          ? "Na-publish na ang testimonial."
          : "Naipasa na ang testimonial proposal para sa superadmin review.",
    };
  } catch (error) {
    console.error("submitHomepageTestimonialProposal failed:", error);
    return { error: "Hindi maipasa ang testimonial proposal." };
  }
}

export async function reviewHomepageFaqProposal(
  input: z.infer<typeof faqReviewSchema>,
) {
  try {
    const session = await requireSuperadminSession();
    const data = faqReviewSchema.parse(input);

    const existing = await prisma.homepageFaq.findUnique({
      where: { id: data.id },
    });
    if (!existing) return { error: "Hindi makita ang FAQ proposal." };

    await prisma.homepageFaq.update({
      where: { id: data.id },
      data: {
        question: data.question,
        answer: data.answer,
        season_tag: data.season_tag || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        workflow_status:
          data.action === "publish"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.rejected,
        review_notes: data.review_notes || null,
        reviewed_by_user_id: session.user.user_id,
      },
    });

    revalidateContentPaths();
    return {
      success:
        data.action === "publish"
          ? "Na-publish na ang FAQ."
          : "Na-reject ang FAQ proposal.",
    };
  } catch (error) {
    console.error("reviewHomepageFaqProposal failed:", error);
    return { error: "Hindi ma-review ang FAQ proposal." };
  }
}

export async function reviewHomepageTestimonialProposal(
  input: z.infer<typeof testimonialReviewSchema>,
) {
  try {
    const session = await requireSuperadminSession();
    const data = testimonialReviewSchema.parse(input);

    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id: data.id },
    });
    if (!existing) return { error: "Hindi makita ang testimonial proposal." };

    await prisma.homepageTestimonial.update({
      where: { id: data.id },
      data: {
        name: data.name,
        role_label: data.role_label,
        photo_url: data.photo_url || null,
        content: data.content,
        season_tag: data.season_tag || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        workflow_status:
          data.action === "publish"
            ? CONTENT_STATUS.published
            : CONTENT_STATUS.rejected,
        review_notes: data.review_notes || null,
        reviewed_by_user_id: session.user.user_id,
      },
    });

    revalidateContentPaths();
    return {
      success:
        data.action === "publish"
          ? "Na-publish na ang testimonial."
          : "Na-reject ang testimonial proposal.",
    };
  } catch (error) {
    console.error("reviewHomepageTestimonialProposal failed:", error);
    return { error: "Hindi ma-review ang testimonial proposal." };
  }
}

export async function deleteHomepageFaq(id: number) {
  try {
    await requireSuperadminSession();
    await prisma.homepageFaq.delete({ where: { id } });
    revalidateContentPaths();
    return { success: "Nabura na ang FAQ entry." };
  } catch (error) {
    console.error("deleteHomepageFaq failed:", error);
    return { error: "Hindi mabura ang FAQ entry." };
  }
}

export async function deleteHomepageTestimonial(id: number) {
  try {
    await requireSuperadminSession();
    await prisma.homepageTestimonial.delete({ where: { id } });
    revalidateContentPaths();
    return { success: "Nabura na ang testimonial entry." };
  } catch (error) {
    console.error("deleteHomepageTestimonial failed:", error);
    return { error: "Hindi mabura ang testimonial entry." };
  }
}

export async function submitFeedback(input: z.infer<typeof feedbackSchema>) {
  try {
    const data = feedbackSchema.parse(input);
    let session = null;
    try {
      session = await requireAuthenticatedSession();
    } catch {}

    await sendFeedbackNotificationEmail({
      name: data.name,
      email: data.email || session?.user?.email || null,
      category: data.category,
      pagePath: data.page_path || null,
      subject: data.subject || null,
      message: data.message,
    });

    await prisma.feedbackEntry.create({
      data: {
        tenant_id: session?.user?.tenantId ?? null,
        user_id: session?.user?.user_id ?? null,
        name: data.name,
        email: data.email || session?.user?.email || null,
        category: data.category,
        page_path: data.page_path || null,
        subject: data.subject || null,
        message: data.message,
      },
    });

    revalidateContentPaths();
    return { success: "Naipasa na ang feedback mo." };
  } catch (error) {
    console.error("submitFeedback failed:", error);
    return {
      error:
        "Hindi maipasa ang feedback. Pakisuri ang email setup o subukan muli.",
    };
  }
}

export async function getFeedbackEntries() {
  const session = await requireTanawSession();
  const where =
    session.user.role === "superadmin"
      ? {}
      : { tenant_id: session.user.tenantId ?? -1 };

  return prisma.feedbackEntry.findMany({
    where,
    orderBy: [{ status: "asc" }, { created_at: "desc" }],
    include: {
      user: {
        select: { username: true, email: true },
      },
      tenant: {
        select: { name: true },
      },
    },
    take: 100,
  });
}

export async function updateFeedbackEntryStatus(
  input: z.infer<typeof feedbackUpdateSchema>,
) {
  try {
    const session = await requireTanawSession();
    const data = feedbackUpdateSchema.parse(input);
    const existing = await prisma.feedbackEntry.findUnique({
      where: { id: data.id },
    });

    if (!existing) return { error: "Hindi makita ang feedback entry." };
    if (
      session.user.role !== "superadmin" &&
      existing.tenant_id !== session.user.tenantId
    ) {
      return { error: "Hindi ka puwedeng mag-update ng feedback na ito." };
    }

    await prisma.feedbackEntry.update({
      where: { id: data.id },
      data: { status: data.status },
    });

    revalidateContentPaths();
    return { success: "Na-update na ang status ng feedback." };
  } catch (error) {
    console.error("updateFeedbackEntryStatus failed:", error);
    return { error: "Hindi ma-update ang feedback." };
  }
}

export async function getContentWorkflowSummary() {
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);

  const tenantWhere =
    session.user.role === "superadmin"
      ? {}
      : { tenant_id: session.user.tenantId ?? -1 };

  const [pendingFaqs, pendingTestimonials, openFeedback, testimonialFeedback] =
    await Promise.all([
      prisma.homepageFaq.count({
        where: { ...tenantWhere, workflow_status: CONTENT_STATUS.pending },
      }),
      prisma.homepageTestimonial.count({
        where: { ...tenantWhere, workflow_status: CONTENT_STATUS.pending },
      }),
      prisma.feedbackEntry.count({
        where: {
          ...tenantWhere,
          status: { in: ["open", "in_review"] },
        },
      }),
      prisma.feedbackEntry.count({
        where: {
          ...tenantWhere,
          category: "testimonial",
          status: { in: ["open", "in_review"] },
        },
      }),
    ]);

  return {
    pendingFaqs,
    pendingTestimonials,
    openFeedback,
    testimonialFeedback,
  };
}
