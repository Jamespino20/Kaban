import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { prismaAuditExtension } from "./prisma-audit";

if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  const connectionString =
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.AGAPAYSTORAGE_AGAPAY_DATABASE_URL ||
    process.env.AGAPAYSTORAGE_POSTGRES_PRISMA_URL ||
    process.env.AGAPAYSTORAGE_POSTGRES_URL ||
    process.env.AGAPAYSTORAGE_AGAPAY_URL ||
    process.env.AGAPAYSTORAGE_AGAPAY_PRISMA_URL;

  if (!connectionString) {
    throw new Error("Missing Database URL");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter }).$extends(prismaAuditExtension);
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma as unknown as ReturnType<typeof prismaClientSingleton>;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
