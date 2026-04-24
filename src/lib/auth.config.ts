import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { getDbUrl } from "@/lib/db-url";

export const authConfig = {
  providers: [Credentials({})],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.username = user.username;
        token.user_id = user.user_id;
        token.email = user.email; // Ensure email is in token
        token.accessibleTenantIds = user.accessibleTenantIds || [];
        if (user.id) token.id = user.id;
      }

      // Handle seamless branch switching
      if (
        trigger === "update" &&
        session?.action === "switch_tenant" &&
        session?.tenantId
      ) {
        const connectionString = getDbUrl();
        if (connectionString) {
          const sql = neon(connectionString);
          const switchingToGlobal = session.tenantId === "global";
          const targetTenantId = switchingToGlobal
            ? null
            : parseInt(session.tenantId);
          const isSuperadmin = token.role === "superadmin";
          const allowedTenantIds = Array.isArray(token.accessibleTenantIds)
            ? token.accessibleTenantIds.map((value: any) => parseInt(String(value)))
            : [];

          if (!switchingToGlobal && !isSuperadmin && !allowedTenantIds.includes(targetTenantId as number)) {
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
                return token;
              }

              const tenants = await sql`
                SELECT tenant_id
                FROM tenants
                WHERE tenant_id = ${targetTenantId}
                AND is_active = true
                LIMIT 1
              `;

              if (tenants && tenants.length > 0) {
                token.tenantId = targetTenantId;
              }

              return token;
            }

            const users = await sql`
              SELECT user_id, tenant_id, username, email, role
              FROM users
              WHERE tenant_id = ${targetTenantId}
              AND email = ${token.email}
              LIMIT 1
            `;

            if (users && users.length > 0) {
              const u = users[0];
              token.tenantId = u.tenant_id;
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
      if (token?.username) {
        session.user.username = token.username as string;
      }
      if (token?.user_id) {
        session.user.user_id = token.user_id as number;
      }
      session.user.accessibleTenantIds = Array.isArray(token?.accessibleTenantIds)
        ? (token.accessibleTenantIds as number[])
        : [];
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
