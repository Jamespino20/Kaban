import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No URL");
  const sql = neon(connectionString);
  console.log("Altering tenants.logo_url to TEXT...");
  await sql`ALTER TABLE tenants ALTER COLUMN logo_url TYPE TEXT;`;
  console.log("Done.");
}

main().catch(console.error);
