import { authConfig } from "./auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string().min(6),
            // We add an optional 2fa field
            code: z.string().optional(),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password, code } = parsedCredentials.data;

          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: username }, { username: username }],
            },
            include: { two_factor_auth: true },
          });

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password_hash,
          );

          if (passwordsMatch) {
            if (user.status === "pending" || user.status === "suspended") {
              return null;
            }

            // check 2FA
            if (user.two_factor_auth?.is_enabled) {
              if (!code) {
                const { generateTwoFactorToken } = await import("@/lib/tokens");
                const { sendTwoFactorTokenEmail } = await import("@/lib/mail");

                const twoFactorToken = await generateTwoFactorToken(user.email);
                await sendTwoFactorTokenEmail(
                  twoFactorToken.email,
                  twoFactorToken.token,
                );

                throw new Error("2FA_REQUIRED");
              }

              const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } =
                await import("otplib");
              const totp = new TOTP({
                crypto: new NobleCryptoPlugin(),
                base32: new ScureBase32Plugin(),
              });

              // Check TOTP first
              const result = await totp.verify(code, {
                secret: user.two_factor_auth.totp_secret,
              });

              if (!result.valid) {
                // Check backup Email Token if TOTP failed or as primary
                const { getTwoFactorTokenByEmail } =
                  await import("@/actions/two-factor-token");
                const twoFactorToken = await getTwoFactorTokenByEmail(
                  user.email,
                );

                if (!twoFactorToken || twoFactorToken.token !== code) {
                  return null;
                }

                const hasExpired =
                  new Date(twoFactorToken.expires) < new Date();
                if (hasExpired) return null;

                await prisma.twoFactorToken.delete({
                  where: { id: twoFactorToken.id },
                });
              }
            }

            return {
              id: user.user_id.toString(),
              name: user.username,
              email: user.email,
              role: user.role,
              tenantId: user.tenant_id,
            };
          }
        }

        return null;
      },
    }),
  ],
});
