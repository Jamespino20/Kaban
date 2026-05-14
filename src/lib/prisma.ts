import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as mariadb from "mariadb";

let prismaInstance: PrismaClient | undefined;

declare global {
  var prisma: PrismaClient | undefined;
}

export const getPrisma = () => {
  if (prismaInstance) return prismaInstance;

  console.log(
    "AGAPAY_PRISMA: Initializing MariaDB Client via Driver Adapter...",
  );

  const connectionString = "mysql://root:@localhost:3307/agapay_db";
  const adapter = new PrismaMariaDb(connectionString);

  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

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
 * Ergonomic RLS wrapper using Prisma Extensions
 * Note: RLS in MySQL/MariaDB is handled via application-level logic (where tenant_id is checked in every query).
 * We maintain the structure for compatibility but remove the PostgreSQL-specific session logic.
 */
const prismaExtended = (prisma as any).$extends({
  client: {
    async $withTenant<T>(
      tenantId: number | string,
      callback: (tx: Prisma.TransactionClient) => Promise<T>,
    ) {
      // In MariaDB, we don't have RLS session settings like PostgreSQL.
      // Multi-tenancy is enforced by the application logic using the tenant_id in queries.
      return await (prisma as any).$transaction(async (tx: Prisma.TransactionClient) => {
        return await callback(tx);
      });
    },
  },
});

// Cache on globalThis in ALL environments
if (!globalThis.prisma) {
  (globalThis as any).prisma = prisma;
}

export { prismaExtended as prisma };
export default prismaExtended;
