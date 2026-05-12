import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.homepageTestimonial.findMany({
      where: {
        tenant_id: null,
        workflow_status: "published",
        is_active: true,
      },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    });

    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json(
      { testimonials: [] },
      { status: 200 },
    );
  }
}
