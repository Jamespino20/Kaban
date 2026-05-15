import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/v1/mobile/_helpers";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser(req);

    const user = await prisma.user.findUnique({
      where: { user_id: auth.user_id },
      select: {
        user_id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        member_code: true,
        tenant_id: true,
        created_at: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        id: user.user_id,
        ...user
      }
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
