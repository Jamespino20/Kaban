import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon, PrismaNeonHttp } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { getDbUrl } from "@/lib/db-url";

let prismaInstance: PrismaClient | undefined;

declare global {
  var agapay_apex_prisma: PrismaClient | undefined;
}

const getAdapterMode = () => {
  const explicitMode = process.env.AGAPAY_PRISMA_ADAPTER?.toLowerCase();
  if (explicitMode === "http" || explicitMode === "ws") {
    return explicitMode;
  }
  return "ws";
};

export const getPrisma = () => {
  if (prismaInstance) return prismaInstance;

  // During build-time, we must avoid initializing the DB client if possible
  // as it often triggers network activity that Next.js treats as dynamic.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("AGAPAY_PRISMA: Skipping initialization during build phase.");
    return null as any;
  }

  const rawUrl = getDbUrl();
  const connectionString = rawUrl
    ? rawUrl.replace(/["'\r\n\s]/g, "").trim()
    : "";

  neonConfig.webSocketConstructor = ws;

  console.log("AGAPAY_PRISMA: Initializing adapter (Lazy)...");

  if (!connectionString) {
    const errorMsg =
      "AGAPAY_PRISMA: Critical Error - Database Connection String is missing.";
    console.error(errorMsg);
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build"
    ) {
      throw new Error(errorMsg);
    }
    return null as any;
  }

  const adapterMode = getAdapterMode();
  const adapter =
    adapterMode === "ws"
      ? new PrismaNeon({ connectionString } as any)
      : new PrismaNeonHttp(connectionString, {} as any);

  prismaInstance = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  } as any);

  return prismaInstance;
};

// Fallback for existing default imports (Lazy Proxy)
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    if (!instance) {
      if (process.env.NEXT_PHASE === "phase-production-build") {
        return undefined; // Avoid crashing during build discovery
      }
      throw new Error("Agapay Prisma: Instance not initialized.");
    }
    return Reflect.get(instance, prop, receiver);
  },
});

const branchClients: Record<string, PrismaClient> = {};

/**
 * Returns a PrismaClient scoped to a specific physical branch schema.
 * If tenantSlug is 'main' or null, returns the global public-scoped client.
 */
export const getBranchPrisma = (tenantSlug: string | null) => {
  const normalizedSlug = tenantSlug?.toLowerCase();

  if (
    !normalizedSlug ||
    normalizedSlug === "main" ||
    normalizedSlug === "malolos"
  ) {
    return prisma;
  }

  if (branchClients[normalizedSlug]) {
    return branchClients[normalizedSlug];
  }

  // Handle production build phase safety
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return prisma;
  }

  const rawUrl = getDbUrl();
  if (!rawUrl) return prisma;

  const baseUrl = rawUrl.replace(/["'\r\n\s]/g, "").trim();

  console.log(
    `AGAPAY_PRISMA: Initializing Branch client for [${normalizedSlug}]`,
  );

  const adapter = new PrismaNeon(
    { connectionString: baseUrl } as any,
    { schema: normalizedSlug } as any,
  );
  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  } as any);

  branchClients[normalizedSlug] = client;
  return client;
};

if (process.env.NODE_ENV !== "production") {
  globalThis.agapay_apex_prisma = prisma;
}

export default prisma;
