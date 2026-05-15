import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.tenantGroup.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        reg_code: true,
        tenants: {
          where: { is_active: true },
          select: { tenant_id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ status: "success", data: groups });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
