import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const migrationPath = path.join(
    process.cwd(),
    "prisma/migrations/20260420180000_elevation_hardening/migration.sql",
  );

  console.log(`📂 Reading migration from: ${migrationPath}`);
  const sqlContent = fs.readFileSync(migrationPath, "utf8");

  // Split by semicolon but preserve standard SQL blocks
  // Note: This is an approximation for large files
  const commands = sqlContent
    .split(/;\s*$/m)
    .filter((cmd) => cmd.trim().length > 0);

  console.log(`⚡ Executing ${commands.length} SQL blocks...`);

  try {
    // We execute sequentially to handle dependencies
    for (const cmd of commands) {
      console.log(`📝 Running: ${cmd.substring(0, 50).replace(/\n/g, " ")}...`);
      await sql(cmd as any);
    }
    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed!");
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
