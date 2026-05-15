import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { sql } from "@/lib/db";
import prisma from "@/lib/prisma";
import { createAuthToken } from "../../_helpers";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  phone: z.string().min(10),
  maritalStatus: z.string().min(1),
  birthdate: z.string().min(1),
  gender: z.string().min(1),
  region: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  barangay: z.string().min(1),
  streetAddress: z.string().min(1),
  idPicture: z.string().min(1),
  tenantId: z.number().int().positive(),
  businessName: z.string().optional(),
  placeOfBirth: z.string().optional(),
  tin: z.string().optional(),
  brgyCertUrl: z.string().optional(),
  businessPermitUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = RegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid fields." },
        { status: 400 },
      );
    }

    const {
      email,
      password,
      username,
      tenantId,
      firstName,
      lastName,
      middleName,
      birthdate,
      gender,
      maritalStatus,
      phone,
      businessName,
      streetAddress,
      region,
      province,
      city,
      barangay,
      idPicture,
      brgyCertUrl,
      businessPermitUrl,
      placeOfBirth,
      tin,
    } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email, tenant_id: tenantId },
          { username, tenant_id: tenantId },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "Email or username already in use in this tenant." },
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
      select: { slug: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { status: "error", message: "Tenant not found." },
        { status: 404 }
      );
    }

    const result = await prisma.$withTenant(tenantId, async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          username,
          password_hash: hashedPassword,
          tenant_id: tenantId,
          role: "member",
          profile: {
            create: {
              first_name: firstName,
              last_name: lastName,
              middle_name: middleName,
              birthdate: new Date(birthdate),
              gender,
              marital_status: maritalStatus as any,
              business_name: businessName,
              address: streetAddress,
              region,
              province,
              city,
              barangay,
              place_of_birth: placeOfBirth,
              tin,
              photo_url: idPicture,
              tenant_id: tenantId,
            },
          },
          documents: {
            create: [
              {
                document_type: "valid_id",
                file_url: idPicture,
                tenant_id: tenantId,
              },
              ...(brgyCertUrl ? [{ document_type: "brgy_cert", file_url: brgyCertUrl, tenant_id: tenantId }] : []),
              ...(businessPermitUrl ? [{ document_type: "business_permit", file_url: businessPermitUrl, tenant_id: tenantId }] : []),
            ],
          },
        },
      });

      const roleInitial = "M";
      const tenantPrefix = tenant.slug.toUpperCase().replace(/_/g, "-");
      const randomTag = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seqNum = user.user_id.toString().padStart(4, "0");
      const memberCode = `${tenantPrefix}-${roleInitial}-${randomTag}-${seqNum}`;

      await tx.user.update({
        where: { user_id: user.user_id },
        data: { member_code: memberCode },
      });

      const verificationToken = await generateVerificationToken(email, tenantId);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, tenant.slug);

      return {
        status: "success",
        message: "Registration successful. Please verify your email.",
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          member_code: memberCode,
          tenant_id: tenantId,
        },
        newUserId: user.user_id,
        newTenantId: tenantId,
      };
    });

    const token = await createAuthToken(result.newUserId, result.newTenantId);
    return NextResponse.json({ ...result, token, newUserId: undefined, newTenantId: undefined }, { status: 201 });
  } catch (error) {
    console.error("Mobile registration error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error." },
      { status: 500 }
    );
  }
}
