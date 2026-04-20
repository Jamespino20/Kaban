import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

/**
 * AGAPAY ULTIMATE RESILIENCY PRISMA SINGLETON (v4 - 0% STUB POLICY)
 *
 * - Dual-layer initialization: Passes both 'adapter' AND 'datasourceUrl'.
 * - Forces HTTP fetch for serverless stability.
 * - Manual URI parsing for pg.Pool safety.
 */
let internal_prisma: any = null;

const getRealPrisma = (urlStr: string) => {
  try {
    const url = new URL(urlStr);

    // VERCEL OPTIMIZATION: Always use HTTP fetch for Neon on Vercel/Serverless
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      neonConfig.fetchConnectionCache = true; // Supported in some versions, but let's be safe
      // Primary HTTP mode flag
      (neonConfig as any).fetchConnection = true;
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
      max: 1,
      connectionTimeoutMillis: 15000,
    };

    const pool = new Pool(poolConfig);
    const adapter = new PrismaNeon(pool as any);

    // DUAL-LAYER: We pass both the adapter and the datasourceUrl.
    // This handles cases where the Rust engine expects a URL even when using an adapter.
    const client = new PrismaClient({
      adapter,
      datasourceUrl: urlStr,
    } as any);
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

  // If we have a real non-stub client, return it
  if (internal_prisma && !internal_prisma._is_stub) return internal_prisma;

  // Try to create/upgrade to real client
  if (connectionString) {
    const realClient = getRealPrisma(connectionString);
    if (realClient) {
      internal_prisma = realClient;
      internal_prisma._is_stub = false;
      return internal_prisma;
    }
  }

  // Last resort: basic client if still no URL (will likely fail query but survive init)
  if (!internal_prisma) {
    console.warn("AGAPAY: Initializing fallback client.");
    internal_prisma = new PrismaClient();
    internal_prisma._is_stub = true;
  }
  return internal_prisma;
};

// High-fidelity proxy that correctly handles all Prisma properties and symbols
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
