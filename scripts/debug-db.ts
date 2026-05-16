import { sql } from "../src/lib/db";

async function main() {
  try {
    console.log("Testing SQL connection...");
    const result = await sql("SELECT COUNT(*) as count FROM users");
    console.log("User count:", result);
    
    const tenants = await sql("SELECT tenant_id, name, slug, entitlement_status FROM tenants");
    console.log("Tenants:", tenants);
  } catch (err) {
    console.error("SQL Error:", err);
  }
}

main();
