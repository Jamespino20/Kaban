"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession, requireTanawSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const faqSchema = z.object({
  id: z.number().int().positive().optional(),
  question: z.string().trim().min(5).max(255),
  answer: z.string().trim().min(10),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

const testimonialSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(150),
  role_label: z.string().trim().min(2).max(150),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  content: z.string().trim().min(15),
  season_tag: z.string().trim().max(100).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().optional().or(z.literal("")),
  category: z.string().trim().min(2).max(100),
  page_path: z.string().trim().max(255).optional().or(z.literal("")),
  subject: z.string().trim().max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10),
});

export async function getHomepageContent() {
  const [faqs, testimonials] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
    prisma.homepageTestimonial.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
  ]);

  return { faqs, testimonials };
}

export async function getHomepageContentAdmin() {
  const session = await requireTanawSession();
  const tenantId = session.user.role === "superadmin" ? undefined : session.user.tenantId;

  const where = tenantId ? { OR: [{ tenant_id: tenantId }, { tenant_id: null }] } : {};

  const [faqs, testimonials] = await Promise.all([
    prisma.homepageFaq.findMany({
      where,
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
    prisma.homepageTestimonial.findMany({
      where,
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    }),
  ]);

  return { faqs, testimonials };
}

export async function saveHomepageFaq(input: z.infer<typeof faqSchema>) {
  try {
    const session = await requireTanawSession();
    const data = faqSchema.parse(input);
    const tenantId = session.user.role === "superadmin" ? null : session.user.tenantId;

    if (data.id) {
      const existing = await prisma.homepageFaq.findUnique({ where: { id: data.id } });
      if (!existing) return { error: "FAQ not found." };
      if (session.user.role !== "superadmin" && existing.tenant_id !== tenantId) {
        return { error: "Unauthorized" };
      }
    }

    await prisma.homepageFaq.upsert({
      where: { id: data.id ?? 0 },
      update: {
        question: data.question,
        answer: data.answer,
        is_active: data.is_active,
        sort_order: data.sort_order,
      },
      create: {
        tenant_id: tenantId ?? null,
        question: data.question,
        answer: data.answer,
        is_active: data.is_active,
        sort_order: data.sort_order,
      },
    });

    revalidatePath("/");
    revalidatePath("/agapay-tanaw");
    return { success: "FAQ updated." };
  } catch (error) {
    console.error("saveHomepageFaq failed:", error);
    return { error: "Failed to save FAQ." };
  }
}

export async function saveHomepageTestimonial(
  input: z.infer<typeof testimonialSchema>,
) {
  try {
    const session = await requireTanawSession();
    const data = testimonialSchema.parse(input);
    const tenantId = session.user.role === "superadmin" ? null : session.user.tenantId;

    if (data.id) {
      const existing = await prisma.homepageTestimonial.findUnique({
        where: { id: data.id },
      });
      if (!existing) return { error: "Testimonial not found." };
      if (session.user.role !== "superadmin" && existing.tenant_id !== tenantId) {
        return { error: "Unauthorized" };
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
        is_active: data.is_active,
        sort_order: data.sort_order,
      },
      create: {
        tenant_id: tenantId ?? null,
        name: data.name,
        role_label: data.role_label,
        photo_url: data.photo_url || null,
        content: data.content,
        season_tag: data.season_tag || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
      },
    });

    revalidatePath("/");
    revalidatePath("/agapay-tanaw");
    return { success: "Testimonial updated." };
  } catch (error) {
    console.error("saveHomepageTestimonial failed:", error);
    return { error: "Failed to save testimonial." };
  }
}

export async function submitFeedback(input: z.infer<typeof feedbackSchema>) {
  try {
    const data = feedbackSchema.parse(input);
    let session = null;
    try {
      session = await requireAuthenticatedSession();
    } catch {}

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

    revalidatePath("/agapay-tanaw");
    revalidatePath("/agapay-pintig");
    return { success: "Naipasa na ang feedback mo." };
  } catch (error) {
    console.error("submitFeedback failed:", error);
    return { error: "Hindi maipasa ang feedback." };
  }
}

export async function getFeedbackEntries() {
  const session = await requireTanawSession();
  return prisma.feedbackEntry.findMany({
    where:
      session.user.role === "superadmin"
        ? {}
        : { tenant_id: session.user.tenantId },
    orderBy: { created_at: "desc" },
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
