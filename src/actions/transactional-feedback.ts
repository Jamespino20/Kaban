"use server";

import prisma, { getBranchPrisma } from "@/lib/prisma";
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

    const db = getBranchPrisma(session.user.tenantSlug);

    await db.feedbackEntry.create({
      data: {
        tenant_id: session.user.tenantId,
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

    return { success: "Salamat sa iyong feedback!" };
  } catch (error: any) {
    console.error("Feedback error:", error);
    return {
      error: "Unable to submit feedback at this time. Please try again later.",
    };
  }
}
