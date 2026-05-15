import { sql } from "./src/lib/db";

async function inspectUrls() {
  try {
    console.log("--- Inspecting UserDocument URLs ---");
    const docs = await sql`SELECT document_id, document_type, file_url FROM user_documents LIMIT 5` as any[];
    console.log(JSON.stringify(docs, null, 2));

    console.log("\n--- Inspecting Payment Receipt URLs ---");
    const payments = await sql`SELECT payment_id, payment_reference, receipt_url FROM payments WHERE receipt_url IS NOT NULL LIMIT 5` as any[];
    console.log(JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error("Inspection failed:", error);
  }
}

inspectUrls().catch(console.error);
