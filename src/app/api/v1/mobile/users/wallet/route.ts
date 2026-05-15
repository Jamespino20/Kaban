import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const savingsAccount = await prisma.savingsAccount.findUnique({
      where: { user_id_account_type: { user_id: auth.user_id, account_type: "personal_wallet" } },
      select: {
        account_id: true,
        balance: true,
        is_locked: true,
        updated_at: true,
      },
    });

    const transactions = await prisma.savingsTransaction.findMany({
      where: { account: { user_id: auth.user_id } },
      orderBy: { processed_at: "desc" },
      take: 20,
      select: {
        transaction_id: true,
        transaction_type: true,
        amount: true,
        fee_amount: true,
        net_amount: true,
        status: true,
        method_label: true,
        reference: true,
        processed_at: true,
      },
    });

    return NextResponse.json({
      status: "success",
      data: {
        wallet: savingsAccount || { balance: 0, is_locked: false },
        recent_transactions: transactions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
