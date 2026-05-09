import fs from "fs";
import path from "path";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (
      stat &&
      stat.isDirectory() &&
      !file.includes(".next") &&
      !file.includes("node_modules") &&
      !file.includes(".git")
    ) {
      results = results.concat(walk(file));
    } else if (
      stat.isFile() &&
      (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".md"))
    ) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("./src");
let changed = 0;
files.forEach((f) => {
  let content = fs.readFileSync(f, "utf8");
  if (content.includes("tenantes") || content.includes("Tenantes")) {
    content = content.replace(/tenantes/g, "tenants");
    content = content.replace(/Tenantes/g, "Tenants");
    fs.writeFileSync(f, content);
    changed++;
    console.log("Fixed", f);
  }
});
console.log("Total fixed:", changed);
