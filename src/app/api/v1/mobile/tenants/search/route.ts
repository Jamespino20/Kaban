import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ status: "error", message: "Query parameter 'q' is required." }, { status: 400 });
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        is_active: true,
        name: { contains: q },
      },
      select: {
        tenant_id: true,
        name: true,
        slug: true,
        logo_url: true,
        region: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return NextResponse.json({ status: "success", data: tenants });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
