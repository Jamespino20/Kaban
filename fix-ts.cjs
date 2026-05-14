const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('tx')) {
    const newContent = content
      .replace(/async\s*\(\s*tx\s*\)\s*=>/g, 'async (tx: any) =>')
      .replace(/async\s*\(\s*tx\s*,\s*/g, 'async (tx: any, ')
      .replace(/[^\w]\(\s*tx\s*\)\s*=>/g, ' (tx: any) =>');
    
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (file.includes('audit-logs.ts')) {
    content = content.replace(/async\s*\(\s*log\s*\)/g, 'async (log: any)');
    changed = true;
  }
  
  if (file.includes('reset.ts')) {
     content = content.replace(/\(user\)/g, '(user: any)');
     // quick patch for "user.tenant_id as number" error in TS
     content = content.replace(/user\.tenant_id/g, '(user.tenant_id as number)');
     changed = true;
  }
  
  if (file.includes('system-health.ts')) {
     content = content.replace(/\(tenant\)/g, '(tenant: any)');
     changed = true;
  }

  if (file.includes('tenant-applications.ts')) {
     content = content.replace(/\(app\)/g, '(app: any)');
     changed = true;
  }

  if (changed) fs.writeFileSync(file, content);
});
console.log("TypeScript overrides applied.");
