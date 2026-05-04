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
return { error: "Please check the form fields and try again." };
    return { error: "An account with this email already exists. Please use a different email or check your login options." };
    return { error: "This username is already taken. Please choose a different one." };
    return { error: "An error occurred during registration. Please try again or contact support if the problem persists." };
  }
};
