import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as mariadb from "mariadb";
import { shouldUseApiClient } from "@/lib/api-config";

let prismaInstance: PrismaClient | undefined;

declare global {
  var prisma: PrismaClient | undefined;
}

// When in API-client mode, return a mock Prisma client that logs and returns empty data.
// The actual data operations happen through the PHP API via the action files.
function createMockPrisma(): any {
  return new Proxy({} as any, {
    get(_, model: string) {
      if (model === '$extends') return (opts: any) => createMockPrisma();
      if (model === '$transaction') return async (fn: any) => fn(createMockPrisma());
      if (model === '$withTenant') return async (_: any, fn: any) => fn(createMockPrisma());
      if (model === 'then' || model === 'catch') return undefined; // not a promise

      return new Proxy({} as any, {
        get(__, method: string) {
          if (method === 'then' || method === 'catch') return undefined;
          return async (...args: any[]) => {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`[Prisma Mock] ${String(model)}.${String(method)} called — data comes from PHP API`);
            }
            return model === 'findUnique' || model === 'findFirst' ? null : [];
          };
        },
      });
    },
  });
}

export const getPrisma = () => {
  if (shouldUseApiClient()) {
    return createMockPrisma();
  }

  if (prismaInstance) return prismaInstance;

  console.log("AGAPAY_PRISMA: Initializing MariaDB Client via Driver Adapter...");

  const connectionString = "mysql://root:@localhost:3307/agapay_db";
  const adapter = new PrismaMariaDb(connectionString);

  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  return prismaInstance;
};

const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    if (!instance) {
      throw new Error("Agapay Prisma: Instance not initialized.");
    }
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
          return await (prisma as any).$transaction(async (tx: Prisma.TransactionClient) => {
            return await callback(tx);
          });
        },
      },
    });

if (!globalThis.prisma) {
  (globalThis as any).prisma = prisma;
}

export { prismaExtended as prisma };
export default prismaExtended;
