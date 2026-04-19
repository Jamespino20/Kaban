import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

const prismaClientSingleton = () => {
  const connectionString =
    process.env.DATABASE_URL || process.env.AGAPAYSTORAGE_DATABASE_URL;

  if (!connectionString) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      console.warn("AGAPAY: DATABASE_URL not set — Prisma Client might fail.");
    }
  }

  // WebSocket polyfill
  neonConfig.webSocketConstructor = ws;

  // Use the connection string if available, otherwise just use standard Prisma client
  // (which will fail with a better error message if a query is actually made)
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
};

declare global {
  var agapay_prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.agapay_prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.agapay_prisma = prisma;
