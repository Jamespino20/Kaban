import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  // Neon standard polyfill
  neonConfig.webSocketConstructor = ws;

  console.log(">>> AGAPAY PRISMA: Attempting Manual Config Parsing <<<");

  // Manually parse URI to avoid "No database host set" ambiguities
  try {
    const url = new URL(connectionString);
    const poolConfig = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: parseInt(url.port) || 5432,
      ssl: true,
    };

    console.log("Parsed Host:", poolConfig.host);

    const pool = new Pool(poolConfig);
    const adapter = new PrismaNeon(pool as any);

    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to parse DATABASE_URL:", error);
    throw error;
  }
};

declare global {
  var agapay_parsed_prisma:
    | undefined
    | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.agapay_parsed_prisma ?? prismaClientSingleton();

export default prisma as unknown as ReturnType<typeof prismaClientSingleton>;

if (process.env.NODE_ENV !== "production")
  globalThis.agapay_parsed_prisma = prisma;
