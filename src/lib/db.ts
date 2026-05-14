import mysql from "mysql2/promise";
import { connection } from "next/server";

function getMysqlConfig() {
  // Prefer explicit DATABASE_URL; fall back to constructing from parts
  const url =
    process.env.DATABASE_URL ||
    process.env.MYSQL_LOCAL_URL ||
    process.env.PROD_DATABASE_URL;

  if (!url) {
    throw new Error("No MySQL DATABASE_URL configured.");
  }

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
  const url = getMysqlConfig();
  const connection = await mysql.createConnection(url);

  try {
    let query: string;
    let params: unknown[];

    if (typeof strings === "string") {
      // Direct string call (sql("QUERY", [params]))
      query = strings;
      params = (values[0] as unknown[]) || [];
    } else {
      // Tagged template call (sql`QUERY ${param}`)
      // Convert template string to MySQL positional placeholders (?)
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
