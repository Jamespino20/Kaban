import "dotenv/config";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const sql = neon(
    "postgresql://neondb_owner:npg_Zi2m9NUxgIrC@ep-damp-river-a1bkchuk-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  );

  const tables = ["users", "tenants", "tenant_groups"];

  for (const table of tables) {
    console.log(`\nIntrospecting ${table} table...`);
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table}
    `;
    columns.forEach((c) => console.log(`- ${c.column_name} (${c.data_type})`));
  }
}

main();
