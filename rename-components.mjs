import fs from "fs";
import path from "path";

const renameMap = {
  "create-branch-form.tsx": "create-tenant-form.tsx",
  "branch-selector.tsx": "tenant-selector.tsx",
  "branch-switcher.tsx": "tenant-switcher.tsx",
  "public-branch-selector.tsx": "public-tenant-selector.tsx",
  "branch-network-map.tsx": "tenant-network-map.tsx",
};

const importReplacements = Object.entries(renameMap).map(
  ([oldFile, newFile]) => [
    oldFile.replace(".tsx", ""),
    newFile.replace(".tsx", ""),
  ],
);

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

files.forEach((f) => {
  let content = fs.readFileSync(f, "utf8");
  let originalContent = content;

  importReplacements.forEach(([oldStr, newStr]) => {
    content = content.replaceAll(oldStr, newStr);
  });

  // Also replace some capitalized cases if present in component references
  // CreateBranchForm -> CreateTenantForm
  importReplacements.forEach(([oldStr, newStr]) => {
    const oldC = oldStr
      .split("-")
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
      .join("");
    const newC = newStr
      .split("-")
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
      .join("");
    content = content.replaceAll(oldC, newC);
  });

  // Replace "Branch " with "Tenant " in text context if it is safe, but wait, the user replaced a lot already.
  // We'll keep it targeted to the component names and imports.

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log("Updated references in:", f);
  }
});

// Rename the files
files.forEach((f) => {
  const base = path.basename(f);
  if (renameMap[base]) {
    const newPath = path.join(path.dirname(f), renameMap[base]);
    fs.renameSync(f, newPath);
    console.log("Renamed", f, "to", newPath);
  }
});
