import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { is_active: true },
      select: {
        tenant_id: true,
        name: true,
        slug: true,
        logo_url: true,
        brand_color: true,
        region: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ status: "success", data: tenants });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
