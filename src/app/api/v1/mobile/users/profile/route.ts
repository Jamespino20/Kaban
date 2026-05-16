import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
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

    return NextResponse.json({ status: "success", data: { id: user.user_id, ...user } });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const auth = await getAuthUser(req);
    const body = await req.json();
    const validated = UpdateProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ status: "error", message: "Invalid fields." }, { status: 400 });
    }

    const { firstName, lastName, email, phone, photoUrl } = validated.data;

    const updateData: any = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (photoUrl !== undefined) updateData.photo_url = photoUrl;

    if (Object.keys(updateData).length > 0) {
      await prisma.userProfile.update({
        where: { user_id: auth.user_id },
        data: updateData,
      });
    }

    if (email !== undefined || phone !== undefined) {
      const userUpdate: any = {};
      if (email !== undefined) userUpdate.email = email;
      if (phone !== undefined) userUpdate.phone = phone;
      await prisma.user.update({ where: { user_id: auth.user_id }, data: userUpdate });
    }

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
        profile: true,
      },
    });

    return NextResponse.json({ status: "success", data: { id: user?.user_id, ...user } });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
