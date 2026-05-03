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

  const { password, maritalStatus, birthdate, tenantId } = validatedFields.data;
  const email = validatedFields.data.email.trim().toLowerCase();
  const username = validatedFields.data.username.trim();
  const firstName = validatedFields.data.firstName.trim();
  const middleName = validatedFields.data.middleName?.trim() || undefined;
  const lastName = validatedFields.data.lastName.trim();
  const phone = validatedFields.data.phone.trim();
  const businessName = validatedFields.data.businessName?.trim() || undefined;
  const gender = validatedFields.data.gender.trim();
  const region = validatedFields.data.region.trim();
  const province = validatedFields.data.province.trim();
  const city = validatedFields.data.city.trim();
  const barangay = validatedFields.data.barangay.trim();
  const streetAddress = validatedFields.data.streetAddress.trim();
  const idPicture = validatedFields.data.idPicture.trim();
  const brgyCertUrl = validatedFields.data.brgyCertUrl?.trim() || undefined;
  const businessPermitUrl =
    validatedFields.data.businessPermitUrl?.trim() || undefined;
  const mothersMaidenName =
    validatedFields.data.mothersMaidenName?.trim() || undefined;
  const placeOfBirth = validatedFields.data.placeOfBirth?.trim() || undefined;
  const tin = validatedFields.data.tin?.trim() || undefined;

  // Real-time SMTP Verification (Phase 2 Hardening)
  const isEmailReal = await verifyEmailExists(email);
  if (!isEmailReal) {
    return {
      error: "Email address does not exist! Please use a valid Gmail account.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const targetTenant = await prisma.tenant.findUnique({
    where: { tenant_id: tenantId },
    select: {
      tenant_id: true,
      is_active: true,
      entitlement_status: true,
    },
  });

  if (
    !targetTenant ||
    !targetTenant.is_active ||
    targetTenant.entitlement_status !== "active"
  ) {
    return {
      error: "This branch is not yet available for new registrations.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: { email, tenant_id: tenantId },
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  const existingUsername = await prisma.user.findFirst({
    where: { username, tenant_id: tenantId },
  });

  if (existingUsername) {
    return { error: "Username already taken!" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Member Code (AGP-YYYY-SERIAL)
      const year = new Date().getFullYear();
      const count = await tx.user.count({
        where: { tenant_id: tenantId },
      });
      const serial = (count + 1).toString().padStart(4, "0");
      const member_code = `AGP-${year}-${serial}`;

      // 2. Create User
      const user = await tx.user.create({
        data: {
          email,
          username,
          phone,
          member_code,
          password_hash: hashedPassword,
          tenant_id: tenantId,
          role: "member",
          interest_tier: "T1_5_PERCENT", // Default entry tier
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

    const verificationToken = await generateVerificationToken(
      result.email,
      result.tenant_id,
    );
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2000"
    ) {
      return {
        error:
          "A detail or uploaded document is too large to save. Please try reducing address fields or using a smaller image.",
      };
    }

    return { error: "Something went wrong during registration!" };
  }
};
