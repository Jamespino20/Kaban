import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { auth } from "@/lib/auth"; // For tenant context

/**
 * AGAPAY APEX PRISMA SINGLETON (v9 - STATELESS RLS & AUDIT EDITION)
 *
 * 1. LAZY PROXY: Prevents Vercel race conditions.
 * 2. PURE ADAPTER: Bypasses Prisma 7 constructor validation.
 * 3. STATELESS RLS: Injects app.tenant_id session variable before queries.
 * 4. READ AUDIT: Logs every data access event to audit_logs.
 */

declare global {
  var agapay_apex_prisma: any | undefined;
}

const getDbUrl = () => {
  const url =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!url) {
    console.warn("⚠️ AGAPAY_WARNING: No DATABASE_URL found in environment.");
    // We don't return a dummy client here because it leads to "No database host" errors
  }
  return url;
};

const getPrisma = (): any => {
  if (globalThis.agapay_apex_prisma) {
    return globalThis.agapay_apex_prisma;
  }

  const connectionString = getDbUrl();

  if (!connectionString) {
    // If we're in build time, we might not have the URL, but at runtime it's CRITICAL.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AGAPAY_CRITICAL: Database connection string is missing in production environment.",
      );
    }
    // Return a dummy error-throwing client for dev to avoid silent failures
    return new Proxy({} as any, {
      get: () => {
        throw new Error(
          "AGAPAY_ERROR: Prisma accessed before DATABASE_URL was available. Check your .env file.",
        );
      },
    });
  }

  try {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      (neonConfig as any).fetchConnection = true;
    } else {
      neonConfig.webSocketConstructor = ws;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    const baseClient = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // EXTEND CLIENT FOR RLS & AUDIT
    const extendedClient = baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // 1. Get Tenant Context from Auth Session
            const session = await auth();
            const tenantId = session?.user?.tenantId || 0;
            const userId = session?.user?.user_id || 0;

            // 2. READ AUDIT (Log every access)
            const isRead =
              operation.startsWith("find") ||
              operation.startsWith("aggregate") ||
              operation.startsWith("count");

            if (isRead && model !== "AuditLog") {
              baseClient.auditLog
                .create({
                  data: {
                    tenant_id: tenantId ? parseInt(tenantId.toString()) : null,
                    user_id: userId ? parseInt(userId.toString()) : null,
                    action: `READ_${operation.toUpperCase()}`,
                    entity_type: model,
                    ip_address: "internal",
                    new_values: { args } as any,
                  },
                })
                .catch(() => {});
            }

            // 3. SECURE SESSION INJECTION (Stateless RLS)
            return baseClient.$transaction(async (tx) => {
              if (tenantId) {
                await tx.$executeRawUnsafe(
                  `SET LOCAL app.tenant_id = ${tenantId}`,
                );
                await tx.$executeRawUnsafe(`SET LOCAL app.user_id = ${userId}`);
              }
              return query(args);
            });
          },
        },
      },
    });

    globalThis.agapay_apex_prisma = extendedClient;
    return extendedClient;
  } catch (error) {
    console.error("AGAPAY: Critical Prisma initialization failure:", error);
    throw error; // Rethrow to prevent "No database host" masking
  }
};

const prismaProxy = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getPrisma();
    if (prop === "then") return undefined; // For promise-like check
    const value = client[prop];
    if (typeof value === "function") {
      return (...args: any[]) => value.apply(client, args);
    }
    return value;
  },
});

// Export as the extended type to maintain IntelliSense and fix build lints
const prisma = prismaProxy as ReturnType<typeof getPrisma>;
export default prisma;
