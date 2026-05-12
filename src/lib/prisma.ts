import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon, PrismaNeonHttp } from "@prisma/adapter-neon";
import { getDbUrl } from "@/lib/db-url";

let prismaInstance: PrismaClient | undefined;

declare global {
  var prisma: PrismaClient | undefined;
}

export const getPrisma = () => {
  if (prismaInstance) return prismaInstance;

  const rawUrl = getDbUrl();
  const connectionString = rawUrl
    ? rawUrl.replace(/["'\r\n\s]/g, "").trim()
    : "";

  console.log("AGAPAY_PRISMA: Initializing adapter (Lazy)...");

  if (!connectionString) {
    const errorMsg =
      "AGAPAY_PRISMA: Critical Error - Database Connection String is missing.";
    console.error(errorMsg);
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build"
    ) {
      throw new Error(errorMsg);
    }
    return null as any;
  }

  const adapterMode = process.env.AGAPAY_PRISMA_ADAPTER?.toLowerCase();
  const useHttp = adapterMode === "ws" ? false : true; // Default to HTTP adapter for stability
  const adapter = useHttp
    ? new PrismaNeonHttp(connectionString, {} as any)
    : new PrismaNeon({ connectionString } as any);

  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  } as any);

  return prismaInstance;
};

// Agapay Global Prisma Client
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    if (!instance) {
      throw new Error("Agapay Prisma: Instance not initialized.");
    }
    return Reflect.get(instance, prop, receiver);
  },
});

/**
 * Sets the current tenant ID for RLS in the database session.
 * ⚠️ MUST be called inside a transaction for reliable RLS with connection poolers.
 */
export const setTenantSession = async (tx: any, tenantId: number | string) => {
  await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
};

/**
 * Returns a PrismaClient scoped to a specific tenant.
 * Currently returns the main prisma client as we migrate to single-schema RLS.
 * To use RLS, prefer using transactions with setTenantSession.
 */
// The prismExtended instance is now the single source of truth for database access,
// scoped by RLS via the $withTenant extension.

/**
 * Ergonomic RLS wrapper using Prisma Extensions
 */
const prismaExtended = prisma.$extends({
  client: {
    async $withTenant<T>(
      tenantId: number | string,
      callback: (tx: any) => Promise<T>,
    ) {
      return await (prisma as any).$transaction(async (tx: any) => {
        await setTenantSession(tx, tenantId);
        return await callback(tx);
      });
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export { prismaExtended as prisma };
export default prismaExtended;
