import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenantId = parseInt(id, 10);
    if (isNaN(tenantId)) {
      return NextResponse.json({ status: "error", message: "Invalid tenant ID." }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId, is_active: true },
      select: {
        tenant_id: true,
        name: true,
        slug: true,
        logo_url: true,
        brand_color: true,
        accent_color: true,
        region: true,
        created_at: true,
        tenant_group: { select: { name: true, reg_code: true } },
      },
    });

    if (!tenant) {
      return NextResponse.json({ status: "error", message: "Tenant not found." }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: tenant });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
