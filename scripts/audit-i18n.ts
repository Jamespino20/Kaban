import fs from "fs";
import path from "path";

const SRC_DIR = "c:/Users/James Bryant/Documents/Agapay/agapay-web/src";
const IGNORE_DIRS = ["node_modules", ".next", "api"];

function scanDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) scanDir(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      // Simple regex for string literals in JSX/TSX
      // This is a naive check to get an idea of the volume
      const matches = content.match(/>([^<>{}\n]+)</g);
      if (matches) {
        console.log(`\n--- ${fullPath} ---`);
        matches.forEach((m) => {
          const text = m.slice(1, -1).trim();
          if (text && text.length > 2) {
            console.log(`Possible hardcoded: "${text}"`);
          }
        });
      }
    }
  }
}

console.log("Scanning for hardcoded strings in JSX/TSX...");
scanDir(SRC_DIR);
