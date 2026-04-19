import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

/**
 * HIGH-RESILIENCY PRISMA SINGLETON (VERCEL-HARDENED)
 *
 * Uses a Proxy to ensure lazy initialization. If DATABASE_URL is missing
 * during module load (e.g. build time), it returns a stub.
 * On first ACCESS, it tries to initialize the "real" client again.
 */
let internal_prisma: any = null;

const getPrisma = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  // If already initialized as a real client, return it
  if (internal_prisma && !internal_prisma._is_stub) return internal_prisma;

  // If we have a URL now, initialize for real
  if (connectionString) {
    console.log("AGAPAY: Initializing Real Prisma Client...");
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    internal_prisma = new PrismaClient({ adapter });
    return internal_prisma;
  }

  // Fallback to stub if still no URL or first call
  if (!internal_prisma) {
    console.warn("AGAPAY: No URL found. Creating Prisma STUB.");
    internal_prisma = new PrismaClient();
    (internal_prisma as any)._is_stub = true;
  }
  return internal_prisma;
};

// Export a Proxy that intercepts all calls and ensures getPrisma() is called
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
