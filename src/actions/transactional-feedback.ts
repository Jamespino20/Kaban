"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const FeedbackSchema = z.object({
  category: z.string(),
  message: z.string(),
  subject: z.string().optional(),
  pagePath: z.string().optional(),
});

export async function submitContextualFeedback(
  input: z.infer<typeof FeedbackSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const parsed = FeedbackSchema.parse(input);

    const tenantId = session.user.tenantId;

    if (tenantId) {
      await prisma.$withTenant(tenantId, async (tx) => {
        await tx.feedbackEntry.create({
          data: {
            tenant_id: tenantId,
            user_id: Number(session.user.id),
            name: session.user.name || "Anonymous Member",
            email: session.user.email,
            category: parsed.category,
            message: parsed.message,
            subject: parsed.subject,
            page_path: parsed.pagePath,
            status: "open",
          },
        });
      });
    } else {
      await prisma.feedbackEntry.create({
        data: {
          user_id: Number(session.user.id),
          name: session.user.name || "Anonymous Admin",
          email: session.user.email,
          category: parsed.category,
          message: parsed.message,
          subject: parsed.subject,
          page_path: parsed.pagePath,
          status: "open",
        },
      });
    }

    return { success: "Salamat sa iyong feedback!" };
  } catch (error: any) {
    console.error("Feedback error:", error);
    return {
      error: "Unable to submit feedback at this time. Please try again later.",
    };
  }
}

export async function getUserFeedbackTickets() {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    const userId = Number(session.user.id);
    const tenantId = session.user.tenantId;

    if (tenantId) {
      return await prisma.$withTenant(tenantId, async (tx) => {
        return await tx.feedbackEntry.findMany({
          where: { user_id: userId },
          orderBy: { created_at: "desc" },
          take: 20,
          select: {
            id: true,
            category: true,
            subject: true,
            message: true,
            status: true,
            created_at: true,
            resolved_at: true,
          },
        });
      });
    }

    return [];
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return [];
  }
}
