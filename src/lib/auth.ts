import { authConfig } from "./auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
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
            tenantId: z.string(),
            code: z.string().optional(),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password, code, tenantId } = parsedCredentials.data;

          const connectionString =
            process.env.DATABASE_URL || process.env.AGAPAYSTORAGE_DATABASE_URL;
          console.log(
            "SURGERY: Auth Connection String Status:",
            connectionString ? "PRESENT" : "MISSING!",
          );

          if (!connectionString) return null;

          const sql = neon(connectionString);

          // Fetch user with tenant scoping via raw SQL
          const users = await sql`
            SELECT user_id, tenant_id, username, email, password_hash, 
                   role, status, member_code
            FROM users
            WHERE tenant_id = ${tenantId === "global" ? null : parseInt(tenantId)}
            AND (email = ${username} OR username = ${username})
            LIMIT 1
          `;

          const user = users[0];
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password_hash,
          );

          if (passwordsMatch) {
            if (user.status === "suspended") return null;

            // Check 2FA
            const twoFaRows = await sql`
              SELECT is_enabled, totp_secret 
              FROM two_factor_auth 
              WHERE user_id = ${user.user_id}
            `;
            const twoFa = twoFaRows[0];

            if (twoFa?.is_enabled) {
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

              const result = await totp.verify(code, {
                secret: twoFa.totp_secret,
              });

              if (!result.valid) {
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

                // Delete used token via neon
                await sql`
                  DELETE FROM two_factor_tokens 
                  WHERE id = ${twoFactorToken.id}
                `;
              }
            }

            return {
              id: user.user_id.toString(),
              username: user.username,
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
