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
  const isOperator = role === "operator";
  if (!isOperator && role !== "superadmin") {
    throw new Error("Unauthorized");
  }
}

/**
 * Core fetching logic for homepage content.
 */
export async function fetchHomepageContent() {
  // Homepage content is always pulled from the "malolos" tenant context for the main landing page
  const malolosTenant = await prisma.tenant.findUnique({
    where: { slug: "malolos" },
    select: { tenant_id: true },
  });

  const query = async (db: any) => {
    const [faqs, testimonials] = await Promise.all([
      db.homepageFaq.findMany({
        where: { is_active: true, workflow_status: CONTENT_STATUS.published },
        orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
      }),
      db.homepageTestimonial.findMany({
        where: { is_active: true, workflow_status: CONTENT_STATUS.published },
        orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
      }),
    ]);
    return { faqs, testimonials };
  };

  if (!malolosTenant) {
    return await query(prisma);
  }

  return await prisma.$withTenant(malolosTenant.tenant_id, async (tx) => {
    return await query(tx);
  });
}

export async function getHomepageContent() {
  return fetchHomepageContent();
}

export async function getHomepageContentAdmin() {
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const baseWhere =
      session.user.role === "superadmin" && tenantId === null
        ? {}
        : { tenant_id: tenantId ?? -1 };

    const [faqs, testimonials] = await Promise.all([
      db.homepageFaq.findMany({
        where: baseWhere,
        orderBy: [
          { workflow_status: "asc" },
          { sort_order: "asc" },
          { created_at: "desc" },
        ],
      }),
      db.homepageTestimonial.findMany({
        where: baseWhere,
        orderBy: [
          { workflow_status: "asc" },
          { sort_order: "asc" },
          { created_at: "desc" },
        ],
      }),
    ]);

    return { faqs, testimonials };
  };

  if (!tenantId) {
    return await query(prisma);
  }

  return await prisma.$withTenant(tenantId, async (tx) => {
    return await query(tx);
  });
}

// Superadmin platform-level content moderation
export async function getPlatformContentModeration() {
  const session = await requireSuperadminSession();

  try {
    const [platformFaqs, platformTestimonials] = await Promise.all([
      prisma.homepageFaq.findMany({
        where: { tenant_id: null },
        orderBy: [
          { workflow_status: "asc" },
          { sort_order: "asc" },
          { created_at: "desc" },
        ],
      }),
      prisma.homepageTestimonial.findMany({
        where: { tenant_id: null },
        orderBy: [
          { workflow_status: "asc" },
          { sort_order: "asc" },
          { created_at: "desc" },
        ],
      }),
    ]);

    const faqUserIds = [
      ...new Set([
        ...platformFaqs.map((f) => f.submitted_by_user_id).filter(Boolean),
        ...platformFaqs.map((f) => f.reviewed_by_user_id).filter(Boolean),
      ]),
    ].filter((id): id is number => typeof id === "number");

    const testimonialUserIds = [
      ...new Set([
        ...platformTestimonials
          .map((t) => t.submitted_by_user_id)
          .filter(Boolean),
        ...platformTestimonials
          .map((t) => t.reviewed_by_user_id)
          .filter(Boolean),
      ]),
    ].filter((id): id is number => typeof id === "number");

    const allUserIds = [...new Set([...faqUserIds, ...testimonialUserIds])];

    const users = await prisma.user.findMany({
      where: { user_id: { in: allUserIds } },
      select: { user_id: true, username: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.user_id, u]));

    const enrichedFaqs = platformFaqs.map((f) => ({
      ...f,
      submitted_by_user: f.submitted_by_user_id
        ? userMap.get(f.submitted_by_user_id)
        : null,
      reviewed_by_user: f.reviewed_by_user_id
        ? userMap.get(f.reviewed_by_user_id)
        : null,
    }));

    const enrichedTestimonials = platformTestimonials.map((t) => ({
      ...t,
      submitted_by_user: t.submitted_by_user_id
        ? userMap.get(t.submitted_by_user_id)
        : null,
      reviewed_by_user: t.reviewed_by_user_id
        ? userMap.get(t.reviewed_by_user_id)
        : null,
    }));

    return {
      success: true,
      faqs: enrichedFaqs,
      testimonials: enrichedTestimonials,
    };
  } catch (error) {
    console.error("Failed to fetch platform content:", error);
    return { success: false, error: "Failed to load content" };
  }
}

// Superadmin: Publish/Reject platform FAQ
export async function moderatePlatformFaq(
  faqId: number,
  action: "publish" | "reject",
  sortOrder?: number,
  reviewNotes?: string,
) {
  const session = await requireSuperadminSession();

  try {
    const updated = await prisma.homepageFaq.update({
      where: { id: faqId, tenant_id: null },
      data: {
        workflow_status: action === "publish" ? "published" : "rejected",
        sort_order: sortOrder ?? 0,
        review_notes: reviewNotes ?? null,
        reviewed_by_user_id: session.user.user_id,
        is_active: action === "publish",
      },
    });

    if (!updated) {
      return { success: false, error: "FAQ not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to moderate FAQ:", error);
    return { success: false, error: "Failed to moderate FAQ" };
  }
}

// Superadmin: Publish/Reject platform testimonial
export async function moderatePlatformTestimonial(
  testimonialId: number,
  action: "publish" | "reject",
  sortOrder?: number,
  reviewNotes?: string,
) {
  const session = await requireSuperadminSession();

  try {
    const updated = await prisma.homepageTestimonial.update({
      where: { id: testimonialId, tenant_id: null },
      data: {
        workflow_status: action === "publish" ? "published" : "rejected",
        sort_order: sortOrder ?? 0,
        review_notes: reviewNotes ?? null,
        reviewed_by_user_id: session.user.user_id,
        is_active: action === "publish",
      },
    });

    if (!updated) {
      return { success: false, error: "Testimonial not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to moderate testimonial:", error);
    return { success: false, error: "Failed to moderate testimonial" };
  }
}

export async function submitHomepageFaqProposal(
  input: z.infer<typeof faqProposalSchema>,
) {
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const tenantId = session.user.tenantId;
    const data = faqProposalSchema.parse(input);

    const isOperator = session.user.role === "operator";
    if (isOperator && !tenantId) {
      return {
        error: "Admin branch context not found. Please log in as an admin.",
      };
    }

    const query = async (db: any) => {
      if (data.id) {
        const existing = await db.homepageFaq.findUnique({
          where: { id: data.id },
        });
        if (!existing) return { error: "FAQ proposal not found." };
        if (
          session.user.role !== "superadmin" &&
          existing.tenant_id !== tenantId
        ) {
          return { error: "You are not authorized to edit this proposal." };
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

      await db.homepageFaq.upsert({
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
          tenant_id: session.user.role === "superadmin" ? null : tenantId,
        },
        create: {
          tenant_id: session.user.role === "superadmin" ? null : tenantId,
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

      return {
        success:
          session.user.role === "superadmin"
            ? "Na-publish na ang FAQ."
            : "Naipasa na ang FAQ proposal para sa superadmin review.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("submitHomepageFaqProposal failed:", error);
    return { error: "Failed to submit FAQ proposal. Please try again." };
  }
}

export async function submitHomepageTestimonialProposal(
  input: z.infer<typeof testimonialProposalSchema>,
) {
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const tenantId = session.user.tenantId;
    const data = testimonialProposalSchema.parse(input);

    const isOperator = session.user.role === "operator";
    if (isOperator && !tenantId) {
      return { error: "Walang tenant context ang admin account na ito." };
    }

    const query = async (db: any) => {
      if (data.id) {
        const existing = await db.homepageTestimonial.findUnique({
          where: { id: data.id },
        });
        if (!existing)
          return { error: "Hindi makita ang testimonial proposal." };
        if (
          session.user.role !== "superadmin" &&
          existing.tenant_id !== tenantId
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

      await db.homepageTestimonial.upsert({
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
          tenant_id: session.user.role === "superadmin" ? null : tenantId,
        },
        create: {
          tenant_id: session.user.role === "superadmin" ? null : tenantId,
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

      return {
        success:
          session.user.role === "superadmin"
            ? "Na-publish na ang testimonial."
            : "Naipasa na ang testimonial proposal para sa superadmin review.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
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
    const tenantId = session.user.tenantId;
    const data = faqReviewSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.homepageFaq.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Hindi makita ang FAQ proposal." };

      await db.homepageFaq.update({
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

      return {
        success:
          data.action === "publish"
            ? "Na-publish na ang FAQ."
            : "Na-reject ang FAQ proposal.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
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
    const tenantId = session.user.tenantId;
    const data = testimonialReviewSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.homepageTestimonial.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Hindi makita ang testimonial proposal." };

      await db.homepageTestimonial.update({
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

      return {
        success:
          data.action === "publish"
            ? "Na-publish na ang testimonial."
            : "Na-reject ang testimonial proposal.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("reviewHomepageTestimonialProposal failed:", error);
    return { error: "Hindi ma-review ang testimonial proposal." };
  }
}

export async function deleteHomepageFaq(id: number) {
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;

    const query = async (db: any) => {
      await db.homepageFaq.delete({ where: { id } });
      return { success: "Nabura na ang FAQ entry." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("deleteHomepageFaq failed:", error);
    return { error: "Hindi mabura ang FAQ entry." };
  }
}

export async function deleteHomepageTestimonial(id: number) {
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;

    const query = async (db: any) => {
      await db.homepageTestimonial.delete({ where: { id } });
      return { success: "Nabura na ang testimonial entry." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
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

    const tenantId = session?.user?.tenantId;

    const query = async (db: any) => {
      await sendFeedbackNotificationEmail({
        name: data.name,
        email: data.email || session?.user?.email || null,
        category: data.category,
        pagePath: data.page_path || null,
        subject: data.subject || null,
        message: data.message,
      });

      await db.feedbackEntry.create({
        data: {
          tenant_id: tenantId ?? null,
          user_id: session?.user?.user_id ?? null,
          name: data.name,
          email: data.email || session?.user?.email || null,
          category: data.category,
          page_path: data.page_path || null,
          subject: data.subject || null,
          message: data.message,
        },
      });

      return { success: "Naipasa na ang feedback mo." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
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
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const where =
      session.user.role === "superadmin" && tenantId === null
        ? {}
        : { tenant_id: tenantId ?? -1 };

    return db.feedbackEntry.findMany({
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
  };

  if (!tenantId) {
    return await query(prisma);
  }

  return await prisma.$withTenant(tenantId, async (tx) => {
    return await query(tx);
  });
}

export async function updateFeedbackEntryStatus(
  input: z.infer<typeof feedbackUpdateSchema>,
) {
  try {
    const session = await requireTanawSession();
    const tenantId = session.user.tenantId;
    const data = feedbackUpdateSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.feedbackEntry.findUnique({
        where: { id: data.id },
      });

      if (!existing) return { error: "Hindi makita ang feedback entry." };
      if (
        session.user.role !== "superadmin" &&
        existing.tenant_id !== tenantId
      ) {
        return { error: "Hindi ka puwedeng mag-update ng feedback na ito." };
      }

      await db.feedbackEntry.update({
        where: { id: data.id },
        data: { status: data.status },
      });

      return { success: "Na-update na ang status ng feedback." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("updateFeedbackEntryStatus failed:", error);
    return { error: "Hindi ma-update ang feedback." };
  }
}

export async function getContentWorkflowSummary() {
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const tenantWhere =
      session.user.role === "superadmin" && tenantId === null
        ? {}
        : { tenant_id: tenantId ?? -1 };

    const [
      pendingFaqs,
      pendingTestimonials,
      openFeedback,
      testimonialFeedback,
    ] = await Promise.all([
      db.homepageFaq.count({
        where: { ...tenantWhere, workflow_status: CONTENT_STATUS.pending },
      }),
      db.homepageTestimonial.count({
        where: { ...tenantWhere, workflow_status: CONTENT_STATUS.pending },
      }),
      db.feedbackEntry.count({
        where: {
          ...tenantWhere,
          status: { in: ["open", "in_review"] },
        },
      }),
      db.feedbackEntry.count({
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
  };

  if (!tenantId) {
    return await query(prisma);
  }

  return await prisma.$withTenant(tenantId, async (tx) => {
    return await query(tx);
  });
}
