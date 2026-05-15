import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const products = await prisma.loanProduct.findMany({
      where: { tenant_id: auth.tenant_id, is_active: true },
      select: {
        product_id: true,
        name: true,
        description: true,
        min_amount: true,
        max_amount: true,
        interest_rate_percent: true,
        max_term_months: true,
        allowed_frequencies: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ status: "success", data: products });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
