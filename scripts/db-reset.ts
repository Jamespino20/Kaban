import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { execSync } from "child_process";
import { getDbUrl } from "../src/lib/db-url";

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = getDbUrl();
  const pool = new Pool({ connectionString });

  console.log("🔥 Agapay DB Hard Reset");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  This will DROP all data. No undo.\n");

  // Step 1: Drop all non-public schemas (branch schemas)
  console.log("📦 Step 1: Dropping all branch schemas...");
  const { rows: schemaRows } = await pool.query<{ schema_name: string }>(
    `SELECT schema_name FROM information_schema.schemata
     WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
       AND schema_name NOT LIKE 'pg_%'`,
  );

  for (const { schema_name } of schemaRows) {
    console.log(`   🗑️  Dropping schema [${schema_name}]...`);
    await pool.query(`DROP SCHEMA IF EXISTS "${schema_name}" CASCADE`);
  }
  console.log(`   ✅ Dropped ${schemaRows.length} branch schema(s)\n`);

  await pool.end();

  // Step 2: Prisma migrate reset (handles public schema)
  console.log("📦 Step 2: Running prisma migrate reset --force...");
  try {
    execSync("npx prisma migrate reset --force", {
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("   ✅ Migrations applied\n");
  } catch (err: any) {
    console.error(
      "   ❌ Prisma migrate reset failed. Check your schema or connection.",
    );
    throw err;
  }

  // Step 3: Seed
  console.log("📦 Step 3: Seeding fresh data...");
  try {
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("\n   ✅ Seed complete\n");
  } catch (err: any) {
    console.error("   ❌ Seeding failed. Check prisma/seed.ts for errors.");
    throw err;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Database reset complete!\n");
}

main().catch((e) => {
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
  process.exit(1);
});
