import { sql } from "../src/lib/db";

async function main() {
  try {
    console.log("Testing SQL connection...");
    const result = await sql("SELECT COUNT(*) as count FROM users");
    console.log("User count:", result);
    
    const users = await sql("SELECT user_id, email, username FROM users LIMIT 5");
    console.log("Top users:", users);
  } catch (err) {
    console.error("SQL Error:", err);
  }
}

main();
