"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma, { getBranchPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, verifyEmailExists } from "@/lib/mail";

const RegisterSchema = z.object({
  email: z
    .string()
    .email("Invalid email format.")
    .max(100, "Email is too long."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(50, "Username is too long."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(100, "Password is too long."),
  firstName: z.string().min(1, "First name is required.").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, "Last name is required.").max(100),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .max(20, "Phone number is too long."),
  businessName: z.string().max(150).optional(),
  maritalStatus: z.string().min(1, "Please select your marital status.") as any,
  birthdate: z.string().min(1, "Birthdate is required."),
  gender: z.string().min(1, "Gender is required.").max(20),
  region: z.string().min(1, "Region is required.").max(255),
  province: z.string().min(1, "Province is required.").max(255),
  city: z.string().min(1, "City is required.").max(255),
  barangay: z.string().min(1, "Barangay is required.").max(255),
  streetAddress: z.string().min(1, "Residential address is required.").max(500),
  idPicture: z.string().min(1, "ID picture is required."),
  brgyCertUrl: z.string().optional(),
  businessPermitUrl: z.string().optional(),
  mothersMaidenName: z.string().max(150).optional(),
  placeOfBirth: z.string().max(150).optional(),
  tin: z.string().max(20).optional(),
  tenantId: z.number().int().positive("Please select a branch (Cooperative)."),
});

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0]?.message || "Invalid fields.";
    return { error };
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
    mothersMaidenName,
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
    return { error: "Email or username already in use in this branch." };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { tenant_id: tenantId },
    select: { slug: true },
  });

  if (!tenant) {
    return { error: "Branch not found." };
  }

  const db = getBranchPrisma(tenant.slug);

  try {
    const user = await db.user.create({
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
            mothers_maiden_name: mothersMaidenName,
            place_of_birth: placeOfBirth,
            tin,
            photo_url: idPicture,
          },
        },
        documents: {
          create: [
            {
              document_type: "valid_id",
              file_url: idPicture,
            },
            ...(brgyCertUrl
              ? [
                  {
                    document_type: "brgy_cert" as any,
                    file_url: brgyCertUrl,
                  },
                ]
              : []),
            ...(businessPermitUrl
              ? [
                  {
                    document_type: "business_permit" as any,
                    file_url: businessPermitUrl,
                  },
                ]
              : []),
          ],
        },
      },
    });

    const memberCode = `ASN-${user.user_id.toString().padStart(4, "0")}`;

    const verificationToken = await generateVerificationToken(email, tenantId);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return {
      success:
        "Confirmation email sent! Please verify your email to activate your account.",
      memberCode,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
};
