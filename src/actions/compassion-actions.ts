"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { MICROFINANCE_POLICY } from "@/lib/microfinance-policy";

/**
 * Zod Schema for Member Request
 */
const RequestCompassionSchema = z.object({
  loan_id: z.number(),
  action_type: z.enum(["grace_period", "term_extension", "penalty_freeze"]),
  reason: z
    .string()
    .min(10, "Please provide a detailed reason (at least 10 characters)."),
});

/**
 * Members request compassion/relief on an active loan.
 */
export const requestCompassionAction = async (
  values: z.infer<typeof RequestCompassionSchema>,
) => {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Not authenticated or tenant not found!" };
  }

  if (!session.user.tenantId) {
    return { error: "Tenant not found!" };
  }

  const validatedFields = RequestCompassionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { loan_id, action_type, reason } = validatedFields.data;
  const userId = session.user.user_id;

  try {
    // Ensure loan belongs to member and is active (hardship usually applies to active loans)
    const loan = await (prisma as any).loan.findFirst({
      where: {
        loan_id,
        user_id: userId,
        status: "active",
      },
      include: {
        compassion_actions: true,
      },
    });

    if (!loan) {
      return { error: "Loan not found or ineligible for request." };
    }

    // Protect against spam (only 1 pending request allowed)
    const hasPending = loan.compassion_actions.some(
      (c: any) => c.status === "pending",
    );
    if (hasPending) {
      return { error: "You already have a pending requested action." };
    }

    // Ensure they haven't exhausted the 1-per-cycle limit
    const approvedCount = loan.compassion_actions.filter(
      (c: any) => c.status === "approved",
    ).length;
    if (approvedCount >= 1) {
      return {
        error: "Compassion policies are limited to once per loan cycle.",
      };
    }

    await prisma.compassionAction.create({
      data: {
        loan_id,
        action_type,
        reason,
        status: "pending",
        requested_by: userId,
      },
    });

    revalidatePath("/(authenticated)/dashboard");
    revalidatePath("/(authenticated)/loans");

    return { success: true };
  } catch (error) {
    console.error("[REQUEST_COMPASSION_ERROR]", error);
    return { error: "Internal Error" };
  }
};

/**
 * Zod Schema for Admin Approval/Rejection
 */
const ProcessCompassionSchema = z.object({
  action_id: z.number(),
  status: z.enum(["approved", "rejected"]),
  admin_notes: z
    .string()
    .min(5, "You must provide feedback notes for the member."),
});

/**
 * Admins/Superadmins process a pending compassion request with feedback.
 */
export const processCompassionAction = async (
  values: z.infer<typeof ProcessCompassionSchema>,
) => {
  let session;
  try {
    session = await requireAuthenticatedSession();
  } catch {
    return { error: "Not authenticated!" };
  }

  const { role, tenantId, user_id: adminId } = session.user;
  if (!["admin", "superadmin"].includes(role)) {
    return { error: "Unauthorized access: requires admin or superadmin." };
  }

  const validatedFields = ProcessCompassionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields! Admin notes are required." };
  }

  const { action_id, status, admin_notes } = validatedFields.data;

  try {
    const action = await (prisma as any).compassionAction.findUnique({
      where: { action_id },
      include: { loan: { include: { product: true } } },
    });

    if (!action) {
      return { error: "Action not found." };
    }

    // Ensure tenant bounds unless superadmin
    if (role === "admin" && action.loan.tenant_id !== tenantId) {
      return { error: "Unauthorized tenant boundary violation!" };
    }

    if (action.status !== "pending") {
      return { error: "Action has already been processed." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update the Compassion Action Status and Feedback
      await tx.compassionAction.update({
        where: { action_id },
        data: {
          status: status as any,
          admin_notes,
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      // 2. If approved, apply corresponding business logic shifts
      if (status === "approved") {
        if (action.action_type === "grace_period") {
          // Grace Period: shift all unpaid schedules forward by 1 interval
          // For simplicity, we just push their due dates later.
          // Note: In a production environment with rigorous calendars, this requires
          // recalibrating exact days based on frequency.

          await tx.$executeRaw`
            UPDATE loan_schedules
            SET due_date = due_date + interval '${Prisma.raw(
              `${MICROFINANCE_POLICY.gracePeriodDays} days`,
            )}' 
            WHERE loan_id = ${action.loan_id} AND status = 'pending'
          `;
        } else if (action.action_type === "penalty_freeze") {
          // Penalty Freeze: Zero out applied penalties dynamically
          await tx.loanSchedule.updateMany({
            where: {
              loan_id: action.loan_id,
              status: { in: ["pending", "overdue"] },
            },
            data: { penalty_applied: new Prisma.Decimal(0) },
          });
        }
        // Restructure requires complex principal recalculations that differ per org
      }
    });

    revalidatePath("/agapay-tanaw/(authenticated)/compassion");
    return { success: true };
  } catch (error) {
    console.error("[PROCESS_COMPASSION_ERROR]", error);
    return { error: "Internal Error" };
  }
};
