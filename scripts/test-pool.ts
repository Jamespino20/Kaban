import { sql } from '../src/lib/db';

async function main() {
  console.log("Testing SQL connection pool...");
  try {
    // Run 10 concurrent queries to see if the pool handles them
    const queries = Array.from({ length: 10 }).map((_, i) => {
      return sql(`SELECT ${i} as id, SLEEP(0.1) as sleep`);
    });
    
    console.log("Executing 10 concurrent queries...");
    const start = Date.now();
    const results = await Promise.all(queries);
    const end = Date.now();
    
    console.log(`Successfully executed 10 queries in ${end - start}ms`);
    console.log("Sample result:", results[0]);
  } catch (err) {
    console.error("Pool Test Error:", err);
  }
}

main();
