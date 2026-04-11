"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { InterestTier, MaritalStatus } from "@prisma/client";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, verifyEmailExists } from "@/lib/mail";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  businessName: z.string().optional(),
  maritalStatus: z.enum([
    "single",
    "married",
    "widowed",
    "separated",
    "annulled",
  ]),
  birthdate: z.string(),
  gender: z.string(),
  region: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  streetAddress: z.string(),
  idPicture: z.string(),
  brgyCertUrl: z.string().optional(),
  businessPermitUrl: z.string().optional(),
  mothersMaidenName: z.string().optional(),
  placeOfBirth: z.string().optional(),
  tin: z.string().optional(),
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
    firstName,
    middleName,
    lastName,
    phone,
    businessName,
    maritalStatus,
    birthdate,
    gender,
    region,
    province,
    city,
    barangay,
    streetAddress,
    idPicture,
    brgyCertUrl,
    businessPermitUrl,
    mothersMaidenName,
    placeOfBirth,
    tin,
    tenantId,
  } = validatedFields.data;

  // Real-time SMTP Verification (Phase 2 Hardening)
  const isEmailReal = await verifyEmailExists(email);
  if (!isEmailReal) {
    return {
      error: "Email address does not exist! Please use a valid Gmail account.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    return { error: "Username already taken!" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Member Code (ASN-YYYY-SERIAL)
      const year = new Date().getFullYear();
      const count = await tx.user.count({
        where: { tenant_id: tenantId },
      });
      const serial = (count + 1).toString().padStart(4, "0");
      const member_code = `ASN-${year}-${serial}`;

      // 2. Create User
      const user = await (tx.user as any).create({
        data: {
          email,
          username,
          phone,
          member_code,
          password_hash: hashedPassword,
          tenant_id: tenantId,
          role: "member",
          interest_tier: "T1_3_PERCENT", // Default entry tier
        },
      });

      // 3. Create Profile
      await tx.userProfile.create({
        data: {
          user_id: user.user_id,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          gender: gender,
          birthdate: birthdate ? new Date(birthdate) : null,
          region,
          province,
          city,
          barangay,
          address: streetAddress,
          business_name: businessName,
          marital_status: maritalStatus,
          mothers_maiden_name: mothersMaidenName,
          place_of_birth: placeOfBirth,
          tin: tin,
          photo_url: idPicture,
        },
      });

      // 4. Create Documents
      await tx.userDocument.create({
        data: {
          user_id: user.user_id,
          document_type: "valid_id",
          file_url: idPicture,
          verification_status: "pending",
        },
      });

      if (brgyCertUrl) {
        await tx.userDocument.create({
          data: {
            user_id: user.user_id,
            document_type: "brgy_cert",
            file_url: brgyCertUrl,
            verification_status: "pending",
          },
        });
      }

      if (businessPermitUrl) {
        await tx.userDocument.create({
          data: {
            user_id: user.user_id,
            document_type: "business_permit",
            file_url: businessPermitUrl,
            verification_status: "pending",
          },
        });
      }

      return user;
    });

    const verificationToken = await generateVerificationToken(result.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return {
      success: "Verification email sent! Check your Gmail inbox.",
      memberCode: result.member_code,
    };
  } catch (error) {
    console.error("Registration transaction error:", error);
    return { error: "Something went wrong during registration!" };
  }
};
