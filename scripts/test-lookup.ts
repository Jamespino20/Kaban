import { sql } from "../src/lib/db";

async function testLookup(username: string) {
  console.log(`Lookup for: "${username}"`);
  const query = "SELECT user_id as id, tenant_id, role, password_hash, status, email, username FROM users WHERE (username = ? OR email = ?) AND status != 'suspended'";
  const results = await sql(query, [username, username]);
  console.log("Results:", results);
}

async function main() {
  // Test with superadmin
  await testLookup("agapay.saas@gmail.com");
  await testLookup("superadmin");
  
  // Test with one of the slugified ones
  const target = "jocelyn.domingo.MALOLOS-O-WC7Z-0001@gmail.com";
  await testLookup(target);
}

main();
