"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getPaymentReceiptData(paymentId: number) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) throw new Error("Unauthorized");

  const payment = await prisma.payment.findFirst({
    where: {
      payment_id: paymentId,
      tenant_id: tenantId,
    },
    include: {
      loan: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              user_id: true,
            },
          },
        },
      },
      payment_method: true,
      tenant: {
        select: {
          name: true,
          logo_url: true,
          brand_color: true,
          region: true,
        },
      },
    },
  });

  if (!payment) throw new Error("Payment not found");

  return payment;
}
