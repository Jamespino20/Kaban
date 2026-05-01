"use server";

import * as z from "zod";
import { resetPassword } from "@/actions/reset-password";

const LegacyNewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const newPassword = async (
  values: z.infer<typeof LegacyNewPasswordSchema>,
  token?: string | null,
) => {
  return resetPassword(values, token);
};
