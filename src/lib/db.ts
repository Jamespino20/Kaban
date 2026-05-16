import mysql from "mysql2/promise";
import { shouldUseApiClient } from "@/lib/api-config";

function getMysqlConfig() {
  // In API client mode, sql() should not be called — return a dummy URL
  if (shouldUseApiClient()) {
    return "mysql://placeholder:x@localhost:3306/placeholder";
  }

  // Prefer explicit DATABASE_URL; fall back to constructing from parts
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_LOCAL_URL ||
    process.env.PROD_DATABASE_URL;

  if (!dbUrl) {
    throw new Error("No MySQL DATABASE_URL configured.");
  }

  // TiDB Cloud requires SSL to be an object in many environments
  if (dbUrl.includes("tidbcloud")) {
    const url = new URL(dbUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || "4000"),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace("/", ""),
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: false,
      },
      connectTimeout: 60000, // 60s for cold start
    };
  }

  // Transform TiDB-specific sslaccept to mysql2-compatible ssl parameter for other MySQL environments
  return dbUrl.replace("sslaccept=strict", "ssl=true");
}

let pool: mysql.Pool | undefined;

function getPool() {
  if (pool) return pool;
  
  const config = getMysqlConfig();
  if (typeof config === "string") {
    pool = mysql.createPool(config);
  } else {
    pool = mysql.createPool({
      ...config,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Execute a MySQL query via tagged template literals.
 * Automatically handles parameterisation.
 * Usage:
 *   const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
 */
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): Promise<T[]> {
  // Return empty in API client mode — data comes from PHP API
  if (shouldUseApiClient()) {
    return [] as T[];
  }

  const p = getPool();

  let query: string;
  let params: unknown[];

  if (typeof strings === "string") {
    query = strings.trim();
    params = (values[0] as unknown[]) || [];
  } else {
    query = strings.reduce(
      (acc, part, i) => acc + part + (i < values.length ? "?" : ""),
      "",
    ).trim();
    params = values;
  }

  const [rows] = await p.execute(query, params as any);

  if (process.env.DEBUG_SQL === "true") {
    console.log(`[SQL Result] → Found ${(rows as any[]).length} rows`);
  }

  return rows as T[];
}
