import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

/**
 * AGAPAY ULTIMATE RESILIENCY PRISMA SINGLETON (v3)
 *
 * - Forces HTTP Fetch on Vercel for maximum serverless stability.
 * - Re-evaluates connection string on every access if currently in stub mode.
 * - Manually parses URI to bypass pg.Pool's unreliable string parser.
 */
let internal_prisma: any = null;

const getRealPrisma = (urlStr: string) => {
  try {
    const url = new URL(urlStr);

    // VERCEL OPTIMIZATION: Always use HTTP fetch for Neon on Vercel/Serverless
    // This bypasses WebSocket overhead and is much more stable.
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      neonConfig.fetchConnectionCache = true;
    } else {
      neonConfig.webSocketConstructor = ws;
    }

    const poolConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: true,
      max: 1, // Minimize connections in serverless
      connectionTimeoutMillis: 15000,
    };

    const pool = new Pool(poolConfig);
    const adapter = new PrismaNeon(pool as any);

    const client = new PrismaClient({ adapter });
    return client;
  } catch (e) {
    console.error("AGAPAY: Failed to initialize real Prisma client:", e);
    return null;
  }
};

const getPrisma = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  // 1. Return existing real client if we have one
  if (internal_prisma && !internal_prisma._is_stub) return internal_prisma;

  // 2. Try to upgrade to a real client if we have a URL now
  if (connectionString) {
    const realClient = getRealPrisma(connectionString);
    if (realClient) {
      internal_prisma = realClient;
      internal_prisma._is_stub = false;
      console.log(
        "AGAPAY: Successfully upgraded from stub to REAL Prisma Client.",
      );
      return internal_prisma;
    }
  }

  // 3. Fallback to (or keep) stub if we still can't connect
  if (!internal_prisma) {
    console.warn("AGAPAY: Using Prisma STUB - No usable DATABASE_URL found.");
    internal_prisma = new PrismaClient();
    internal_prisma._is_stub = true;
  }
  return internal_prisma;
};

// The proxy ensures we check getPrisma() on every single call
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});

export default prisma;
