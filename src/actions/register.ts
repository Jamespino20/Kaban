"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  birthdate: z.string(),
  gender: z.string(),
  region: z.string(),
  province: z.string(),
  city: z.string(),
  barangay: z.string(),
  idPicture: z.string(),
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
    birthdate,
    gender,
    region,
    province,
    city,
    barangay,
    idPicture,
  } = validatedFields.data;

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

  // Find a default tenant for now or handle multi-tenancy registration logic
  const defaultTenant = await prisma.tenant.findFirst();
  if (!defaultTenant) return { error: "No storage units available" };

  const user = await prisma.user.create({
    data: {
      email,
      username,
      phone,
      password_hash: hashedPassword,
      tenant_id: defaultTenant.tenant_id,
      role: "member",
    },
  });

  // Create Profile
  await prisma.userProfile.create({
    data: {
      user_id: user.user_id,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender: gender,
      birthdate: new Date(birthdate),
      region,
      province,
      city,
      barangay,
      photo_url: idPicture,
    },
  });

  // Create ID Document entry
  await prisma.userDocument.create({
    data: {
      user_id: user.user_id,
      document_type: "valid_id",
      file_url: idPicture,
      verification_status: "pending",
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Verification email sent! Check your Gmail inbox." };
};
