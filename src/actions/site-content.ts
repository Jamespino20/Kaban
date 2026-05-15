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
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

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
    throw new Error(
      `Role "${role}" is not authorized for homepage editing. Requires operator or superadmin.`,
    );
  }
}

/**
 * Core fetching logic for homepage content.
 */
export async function fetchHomepageContent() {
  if (shouldUseApiClient()) {
    return { faqs: [], testimonials: [] };
  }
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

  return await prisma.$withTenant(malolosTenant.tenant_id, async (tx: any) => {
    return await query(tx);
  });
}

export async function getHomepageContent() {
  if (shouldUseApiClient()) {
    return await fetchHomepageContent();
  }
  return fetchHomepageContent();
}

export async function getHomepageContentAdmin() {
  if (shouldUseApiClient()) {
    return { faqs: [], testimonials: [], vision: "", mission: "" };
  }
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const baseWhere =
      session.user.role === "superadmin" && tenantId === null
        ? {}
        : { tenant_id: tenantId ?? -1 };

    const [faqs, testimonials, tenantMeta] = await Promise.all([
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
      tenantId
        ? db.tenant.findUnique({
            where: { tenant_id: tenantId },
            select: { metadata: true },
          })
        : Promise.resolve(null),
    ]);

    const meta = (tenantMeta?.metadata as Record<string, unknown>) ?? {};

    return {
      faqs,
      testimonials,
      vision: (meta.vision as string) ?? "",
      mission: (meta.mission as string) ?? "",
    };
  };

  if (!tenantId) {
    return await query(prisma);
  }

  return await prisma.$withTenant(tenantId, async (tx: any) => {
    return await query(tx);
  });
}

// Superadmin platform-level content moderation
export async function getPlatformContentModeration() {
  if (shouldUseApiClient()) {
    return { success: true, faqs: [], testimonials: [] };
  }
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
        ...platformFaqs
          .map((f: { submitted_by_user_id: any }) => f.submitted_by_user_id)
          .filter(Boolean),
        ...platformFaqs
          .map((f: { reviewed_by_user_id: any }) => f.reviewed_by_user_id)
          .filter(Boolean),
      ]),
    ].filter((id): id is number => typeof id === "number");

    const testimonialUserIds = [
      ...new Set([
        ...platformTestimonials
          .map((t: { submitted_by_user_id: any }) => t.submitted_by_user_id)
          .filter(Boolean),
        ...platformTestimonials
          .map((t: { reviewed_by_user_id: any }) => t.reviewed_by_user_id)
          .filter(Boolean),
      ]),
    ].filter((id): id is number => typeof id === "number");

    const allUserIds = [...new Set([...faqUserIds, ...testimonialUserIds])];

    const users = await prisma.user.findMany({
      where: { user_id: { in: allUserIds } },
      select: { user_id: true, username: true, email: true },
    });

    const userMap = new Map(users.map((u: any) => [u.user_id, u]));

    const enrichedFaqs = platformFaqs.map((f: any) => ({
      ...f,
      submitted_by_user: f.submitted_by_user_id
        ? userMap.get(f.submitted_by_user_id)
        : null,
      reviewed_by_user: f.reviewed_by_user_id
        ? userMap.get(f.reviewed_by_user_id)
        : null,
    }));

    const enrichedTestimonials = platformTestimonials.map(
      (t: { submitted_by_user_id: unknown; reviewed_by_user_id: unknown }) => ({
        ...t,
        submitted_by_user: t.submitted_by_user_id
          ? userMap.get(t.submitted_by_user_id)
          : null,
        reviewed_by_user: t.reviewed_by_user_id
          ? userMap.get(t.reviewed_by_user_id)
          : null,
      }),
    );

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
  if (shouldUseApiClient()) {
    return { success: true, data: null };
  }
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
  if (shouldUseApiClient()) {
    return { success: true, data: null };
  }
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

// Superadmin: Bulk toggle is_active based on season_tag
export async function bulkUpdatePlatformSeason(
  seasonTag: string,
  isActive: boolean,
) {
  if (shouldUseApiClient()) {
    return { success: true, data: { faqsCount: 0, testimonialsCount: 0 } };
  }
  await requireSuperadminSession();

  try {
    const [faqs, testimonials] = await prisma.$transaction([
      prisma.homepageFaq.updateMany({
        where: { tenant_id: null, season_tag: seasonTag },
        data: { is_active: isActive },
      }),
      prisma.homepageTestimonial.updateMany({
        where: { tenant_id: null, season_tag: seasonTag },
        data: { is_active: isActive },
      }),
    ]);

    revalidateContentPaths();

    return {
      success: true,
      data: {
        faqsCount: faqs.count,
        testimonialsCount: testimonials.count,
      },
    };
  } catch (error) {
    console.error("Failed to bulk update season content:", error);
    return { success: false, error: "Failed to update season content" };
  }
}

export async function submitHomepageFaqProposal(
  input: z.infer<typeof faqProposalSchema>,
) {
  if (shouldUseApiClient()) {
    return { success: "FAQ has been published." };
  }
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const tenantId = session.user.tenantId;
    const data = faqProposalSchema.parse(input);

    const isOperator = session.user.role === "operator";
    if (isOperator && !tenantId) {
      return {
        error: "Admin tenant context not found. Please log in as an admin.",
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
            error: "Only superadmin can modify published FAQs.",
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
            ? "FAQ has been published."
            : "FAQ proposal has been submitted for superadmin review.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
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
  if (shouldUseApiClient()) {
    return { success: "Testimonial has been published." };
  }
  try {
    const session = await requireAdminSession();
    ensureHomepageEditorRole(session.user.role);
    const tenantId = session.user.tenantId;
    const data = testimonialProposalSchema.parse(input);

    const isOperator = session.user.role === "operator";
    if (isOperator && !tenantId) {
      return { error: "This admin account has no tenant context." };
    }

    const query = async (db: any) => {
      if (data.id) {
        const existing = await db.homepageTestimonial.findUnique({
          where: { id: data.id },
        });
        if (!existing) return { error: "Testimonial proposal not found." };
        if (
          session.user.role !== "superadmin" &&
          existing.tenant_id !== tenantId
        ) {
          return { error: "You are not allowed to edit this proposal." };
        }
        if (
          session.user.role !== "superadmin" &&
          existing.workflow_status === CONTENT_STATUS.published
        ) {
          return {
            error: "Only superadmin can modify published testimonials.",
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
            ? "Testimonial has been published."
            : "Testimonial proposal has been submitted for superadmin review.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("submitHomepageTestimonialProposal failed:", error);
    return { error: "Failed to submit testimonial proposal." };
  }
}

export async function reviewHomepageFaqProposal(
  input: z.infer<typeof faqReviewSchema>,
) {
  if (shouldUseApiClient()) {
    return { success: input.action === "publish" ? "FAQ has been published." : "FAQ proposal has been rejected." };
  }
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;
    const data = faqReviewSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.homepageFaq.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "FAQ proposal not found." };

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
            ? "FAQ has been published."
            : "FAQ proposal has been rejected.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("reviewHomepageFaqProposal failed:", error);
    return { error: "Failed to review FAQ proposal." };
  }
}

export async function reviewHomepageTestimonialProposal(
  input: z.infer<typeof testimonialReviewSchema>,
) {
  if (shouldUseApiClient()) {
    return { success: input.action === "publish" ? "Testimonial has been published." : "Testimonial proposal has been rejected." };
  }
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;
    const data = testimonialReviewSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.homepageTestimonial.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Testimonial proposal not found." };

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
            ? "Testimonial has been published."
            : "Testimonial proposal has been rejected.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("reviewHomepageTestimonialProposal failed:", error);
    return { error: "Failed to review testimonial proposal." };
  }
}

// Superadmin: Browse published testimonials from all tenants
export async function getTenantTestimonialsForPlatform() {
  if (shouldUseApiClient()) {
    return { success: true, testimonials: [] };
  }
  const session = await requireSuperadminSession();

  try {
    const testimonials = await prisma.homepageTestimonial.findMany({
      where: {
        tenant_id: { not: null },
        workflow_status: "published",
      },
      orderBy: [{ created_at: "desc" }],
      include: {
        tenant: { select: { name: true } },
        submitted_by_user: { select: { username: true } },
      },
    });

    return { success: true, testimonials };
  } catch (error) {
    console.error("Failed to fetch tenant testimonials:", error);
    return { success: false, error: "Failed to load tenant testimonials" };
  }
}

// Superadmin: Pick a tenant testimonial for the platform homepage
export async function pickTenantTestimonialForPlatform(id: number) {
  if (shouldUseApiClient()) {
    return { success: "Testimonial has been picked for the platform homepage." };
  }
  try {
    const session = await requireSuperadminSession();

    const testimonial = await prisma.homepageTestimonial.findUnique({
      where: { id },
    });

    if (!testimonial) return { error: "Testimonial not found" };
    if (!testimonial.tenant_id)
      return { error: "Testimonial is already on the platform" };

    await prisma.homepageTestimonial.create({
      data: {
        tenant_id: null,
        name: testimonial.name,
        role_label: testimonial.role_label,
        photo_url: testimonial.photo_url,
        content: testimonial.content,
        season_tag: testimonial.season_tag,
        is_active: true,
        sort_order: testimonial.sort_order,
        workflow_status: "published",
        submitted_by_user_id: session.user.user_id,
        reviewed_by_user_id: session.user.user_id,
      },
    });

    revalidateContentPaths();
    return {
      success: "Testimonial has been picked for the platform homepage.",
    };
  } catch (error) {
    console.error("pickTenantTestimonialForPlatform failed:", error);
    return { error: "Failed to pick testimonial for platform." };
  }
}

export async function deleteHomepageFaq(id: number) {
  if (shouldUseApiClient()) {
    return { success: "FAQ entry has been deleted." };
  }
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;

    const query = async (db: any) => {
      await db.homepageFaq.delete({ where: { id } });
      return { success: "FAQ entry has been deleted." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("deleteHomepageFaq failed:", error);
    return { error: "Failed to delete FAQ entry." };
  }
}

export async function deleteHomepageTestimonial(id: number) {
  if (shouldUseApiClient()) {
    return { success: "Testimonial entry has been deleted." };
  }
  try {
    const session = await requireSuperadminSession();
    const tenantId = session.user.tenantId;

    const query = async (db: any) => {
      await db.homepageTestimonial.delete({ where: { id } });
      return { success: "Testimonial entry has been deleted." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("deleteHomepageTestimonial failed:", error);
    return { error: "Failed to delete testimonial entry." };
  }
}

export async function submitFeedback(input: z.infer<typeof feedbackSchema>) {
  if (shouldUseApiClient()) {
    return { success: "Your feedback has been submitted." };
  }
  try {
    const data = feedbackSchema.parse(input);
    let session = null;
    try {
      session = await requireAuthenticatedSession();
    } catch {}

    const tenantId = session?.user?.tenantId;
    const moduleContext =
      data.category === "testimonial"
        ? "homepage"
        : data.category === "concern"
          ? "system"
          : "general";

    const query = async (db: any) => {
      await sendFeedbackNotificationEmail({
        name: data.name,
        email: data.email || session?.user?.email || null,
        category: data.category,
        pagePath: data.page_path || null,
        subject: data.subject || null,
        message: data.message,
      });

      await db.supportTicket.create({
        data: {
          tenant_id: tenantId ?? null,
          requester_id: session?.user?.user_id ?? null,
          ticket_number: `FDB-PUB-${Date.now().toString(36).toUpperCase()}`,
          ticket_type: "FEEDBACK",
          category: (data.category as any) || "general_support",
          subject: data.subject || "Public Feedback",
          description: data.message,
          module_context: moduleContext,
          status: "open",
          metadata: {
            name: data.name,
            email: data.email || session?.user?.email || null,
            page_path: data.page_path || null,
          },
        },
      });

      return { success: "Your feedback has been submitted." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
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
        "Failed to submit feedback. Please check your connection and try again.",
    };
  }
}

export async function getFeedbackEntries() {
  if (shouldUseApiClient()) {
    return [];
  }
  const session = await requireTanawSession();
  const isSuperadmin = session.user.role === "superadmin";
  const tenantId = session.user.tenantId;

  const query = async (db: any, whereClause: any) => {
    return db.supportTicket.findMany({
      where: whereClause,
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
      include: {
        requester: {
          select: { username: true, email: true },
        },
        tenant: {
          select: { name: true },
        },
      },
      take: 1000,
    });
  };

  if (isSuperadmin) {
    // Superadmin always queries at platform level to get ALL feedback across all tenants
    return await prisma.supportTicket.findMany({
      where: {},
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
      include: {
        requester: {
          select: { username: true, email: true },
        },
        tenant: {
          select: { name: true },
        },
      },
      take: 1000,
    });
  }

  if (!tenantId) {
    return await query(prisma, { tenant_id: -1 });
  }

  // Scoped view for the current tenant
  const scopedResults = await prisma.$withTenant(tenantId, async (tx: any) => {
    return await query(tx, { tenant_id: tenantId });
  });

  return scopedResults;
}

export async function updateSupportTicketStatus(
  input: z.infer<typeof feedbackUpdateSchema>,
) {
  if (shouldUseApiClient()) {
    return { success: "Feedback status has been updated." };
  }
  try {
    const session = await requireTanawSession();
    const tenantId = session.user.tenantId;
    const data = feedbackUpdateSchema.parse(input);

    const query = async (db: any) => {
      const existing = await db.supportTicket.findUnique({
        where: { id: data.id },
      });

      if (!existing) return { error: "Feedback entry not found." };
      if (
        session.user.role !== "superadmin" &&
        existing.tenant_id !== tenantId
      ) {
        return { error: "You are not allowed to update this feedback." };
      }

      await db.supportTicket.update({
        where: { id: data.id },
        data: { status: data.status },
      });

      return { success: "Feedback status has been updated." };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    if (result.success) {
      revalidateContentPaths();
    }
    return result;
  } catch (error) {
    console.error("updateSupportTicketStatus failed:", error);
    return { error: "Failed to update feedback." };
  }
}

export async function getContentWorkflowSummary() {
  if (shouldUseApiClient()) {
    return { pendingFaqs: 0, pendingTestimonials: 0, openFeedback: 0, testimonialFeedback: 0 };
  }
  const session = await requireTanawSession();
  ensureHomepageEditorRole(session.user.role);
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const tenantWhere =
      session.user.role === "superadmin" && tenantId === null
        ? {}
        : { tenant_id: tenantId ?? -1 };

    const feedbackWhere =
      session.user.role === "superadmin"
        ? tenantId === null
          ? {}
          : { OR: [{ tenant_id: tenantId }, { tenant_id: null }] }
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
      db.supportTicket.count({
        where: {
          ...feedbackWhere,
          status: { in: ["open", "in_review"] },
        },
      }),
      db.supportTicket.count({
        where: {
          ...feedbackWhere,
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

  return await prisma.$withTenant(tenantId, async (tx: any) => {
    return await query(tx);
  });
}

export async function updateTenantMetadata(data: {
  vision?: string;
  mission?: string;
  tagline?: string;
  heroSubheadline?: string;
  heroMediaUrl?: string;
  navIconUrl?: string;
  sectionVisibility?: {
    hero?: boolean;
    faqs?: boolean;
    testimonials?: boolean;
    stats?: boolean;
  };
}) {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    return { error: "Tenant context required." };
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
      select: { metadata: true },
    });

    const currentMeta = (tenant?.metadata as Record<string, unknown>) ?? {};
    const updatedMeta = {
      ...currentMeta,
      ...(data.vision !== undefined && { vision: data.vision }),
      ...(data.mission !== undefined && { mission: data.mission }),
      ...(data.tagline !== undefined && { tagline: data.tagline }),
      ...(data.heroSubheadline !== undefined && {
        heroSubheadline: data.heroSubheadline,
      }),
      ...(data.heroMediaUrl !== undefined && {
        hero_media_url: data.heroMediaUrl,
      }),
      ...(data.navIconUrl !== undefined && { nav_icon_url: data.navIconUrl }),
      ...(data.sectionVisibility !== undefined && {
        section_visibility: data.sectionVisibility,
      }),
    };

    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { metadata: updatedMeta },
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Homepage metadata updated." };
  } catch (error) {
    console.error("updateTenantMetadata failed:", error);
    return { error: "Failed to update metadata." };
  }
}
