require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const migrationPath = path.resolve(
    __dirname,
    "../prisma/migrations/20260420180000_elevation_hardening/migration.sql",
  );

  console.log(`📂 Reading migration from: ${migrationPath}`);
  const sqlContent = fs.readFileSync(migrationPath, "utf8");

  // Split by semicolon, but ignore semicolons inside $$ strings
  const commands = [];
  let current = "";
  let inDollar = false;

  const lines = sqlContent.split("\n");
  for (const line of lines) {
    // Basic check for $$ block
    if (line.includes("$$")) inDollar = !inDollar;

    if (!inDollar && line.includes(";")) {
      const parts = line.split(";");
      current += parts[0] + ";";
      commands.push(current.trim());
      current = parts.slice(1).join(";");
    } else {
      current += line + "\n";
    }
  }
  if (current.trim()) commands.push(current.trim());

  try {
    console.log(`⚡ Executing ${commands.length} SQL commands...`);
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (!cmd || cmd.startsWith("--")) continue;
      console.log(`📝 Running command ${i + 1}...`);
      await sql.query(cmd);
    }
    console.log("✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed!");
    console.error(error.message);
  }
}

applyMigration();
