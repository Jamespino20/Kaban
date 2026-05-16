import { PrismaClient, Prisma } from "@prisma/client";
import { shouldUseApiClient } from "@/lib/api-config";

let prismaInstance: PrismaClient | undefined;

declare global {
  var prisma: PrismaClient | undefined;
}

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createMariaDbAdapter(dbUrl: string) {
  const isTiDB = dbUrl.includes("tidbcloud");

  if (isTiDB) {
    // TiDB Serverless: use PoolConfig with SSL + longer timeout for cold starts
    const url = new URL(dbUrl);
    const config = {
      host: url.hostname,
      port: parseInt(url.port || "4000"),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace("/", ""),
      ssl: { rejectUnauthorized: true },
      connectTimeout: 60000, // 60s for TiDB cold start
      socketTimeout: 60000,
      connectionLimit: 25,
      acquireTimeout: 60000,
    } as any;
    return new PrismaMariaDb(config);
  }

  // Local XAMPP: connection string is fine
  return new PrismaMariaDb(dbUrl);
}

export const getPrisma = () => {
  if (shouldUseApiClient()) return createMockPrisma();
  // During static page generation, use mock to avoid DB connections
  if (process.env.NEXT_PHASE === "phase-production-build")
    return createMockPrisma();
  if (prismaInstance) return prismaInstance;

  console.log("AGAPAY_PRISMA: Initializing...");
  const dbUrl =
    process.env.DATABASE_URL || "mysql://root:@localhost:3307/agapay_db";
  const adapter = createMariaDbAdapter(dbUrl);

  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
  return prismaInstance;
};

function createMockPrisma(): any {
  return new Proxy({} as any, {
    get(_, model: string) {
      if (model === "$extends" || model === "$transaction") {
        return (opts?: any) =>
          model === "$transaction" && typeof opts === "function"
            ? opts(createMockPrisma())
            : createMockPrisma();
      }
      if (model === "then" || model === "catch") return undefined;
      return new Proxy({} as any, {
        get(__, method: string) {
          if (method === "then" || method === "catch") return undefined;
          return async () =>
            method === "findUnique" || method === "findFirst" ? null : [];
        },
      });
    },
  });
}

const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    return Reflect.get(instance, prop, receiver);
  },
});

const prismaExtended = shouldUseApiClient()
  ? createMockPrisma()
  : (prisma as any).$extends({
      client: {
        async $withTenant<T>(
          tenantId: number | string,
          callback: (tx: Prisma.TransactionClient) => Promise<T>,
        ) {
          return await (prisma as any).$transaction(
            async (tx: Prisma.TransactionClient) => callback(tx),
            { maxWait: 60000, timeout: 60000 },
          );
        },
      },
    });

if (!globalThis.prisma) (globalThis as any).prisma = prisma;

export { prismaExtended as prisma };
export default prismaExtended;
