"use server";

import { AccountType, Prisma, Role, TransactionType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { requireTanawSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import { serializeDecimal } from "@/lib/utils";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";
import { postLedgerEntry } from "./ledger";

type BillingCycleValue = "monthly" | "quarterly" | "semi_annually" | "annually";

function getPlanCyclePrice(plan: any, cycle: BillingCycleValue) {
  switch (cycle) {
    case "quarterly":
      return Number(plan.price_quarterly || plan.price_monthly || 0);
    case "semi_annually":
      return Number(plan.price_semi_annually || plan.price_monthly || 0);
    case "annually":
      return Number(plan.price_annually || plan.price_monthly || 0);
    default:
      return Number(plan.price_monthly || 0);
  }
}

async function creditSuperadminEarningsWallet(
  tx: any,
  amount: number,
  processedBy: number,
  superadminTenantId: number,
  superadminUserId: number,
) {
  if (amount <= 0) return;

  let superadminWallet = await tx.savingsAccount.findFirst({
    where: {
      tenant_id: superadminTenantId,
      user_id: superadminUserId,
      account_type: AccountType.personal_wallet,
    },
  });

  if (!superadminWallet) {
    superadminWallet = await tx.savingsAccount.create({
      data: {
        tenant_id: superadminTenantId,
        user_id: superadminUserId,
        account_type: AccountType.personal_wallet,
        owner_role: Role.superadmin,
        balance: new Prisma.Decimal(amount),
      },
    });
  } else {
    if (!superadminWallet.owner_role) {
      superadminWallet = await tx.savingsAccount.update({
        where: { account_id: superadminWallet.account_id },
        data: {
          owner_role: Role.superadmin,
          balance: { increment: new Prisma.Decimal(amount) },
        },
      });
    } else {
      superadminWallet = await tx.savingsAccount.update({
        where: { account_id: superadminWallet.account_id },
        data: { balance: { increment: new Prisma.Decimal(amount) } },
      });
    }
  }

  await tx.savingsTransaction.create({
    data: {
      account_id: superadminWallet.account_id,
      tenant_id: superadminTenantId,
      transaction_type: TransactionType.deposit,
      amount: new Prisma.Decimal(amount),
      reference: `SUPERADMIN-REVENUE-${Date.now()}`,
      processed_by: processedBy,
      issue_notes: "Superadmin subscription revenue allocation",
    },
  });
}

export async function getAvailablePlans() {
  if (shouldUseApiClient()) {
    return { success: true, plans: [] };
  }
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price_monthly: "asc" },
    });
    return serializeDecimal({ success: true, plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return {
      success: false,
      error: "Tanging superadmins ang may access sa lahat ng plans",
    };
  }
}

export async function getCurrentSubscription(tenantId: number) {
  if (shouldUseApiClient()) {
    return { success: true, subscription: null };
  }
  try {
    const sub = await prisma.tenantSubscription.findUnique({
      where: { tenant_id: tenantId },
      include: { plan: true },
    });
    return serializeDecimal({ success: true, subscription: sub });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return { success: false, error: "Failed to fetch subscription status." };
  }
}

export async function requestSubscriptionUpgrade(
  planId: number,
  billingCycle: BillingCycleValue,
  tenantSlug: string,
) {
  if (shouldUseApiClient()) {
    return { success: true, subscription: null, message: "Subscription request submitted." };
  }
  try {
    const session = await requireTanawSession();

    const isOperator = session.user.role === "operator";
    if (!isOperator && session.user.role !== "superadmin") {
      return {
        success: false,
        error: "Only tenant operators can request a subscription upgrade.",
      };
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return { success: false, error: "No active tenant context." };
    }

    const currentSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenant_id: tenantId },
      include: { plan: true },
    });

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.is_active) {
      return { success: false, error: "Invalid or inactive plan selected." };
    }

    const currentCycle = (currentSubscription?.billing_cycle || billingCycle) as BillingCycleValue;
    const currentPrice = currentSubscription?.plan
      ? getPlanCyclePrice(currentSubscription.plan, currentCycle)
      : 0;
    const nextPrice = getPlanCyclePrice(plan, billingCycle);
    const delta = Number((nextPrice - currentPrice).toFixed(2));

    const sub = await prisma.$transaction(async (tx: any) => {
      const savedSub = await tx.tenantSubscription.upsert({
        where: { tenant_id: tenantId },
        update: {
          plan_id: planId,
          billing_cycle: billingCycle,
          status: "pending",
        },
        create: {
          tenant_id: tenantId,
          plan_id: planId,
          billing_cycle: billingCycle,
          status: "pending",
        },
      });

      return savedSub;
    });

    revalidatePath(`/${tenantSlug}/agapay-tanaw`);
    return {
      success: true,
      subscription: sub,
      message:
        "Subscription request submitted successfully. Awaiting approval.",
    };
  } catch (error) {
    console.error("Failed to request upgrade:", error);
    return {
      success: false,
      error: "Naantala ang inyong kahilingan. Pakisubukan muli.",
    };
  }
}

export async function renewSubscription(
  tenantId: number,
  paymentReference: string,
  billingCycle: BillingCycleValue,
) {
  if (shouldUseApiClient()) {
    return { success: true, message: "Subscription renewed." };
  }

  try {
    const session = await requireTanawSession();
    const isOperator = session.user.role === "operator";
    if (!isOperator && session.user.role !== "superadmin") {
      return { success: false, error: "Only tenant operators can renew subscriptions." };
    }

    const currentSub = await prisma.tenantSubscription.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    if (!currentSub) {
      return { success: false, error: "No current subscription found." };
    }

    const now = new Date();
    const baseDate = currentSub.end_date > now ? currentSub.end_date : now;
    const newStart = new Date(baseDate);
    const newEnd = new Date(baseDate);

    switch (billingCycle) {
      case "monthly":
        newEnd.setMonth(newEnd.getMonth() + 1);
        break;
      case "quarterly":
        newEnd.setMonth(newEnd.getMonth() + 3);
        break;
      case "semi_annually":
        newEnd.setMonth(newEnd.getMonth() + 6);
        break;
      case "annually":
        newEnd.setMonth(newEnd.getMonth() + 12);
        break;
    }

    await prisma.tenantSubscription.create({
      data: {
        tenant_id: tenantId,
        plan_id: currentSub.plan_id,
        billing_cycle: billingCycle,
        status: "active",
        start_date: newStart,
        end_date: newEnd,
      },
    });

    await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: { entitlement_status: "active" },
    });

    const operators = await prisma.user.findMany({
      where: { tenant_id: tenantId, role: "operator", status: "active" },
    });
    for (const op of operators) {
      await createNotification({
        userId: op.user_id,
        tenantId,
        type: "tenant_approved",
        title: "Subscription Renewed",
        body: `Your subscription has been renewed until ${newEnd.toLocaleDateString()}.`,
      });
    }

    revalidatePath(`/`);
    return { success: true, startDate: newStart, endDate: newEnd };
  } catch (error) {
    console.error("Failed to renew subscription:", error);
    return { success: false, error: "Subscription renewal failed." };
  }
}

export async function availLifetimeFranchise(
  tenantId: number,
  availedType: string,
) {
  if (shouldUseApiClient()) {
    return { success: true, message: `Tenant availed as ${availedType} lifetime franchise.` };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const tenant = await prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: {
        entitlement_status: "availed",
        availed_type: availedType,
        lifetime_availed_at: new Date(),
      } as any,
      select: { slug: true },
    });

    revalidatePath(`/${tenant.slug}/agapay-tanaw`);
    return {
      success: true,
      message: `Tenant availed as ${availedType} lifetime franchise.`,
    };
  } catch (error) {
    console.error("Failed to avail lifetime franchise:", error);
    return { success: false, error: "Failed to process lifetime purchase." };
  }
}
export async function getAllSubscriptionPlans() {
  if (shouldUseApiClient()) {
    return { success: true, plans: [] };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price_monthly: "asc" },
    });
    return serializeDecimal({ success: true, plans });
  } catch (error) {
    console.error("Failed to fetch all plans:", error);
    return { success: false, error: "Failed to fetch subscription plans." };
  }
}

export async function updateSubscriptionPlan(
  planId: number,
  data: {
    tier_name?: string;
    price_monthly?: number;
    price_quarterly?: number;
    price_semi_annually?: number;
    price_annually?: number;
    max_members?: number;
    max_storage_mb?: number;
    features?: string[];
    is_active?: boolean;
  },
) {
  if (shouldUseApiClient()) {
    return { success: true, plan: null };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...data,
        price_monthly:
          data.price_monthly !== undefined ? data.price_monthly : undefined,
        price_quarterly:
          data.price_quarterly !== undefined ? data.price_quarterly : undefined,
        price_semi_annually:
          data.price_semi_annually !== undefined
            ? data.price_semi_annually
            : undefined,
        price_annually:
          data.price_annually !== undefined ? data.price_annually : undefined,
      },
    });
    revalidatePath("/agapay-tanaw");
    return { success: true, plan };
  } catch (error) {
    console.error("Failed to update plan:", error);
    return { success: false, error: "Failed to update subscription plan." };
  }
}

export async function getAllTenantSubscriptions() {
  if (shouldUseApiClient()) {
    return { success: true, tenants: [] };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: "asc" },
      include: {
        tenantSubscription: {
          include: { plan: true },
        },
      },
    });
    return serializeDecimal({ success: true, tenants });
  } catch (error) {
    console.error("Failed to fetch tenant subscriptions:", error);
    return { success: false, error: "Failed to fetch tenant subscriptions." };
  }
}

export async function updateTenantSubscription(
  tenantId: number,
  data: {
    status?: string;
    billing_cycle?: string;
    plan_id?: number;
  },
) {
  if (shouldUseApiClient()) {
    return { success: true, message: "Subscription updated." };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.billing_cycle) updateData.billing_cycle = data.billing_cycle;
    if (data.plan_id) updateData.plan_id = data.plan_id;

    const sub = await prisma.$transaction(async (tx: any) => {
      const currentSub = await tx.tenantSubscription.findUnique({
        where: { tenant_id: tenantId },
        include: { plan: true },
      });

      const nextPlanId = Number(data.plan_id || currentSub?.plan_id || 0);
      const nextPlan = nextPlanId
        ? await tx.subscriptionPlan.findUnique({ where: { id: nextPlanId } })
        : currentSub?.plan || null;
      const nextCycle = (data.billing_cycle ||
        currentSub?.billing_cycle ||
        "monthly") as BillingCycleValue;
      const shouldSettle = (data.status || currentSub?.status || "active") === "active";
      const currentPrice = currentSub?.plan
        ? getPlanCyclePrice(currentSub.plan, currentSub.billing_cycle as BillingCycleValue)
        : 0;
      const nextPrice = nextPlan ? getPlanCyclePrice(nextPlan, nextCycle) : currentPrice;
      const delta = Number((nextPrice - currentPrice).toFixed(2));

      const updatedSub = await tx.tenantSubscription.update({
        where: { tenant_id: tenantId },
        data: updateData,
      });

      if (shouldSettle && delta !== 0) {
        const operator = await tx.user.findFirst({
          where: { tenant_id: tenantId, role: "operator" },
          orderBy: { user_id: "asc" },
          select: { user_id: true },
        });
        const walletOwnerUserId = operator?.user_id || session.user.user_id;
        let wallet = await tx.savingsAccount.findFirst({
          where: {
            tenant_id: tenantId,
            user_id: walletOwnerUserId,
            account_type: AccountType.personal_wallet,
          },
        });

        if (!wallet) {
          wallet = await tx.savingsAccount.create({
            data: {
              tenant_id: tenantId,
              user_id: walletOwnerUserId,
              account_type: AccountType.personal_wallet,
              balance: 0,
            },
          });
        }

        const amount = Math.abs(delta);
        if (delta > 0 && Number(wallet.balance) < amount) {
          return {
            success: false,
            error: `Insufficient wallet balance. Required: ₱${amount.toLocaleString()}, Available: ₱${Number(wallet.balance).toLocaleString()}. Please top up before upgrading.`,
            code: "INSUFFICIENT_BALANCE",
          };
        }

        wallet = await tx.savingsAccount.update({
          where: { account_id: wallet.account_id },
          data:
            delta > 0
              ? { balance: { decrement: new Prisma.Decimal(amount) } }
              : { balance: { increment: new Prisma.Decimal(amount) } },
        });

        if (delta > 0) {
          await creditSuperadminEarningsWallet(
            tx,
            amount,
            session.user.user_id,
            session.user.tenantId!,
            session.user.user_id,
          );
        }

        const settlementReference = `SUB-${tenantId}-${Date.now()}`;
        await tx.savingsTransaction.create({
          data: {
            account_id: wallet.account_id,
            tenant_id: tenantId,
            transaction_type:
              delta > 0 ? TransactionType.withdrawal : TransactionType.deposit,
            amount: new Prisma.Decimal(amount),
            reference: settlementReference,
            processed_by: session.user.user_id,
            issue_notes:
              delta > 0
                ? "Subscription upgrade settlement"
                : "Subscription downgrade credit",
          },
        });

        await postLedgerEntry(tx, {
          tenantId,
          description:
            delta > 0
              ? `Subscription Upgrade Settlement: Tenant #${tenantId}`
              : `Subscription Downgrade Credit: Tenant #${tenantId}`,
          createdBy: session.user.user_id,
          metadata: {
            source: "subscription_update",
            previousPlanId: currentSub?.plan_id || null,
            nextPlanId: nextPlanId || null,
            previousPrice: currentPrice,
            nextPrice,
            delta,
            billingCycle: nextCycle,
          },
          entries:
            delta > 0
              ? [
                  { accountCode: "CASH_EQUIVALENTS", debit: amount, credit: 0 },
                  { accountCode: "MEMBER_SAVINGS", debit: 0, credit: amount },
                ]
              : [
                  { accountCode: "MEMBER_SAVINGS", debit: amount, credit: 0 },
                  { accountCode: "CASH_EQUIVALENTS", debit: 0, credit: amount },
                ],
        });

        await tx.billingInvoice.create({
          data: {
            tenant_id: tenantId,
            invoice_number: `SUB-${tenantId}-${Date.now()}`,
            amount: new Prisma.Decimal(amount),
            status: "paid",
            due_date: new Date(),
            paid_at: new Date(),
            payment_method: "wallet",
            reference: settlementReference,
            items: [
              {
                source: "subscription_update",
                requestor_user_id: session.user.user_id,
                previous_plan_id: currentSub?.plan_id || null,
                next_plan_id: nextPlanId || null,
                previous_price: currentPrice,
                next_price: nextPrice,
                delta,
                wallet_effect: delta > 0 ? "deduction" : "credit",
                billing_cycle: nextCycle,
              },
            ] as any,
          },
        });
      }

      return updatedSub;
    });

    revalidatePath("/agapay-tanaw");
    return { success: true, message: "Subscription updated successfully." };
  } catch (error) {
    console.error("Failed to update tenant subscription:", error);
    return { success: false, error: "Failed to update tenant subscription." };
  }
}

export async function approveSubscriptionUpgrade(tenantId: number) {
  if (shouldUseApiClient()) {
    return { success: true, message: "Subscription approved." };
  }
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const pendingInvoice = await tx.billingInvoice.findFirst({
        where: {
          tenant_id: tenantId,
          status: "pending",
        },
        orderBy: { created_at: "desc" },
      });

      const invoiceItems = Array.isArray(pendingInvoice?.items)
        ? (pendingInvoice?.items as any[])
        : [];
      const billingDelta = Number(invoiceItems[0]?.delta || 0);
      const walletOwnerUserId = Number(
        invoiceItems[0]?.requestor_user_id || session.user.user_id,
      );

      if (billingDelta !== 0) {
        let wallet = await tx.savingsAccount.findFirst({
          where: {
            tenant_id: tenantId,
            user_id: walletOwnerUserId,
            account_type: AccountType.personal_wallet,
          },
        });

        if (!wallet) {
          wallet = await tx.savingsAccount.create({
            data: {
              tenant_id: tenantId,
              user_id: walletOwnerUserId,
              account_type: AccountType.personal_wallet,
              balance: 0,
            },
          });
        }

        const amount = Math.abs(billingDelta);
        if (billingDelta > 0 && Number(wallet.balance) < amount) {
          return {
            success: false,
            error: `Insufficient wallet balance. Required: ₱${amount.toLocaleString()}, Available: ₱${Number(wallet.balance).toLocaleString()}. Please top up your wallet before upgrading.`,
            code: "INSUFFICIENT_BALANCE",
          };
        }

        wallet = await tx.savingsAccount.update({
          where: { account_id: wallet.account_id },
          data: {
            balance:
              billingDelta > 0
                ? { decrement: new Prisma.Decimal(amount) }
                : { increment: new Prisma.Decimal(amount) },
          },
        });

        if (billingDelta > 0) {
          await creditSuperadminEarningsWallet(
            tx,
            amount,
            session.user.user_id,
            session.user.tenantId!,
            session.user.user_id,
          );
        }

        const txType =
          billingDelta > 0 ? TransactionType.withdrawal : TransactionType.deposit;
        const reference = pendingInvoice?.reference || `SUB-${tenantId}-${Date.now()}`;

        await tx.savingsTransaction.create({
          data: {
            account_id: wallet.account_id,
            tenant_id: tenantId,
            transaction_type: txType,
            amount: new Prisma.Decimal(amount),
            reference,
            processed_by: session.user.user_id,
            issue_notes:
              billingDelta > 0
                ? "Subscription upgrade charge"
                : "Subscription downgrade credit",
          },
        });

        await postLedgerEntry(tx, {
          tenantId,
          description:
            billingDelta > 0
              ? `Subscription Charge: Tenant #${tenantId}`
              : `Subscription Credit: Tenant #${tenantId}`,
          createdBy: session.user.user_id,
          metadata: {
            source: "subscription_billing",
            delta: billingDelta,
            invoiceId: pendingInvoice?.id || null,
          },
          entries: billingDelta > 0
            ? [
                { accountCode: "CASH_EQUIVALENTS", debit: amount, credit: 0 },
                { accountCode: "MEMBER_SAVINGS", debit: 0, credit: amount },
              ]
            : [
                { accountCode: "MEMBER_SAVINGS", debit: amount, credit: 0 },
                { accountCode: "CASH_EQUIVALENTS", debit: 0, credit: amount },
              ],
        });

        if (pendingInvoice) {
          await tx.billingInvoice.update({
            where: { id: pendingInvoice.id },
            data: {
              status: "paid",
              paid_at: new Date(),
            },
          });
        }
      }

      // 1. Update subscription status
      const sub = await tx.tenantSubscription.update({
        where: { tenant_id: tenantId },
        data: { status: "active" }, // Change from verified/pending to active
        include: { plan: true },
      });

      // 2. Update tenant entitlement
      const tenant = await tx.tenant.update({
        where: { tenant_id: tenantId },
        data: {
          entitlement_status: "active",
          lifetime_availed_at: new Date(),
        },
      });

      // 3. Log Audit
      await tx.auditLog.create({
        data: {
          action: "APPROVE_SUBSCRIPTION",
          entity_type: "Tenant",
          entity_id: tenantId,
          user_id: session.user.user_id,
          new_values: {
            plan: sub.plan.tier_name,
            status: "active",
          } as any,
        },
      });

      return { sub, tenant };
    });

    revalidatePath("/agapay-tanaw");
    return {
      success: true,
      message: `Subscription approved. Tenant "${result.tenant.name}" is now active.`,
    };
  } catch (error) {
    console.error("Failed to approve subscription:", error);
    return { success: false, error: "Failed to approve subscription." };
  }
}

export async function rejectSubscriptionUpgrade(tenantId: number, reason?: string) {
  try {
    const session = await requireTanawSession();
    if (session.user.role !== "superadmin") {
      return { success: false, error: "Unauthorized. Superadmin only." };
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Refund any pending invoice charges
      const pendingInvoice = await tx.billingInvoice.findFirst({
        where: { tenant_id: tenantId, status: "pending" },
        orderBy: { created_at: "desc" },
      });

      if (pendingInvoice) {
        await tx.billingInvoice.update({
          where: { id: pendingInvoice.id },
          data: { status: "cancelled", paid_at: null },
        });
      }

      // Reset subscription status
      const sub = await tx.tenantSubscription.findFirst({
        where: { tenant_id: tenantId },
        orderBy: { created_at: "desc" },
      });

      if (sub) {
        await tx.tenantSubscription.update({
          where: { id: sub.id },
          data: { status: "active" },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "REJECT_SUBSCRIPTION_UPGRADE",
          entity_type: "Tenant",
          entity_id: tenantId,
          user_id: session.user.user_id,
          new_values: { status: "rejected", reason: reason || "No reason provided" } as any,
        },
      });

      return { success: true };
    });

    return { success: true, message: "Subscription upgrade rejected and reverted." };
  } catch (error) {
    console.error("Failed to reject subscription:", error);
    return { success: false, error: "Failed to reject subscription upgrade." };
  }
}
