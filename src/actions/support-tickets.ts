"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";

export async function createIssueTicket(input: {
  subject: string;
  description: string;
  category: "wallet_issue" | "loan_issue" | "payment_issue" | "member_complaint" | "general_support";
  relatedEntityType?: string;
  relatedEntityId?: string;
}) {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;
  const userId = session.user.user_id;

  if (!tenantId) return { error: "Tenant context required." };

  try {
    const ticketNumber = `ISS-${Date.now().toString(36).toUpperCase()}`;

    await prisma.$withTenant(tenantId, async (tx: any) => {
      await tx.supportTicket.create({
        data: {
          ticket_number: ticketNumber,
          ticket_type: "SUPPORT",
          tenant_id: tenantId,
          requester_id: userId,
          category: input.category,
          module_context: "general",
          subject: input.subject,
          description: input.description,
          related_entity_type: input.relatedEntityType ?? null,
          related_entity_id: input.relatedEntityId ?? null,
          status: "open",
        },
      });
    });

    return { success: "Issue reported successfully. A support ticket has been created." };
  } catch (error) {
    console.error("createIssueTicket failed:", error);
    return { error: "Failed to create support ticket. Please try again." };
  }
}
