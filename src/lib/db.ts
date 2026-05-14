import mysql from "mysql2/promise";
import { connection } from "next/server";
import { shouldUseApiClient } from "@/lib/api-config";

function getMysqlConfig() {
  // In API client mode, sql() should not be called — return a dummy URL
  if (shouldUseApiClient()) {
    return "mysql://placeholder:x@localhost:3306/placeholder";
  }

  // Prefer explicit DATABASE_URL; fall back to constructing from parts
  let url =
    process.env.DATABASE_URL ||
    process.env.MYSQL_LOCAL_URL ||
    process.env.PROD_DATABASE_URL;

  if (!url) {
    throw new Error("No MySQL DATABASE_URL configured.");
  }

  // Transform TiDB-specific sslaccept to mysql2-compatible ssl parameter
  url = url.replace('sslaccept=strict', 'ssl=true');

  return url;
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

  const url = getMysqlConfig();
  const connection = await mysql.createConnection(url);

  try {
    let query: string;
    let params: unknown[];

    if (typeof strings === "string") {
      query = strings;
      params = (values[0] as unknown[]) || [];
    } else {
      query = strings.reduce(
        (acc, part, i) => acc + part + (i < values.length ? "?" : ""),
        "",
      );
      params = values;
    }

    const [rows] = await connection.execute(query, params as any);
    return rows as T[];
  } finally {
    await connection.end();
  }
}
