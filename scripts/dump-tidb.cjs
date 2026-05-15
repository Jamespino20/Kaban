const mysql = require("mysql2/promise");
const fs = require("fs");

async function main() {
  const conn = await mysql.createConnection({
    host: "gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com",
    port: 4000,
    user: "ijdRyAF1c4W89wb.root",
    password: "M5RpzzoQFBA5DXOa",
    database: "agapay",
    ssl: { rejectUnauthorized: true },
  });

  let output = "-- Agapay Database Dump (TiDB Serverless)\n";
  output += "-- Generated: " + new Date().toISOString() + "\n\n";

  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'agapay' ORDER BY TABLE_NAME"
  );

  for (const t of tables) {
    const tb = t.TABLE_NAME;
    if (tb === "social_vouches" || tb === "vouch_score_snapshots") continue;

    try {
      const [createResult] = await conn.execute("SHOW CREATE TABLE `" + tb + "`");
      const createStmt = createResult[0]["Create Table"];
      output += "DROP TABLE IF EXISTS `" + tb + "`;\n";
      output += createStmt + ";\n\n";

      const [rows] = await conn.execute("SELECT * FROM `" + tb + "`");
      if (rows.length > 0) {
        const cols = Object.keys(rows[0]);
        for (const row of rows) {
          const vals = cols.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return "NULL";
            if (typeof v === "number") return v;
            const escaped = String(v).replace(/'/g, "''");
            return "'" + escaped + "'";
          });
          output +=
            "INSERT INTO `" +
            tb +
            "` (`" +
            cols.join("`, `") +
            "`) VALUES (" +
            vals.join(", ") +
            ");\n";
        }
        output += "\n";
      }
    } catch (e) {
      output += "-- Skipped " + tb + ": " + e.message + "\n\n";
    }
  }

  const outPath = __dirname + "/../sql/agapay-tidb-dump.sql";
  fs.writeFileSync(outPath, output, "utf8");
  const size = (output.length / 1024 / 1024).toFixed(2);
  console.log("Dump created: " + size + " MB at " + outPath);
  await conn.end();
}

main().catch((e) => console.error(e.message));
