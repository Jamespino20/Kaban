import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/lib/db";

export const authConfig = {
  providers: [Credentials({})],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign-in, NextAuth calls this with url = callbackUrl (often "/").
      // We intercept here to send the user straight to their dashboard
      // by returning ONLY_SIGNIN_SENTINEL — actual role routing is handled
      // server-side by the signIn action which sets the callbackUrl explicitly.
      // If the callbackUrl is the base "/" or the login page, let the proxy
      // handle the final role redirect (it will fire once, not twice).
      if (
        url === baseUrl ||
        url === `${baseUrl}/` ||
        url.includes("/auth/login")
      ) {
        // Return the base — the proxy will catch the logged-in user on "/" and
        // redirect in the same request cycle (no visible flash on dashboard routes).
        return baseUrl;
      }
      // Honor explicit callbackUrls (e.g. user was on /agapay-tanaw before logout)
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.username = user.username;
        token.user_id = user.user_id;
        token.email = user.email;
        token.accessibleTenantIds = user.accessibleTenantIds || [];
        if (user.id) token.id = user.id;
        if (user.apiToken) token.apiToken = user.apiToken;
      }

      // Handle seamless tenant switching
      if (
        trigger === "update" &&
        session?.action === "switch_tenant" &&
        session?.tenantId
      ) {
        {
          const switchingToGlobal = session.tenantId === "global";
          const targetTenantId = switchingToGlobal
            ? null
            : parseInt(session.tenantId);
          const isSuperadmin = token.role === "superadmin";
          const allowedTenantIds = Array.isArray(token.accessibleTenantIds)
            ? token.accessibleTenantIds.map((value: unknown) =>
                parseInt(String(value)),
              )
            : [];

          if (
            !switchingToGlobal &&
            !isSuperadmin &&
            !allowedTenantIds.includes(targetTenantId as number)
          ) {
            console.warn(
              "Rejected unauthorized tenant switch attempt",
              token.user_id,
              targetTenantId,
            );
            return token;
          }

          try {
            if (isSuperadmin) {
              if (switchingToGlobal) {
                token.tenantId = null;
                // Force superadmin to Malolos instead of 'main' when going global
                token.tenantSlug = "malolos";
                return token;
              }

              const tenants = await sql(
                "SELECT tenant_id, slug FROM tenants WHERE tenant_id = ? AND is_active = 1 LIMIT 1",
                [targetTenantId],
              );

              if (tenants && tenants.length > 0) {
                token.tenantId = targetTenantId;
                token.tenantSlug = (tenants[0] as any).slug;
              }

              return token;
            }

            const users = await sql(
              "SELECT u.user_id, u.tenant_id, u.username, u.email, u.role, t.slug as tenant_slug FROM users u LEFT JOIN tenants t ON u.tenant_id = t.tenant_id WHERE u.tenant_id = ? AND u.email = ? LIMIT 1",
              [targetTenantId, token.email],
            );

            if (users && users.length > 0) {
              const u = users[0] as any;
              token.tenantId = u.tenant_id;
              token.tenantSlug = u.tenant_slug;
              token.role = u.role;
              token.username = u.username;
              token.user_id = u.user_id;
              token.email = u.email;
              token.id = u.user_id.toString();
            }
          } catch (e) {
            console.error("Failed to switch tenant in JWT update:", e);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as string;
      }
      session.user.tenantId =
        typeof token?.tenantId === "number" ? (token.tenantId as number) : null;
      session.user.tenantSlug =
        typeof token?.tenantSlug === "string"
          ? (token.tenantSlug as string)
          : null;
      if (token?.username) {
        session.user.username = token.username as string;
      }
      if (token?.user_id) {
        session.user.user_id = token.user_id as number;
      }
      session.user.accessibleTenantIds = Array.isArray(
        token?.accessibleTenantIds,
      )
        ? (token.accessibleTenantIds as number[])
        : [];
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.apiToken) {
        session.user.apiToken = token.apiToken as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
