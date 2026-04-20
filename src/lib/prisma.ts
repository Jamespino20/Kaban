import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * AGAPAY NATIVE PRISMA SINGLETON (v7 - PURE ADAPTER BINDING)
 *
 * - Removes ALL custom constructor properties that trigger Prisma validation failures.
 * - Passes ONLY the `adapter` parameter.
 * - Retains Manual URI Deconstruction for Vercel/pg.Pool safety.
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
    console.error(
      "AGAPAY CRITICAL: No DATABASE_URL found in environment! Initializing empty fallback client.",
    );
    // No arguments at all - avoids unknown property errors during build
    return new PrismaClient();
  }

  try {
    const url = new URL(connectionString);

    // Serverless optimization (Use HTTP fetch on Vercel)
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
      max: 1, // Minimize connections in serverless
    });

    const adapter = new PrismaNeon(pool as any);

    // STRICTLY pass ONLY the adapter. No datasourceUrl or datasources.
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error(
      "AGAPAY: Initialization failed, falling back to empty client:",
      error,
    );
    return new PrismaClient();
  }
};

const prisma = globalThis.agapay_prisma_instance ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.agapay_prisma_instance = prisma;
}

export default prisma;
