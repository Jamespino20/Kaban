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

  await pool.end();

  // Step 2: Prisma migrate reset (handles public schema)
  console.log("📦 Step 2: Running prisma migrate reset --force...");

  try {
    execSync(
      "npx prisma generate && npx prisma migrate reset --force",
      {
        stdio: "inherit",
        env: { ...process.env },
      },
    );
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

  // Step 4: DB RLS
  console.log("📦 Step 4: Enabling database RLS...");
  try {
    execSync("npx prisma db execute --file prisma/rls_setup.sql", {
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("\n   ✅ RLS complete\n");
  } catch (err: any) {
    console.error("   ❌ RLS failed. Check prisma/rls_setup.sql for errors.");
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
