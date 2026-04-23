import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon, PrismaNeonHttp } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { getDbUrl } from "@/lib/db-url";

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

const createPrismaClient = () => {
  const rawUrl = getDbUrl();
  const connectionString = rawUrl
    ? rawUrl.replace(/["'\r\n\s]/g, "").trim()
    : "";

  neonConfig.webSocketConstructor = ws;

  console.log("AGAPAY_PRISMA: Initializing adapter...");
  console.log(
    "AGAPAY_PRISMA: Connection String Status =",
    connectionString ? "PRESENT" : "MISSING",
  );

  const adapterMode = getAdapterMode();
  const adapter =
    adapterMode === "ws"
      ? new PrismaNeon({ connectionString } as any)
      : new PrismaNeonHttp(connectionString, {} as any);

  console.log(
    adapterMode === "ws"
      ? "AGAPAY_PRISMA: Using PrismaNeon (WebSocket) adapter."
      : "AGAPAY_PRISMA: Using PrismaNeonHttp adapter (transactions disabled).",
  );

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  } as any);
};

const prisma = globalThis.agapay_apex_prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.agapay_apex_prisma = prisma;
}

export default prisma;
