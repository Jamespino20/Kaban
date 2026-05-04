"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, verifyEmailExists } from "@/lib/mail";

const RegisterSchema = z.object({
  email: z.string().email().max(100),
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(10).max(20),
  businessName: z.string().max(150).optional(),
  maritalStatus: z.enum([
    "single",
    "married",
    "widowed",
    "separated",
    "annulled",
  ]),
  birthdate: z.string(),
  gender: z.string().max(20),
  region: z.string().max(255),
  province: z.string().max(255),
  city: z.string().max(255),
  barangay: z.string().max(255),
  streetAddress: z.string().max(500),
  idPicture: z.string(),
  brgyCertUrl: z.string().optional(),
  businessPermitUrl: z.string().optional(),
  mothersMaidenName: z.string().max(150).optional(),
  placeOfBirth: z.string().max(150).optional(),
  tin: z.string().max(20).optional(),
  tenantId: z.number().int().positive("Please select a branch"),
});

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation error:", validatedFields.error);
    return { error: "Invalid fields!" };
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

  try {
    const user = await prisma.user.create({
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
