import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

/**
 * PRISMA SINGLETON
 *
 * Bypasses the unreliable Pool string parser by manually deconstructing the URI.
 * This resolves the "No database host" error on Vercel where pg falls back to
 * localhost despite a valid connection string being provided.
 */
let internal_prisma: any = null;

const getPrisma = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (internal_prisma && !internal_prisma._is_stub) return internal_prisma;

  if (connectionString) {
    try {
      console.log(
        "AGAPAY: Hard-initializing Prisma Client with Manual URI Deconstruction...",
      );

      const url = new URL(connectionString);
      const isPooler = url.hostname.includes("pooler");

      const poolConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: true,
        // Increase timeout for serverless wake-up
        connectionTimeoutMillis: 10000,
      };

      // Neon-specific WebSocket polyfill (local/Node only)
      if (typeof window === "undefined" && !process.env.VERCEL) {
        neonConfig.webSocketConstructor = ws;
      }

      const pool = new Pool(poolConfig);
      const adapter = new PrismaNeon(pool as any);

      internal_prisma = new PrismaClient({ adapter });
      internal_prisma._is_stub = false;
      return internal_prisma;
    } catch (parseError) {
      console.error("AGAPAY: Critical error parsing DATABASE_URL:", parseError);
    }
  }

  // Fallback to stub during build/missing env
  if (!internal_prisma) {
    console.warn(
      "AGAPAY: Initializing Prisma STUB (No usable connection string).",
    );
    internal_prisma = new PrismaClient();
    internal_prisma._is_stub = true;
  }
  return internal_prisma;
};

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
