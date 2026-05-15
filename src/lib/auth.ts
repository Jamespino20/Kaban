import { authConfig } from "./auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { z } from "zod";
import { validateTenantMembershipLimit } from "@/lib/microfinance-policy";

class TwoFactorRequiredError extends CredentialsSignin {
  code = "2fa_required";
}

let nextAuthInstance: any;

const getNextAuth = () => {
  if (nextAuthInstance) return nextAuthInstance;

  nextAuthInstance = NextAuth({
    ...authConfig,
    providers: [
      Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({
              username: z.string(),
              password: z.string().min(6),
              tenantId: z.string().optional().default("global"),
              code: z.string().optional(),
            })
            .safeParse(credentials);

          if (parsedCredentials.success) {
            const { username, password, code, tenantId } =
              parsedCredentials.data;

            // Parse tenantId from credentials
            let parsedTenantId: number | null = null;
            if (tenantId && tenantId !== "global" && tenantId !== "undefined") {
              const integerId = parseInt(tenantId);
              if (!isNaN(integerId)) parsedTenantId = integerId;
            }

            // Resolve Target Schema
            const validatedTenantId = parsedTenantId;

            // LOCAL DEV: Use existing sql() logic (PHP API path removed — we use Prisma/TiDB directly)
            // Fetch user
            let users: any[] = [];

            try {
              users = await sql(
                "SELECT u.user_id, u.tenant_id, u.username, u.email, u.password_hash, u.role, u.status, u.member_code, t.slug as tenant_slug FROM users u LEFT JOIN tenants t ON u.tenant_id = t.tenant_id WHERE (u.tenant_id = ? OR (u.tenant_id IS NULL AND ?)) AND (u.email = ? OR u.username = ?) LIMIT 1",
                [validatedTenantId, validatedTenantId === null, username, username],
              );
            } catch (err) {
              console.error(`Auth lookup failed:`, err);
            }

            const user = users[0];
            if (!user) return null;

            const passwordsMatch = await bcrypt.compare(
              password,
              user.password_hash,
            );

            if (passwordsMatch) {
              if (user.status === "suspended") return null;

              const switchableAccounts = await sql(
                "SELECT tenant_id, password_hash FROM users WHERE email = ?",
                [user.email],
              );

              const accessibleTenantIds: number[] = [];
              for (const account of switchableAccounts) {
                const a = account as any;
                if (!a.tenant_id) continue;
                const sameSecret = await bcrypt.compare(
                  password,
                  a.password_hash as string,
                );
                if (sameSecret) {
                  accessibleTenantIds.push(a.tenant_id as number);
                }
              }

              if (user.role !== "superadmin") {
                const tenantMembershipError = validateTenantMembershipLimit(
                  accessibleTenantIds.length,
                );

                if (tenantMembershipError) {
                  return null;
                }
              }

              // Force superadmin to always be tenant-unscoped
              const forcedTenantId = user.role === "superadmin" ? null : user.tenant_id;
              const forcedTenantSlug = user.role === "superadmin" ? null : user.tenant_slug;

              // Check 2FA
              const twoFaRows = await sql(
                "SELECT is_enabled, totp_secret FROM two_factor_auth WHERE user_id = ?",
                [user.user_id],
              );
              const twoFa = twoFaRows[0] as any;

              if (twoFa?.is_enabled) {
                if (!code) {
                  throw new TwoFactorRequiredError();
                }

                const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } =
                  await import("otplib");
                const totp = new TOTP({
                  crypto: new NobleCryptoPlugin(),
                  base32: new ScureBase32Plugin(),
                });

                const isTotpValid = await totp.verify(code, {
                  secret: twoFa.totp_secret,
                });

                if (!isTotpValid) {
                  const { getTwoFactorTokenByEmail } =
                    await import("@/actions/two-factor-token");
                  const twoFactorToken = await getTwoFactorTokenByEmail(
                    user.email,
                    user.tenant_id,
                  );

                  if (!twoFactorToken || twoFactorToken.token !== code) {
                    return null;
                  }

                  const hasExpired =
                    new Date(twoFactorToken.expires) < new Date();
                  if (hasExpired) return null;

                  // Delete used token
                  await sql(
                    "DELETE FROM two_factor_tokens WHERE id = ?",
                    [twoFactorToken.id],
                  );
                }
              }

              return {
                id: user.user_id.toString(),
                user_id: user.user_id,
                username: user.username,
                name: user.username,
                email: user.email,
                role: user.role,
                tenantId: forcedTenantId,
                tenantSlug: forcedTenantSlug,
                accessibleTenantIds,
              };
            }
          }

          return null;
        },
      }),
    ],
  });

  return nextAuthInstance;
};

// Lazy exports to prevent build-time dynamic bailouts
export const auth = (...args: any[]) => {
  // Never run auth() during static generation
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return Promise.resolve(null);
  }
  return getNextAuth().auth(...args);
};

export const handlers = {
  GET: (...args: any[]) => getNextAuth().handlers.GET(...args),
  POST: (...args: any[]) => getNextAuth().handlers.POST(...args),
};

export const signIn = (...args: any[]) => getNextAuth().signIn(...args);
export const signOut = (...args: any[]) => getNextAuth().signOut(...args);
