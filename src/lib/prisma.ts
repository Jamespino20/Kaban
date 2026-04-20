import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * AGAPAY APEX PRISMA SINGLETON (v8 - THE DEFINITIVE PATTERN)
 *
 * 1. LAZY PROXY: Prevents Vercel top-level environment variables from racing.
 *    The connection string is read strictly at execution time.
 * 2. PURE ADAPTER: Passes exactly 1 argument { adapter } to PrismaClient to
 *    completely avoid Prisma 7's highly aggressive option validation.
 * 3. CONNECTION STRING DRIVEN: Relies on `connectionString` parameter in Pool for
 *    Neon's adapter, preventing 'localhost' edge case fallbacks.
 */

declare global {
  var agapay_apex_prisma: PrismaClient | undefined;
}

const getPrisma = (): PrismaClient => {
  if (globalThis.agapay_apex_prisma) {
    return globalThis.agapay_apex_prisma;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "AGAPAY CRITICAL: No DATABASE_URL found. A query is attempting execution without DB credentials.",
    );
    // Dummy client that will survive build-time static generation but fail loudly on DB query
    globalThis.agapay_apex_prisma = new PrismaClient();
    return globalThis.agapay_apex_prisma;
  }

  try {
    // Vercel / serverless optimization
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      (neonConfig as any).fetchConnection = true;
    } else {
      neonConfig.webSocketConstructor = ws;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);

    // STRICTLY pass ONLY the adapter to satisfy strict PrismaClient validation
    const client = new PrismaClient({ adapter });

    globalThis.agapay_apex_prisma = client;
    return client;
  } catch (error) {
    console.error("AGAPAY: Critical failure constructing PrismaClient:", error);
    globalThis.agapay_apex_prisma = new PrismaClient();
    return globalThis.agapay_apex_prisma;
  }
};

// The lazy proxy ensures `getPrisma()` is NEVER called until the exact moment
// `prisma.user.findUnique`, etc is executed. This completely sidesteps
// Vercel's top-level module caching and ensures process.env is 100% loaded.
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return (...args: any[]) => value.apply(client, args);
    }
    return value;
  },
});

export default prisma;
