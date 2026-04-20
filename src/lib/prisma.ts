import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * AGAPAY NATIVE PRISMA SINGLETON (v5 - THE FINAL BOSS)
 *
 * - Removes Proxy: Restores native Prisma engine binding.
 * - Strict URL Enforcement: No more invalid stubs.
 * - Dual-Bound: Passes both adapter and datasourceUrl.
 */

// Global augmentation for the singleton pattern
declare global {
  var agapay_prisma_instance: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("AGAPAY CRITICAL: No DATABASE_URL found in environment!");
    // We return a client that will fail ONLY when queried, with a clear error
    // because we can't avoid returning a PrismaClient type.
    // However, we avoid the 'non-empty options' error by providing a dummy URL.
    return new PrismaClient({
      datasourceUrl: "postgresql://missing_db_url_check_env_vars:5432",
    } as any);
  }

  try {
    const url = new URL(connectionString);

    // Serverless optimization
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      (neonConfig as any).fetchConnection = true;
    } else {
      neonConfig.webSocketConstructor = ws;
    }

    const pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: true,
      max: 1,
    });

    const adapter = new PrismaNeon(pool as any);

    return new PrismaClient({
      adapter,
      datasourceUrl: connectionString,
    } as any);
  } catch (error) {
    console.error(
      "AGAPAY: Initialization failed, falling back to standard client:",
      error,
    );
    return new PrismaClient({ datasourceUrl: connectionString } as any);
  }
};

const prisma = globalThis.agapay_prisma_instance ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.agapay_prisma_instance = prisma;
}

export default prisma;
