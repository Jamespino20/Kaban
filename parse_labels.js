const fs = require('fs');

function checkIndent(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const labelRegex = /label:\s*"([^"]+)"/g;
  const categoryRegex = /category:\s*"([^"]+)"/g;
  
  let match;
  while ((match = labelRegex.exec(content)) !== null) {
      if (match[1].startsWith(' ') || match[1] !== match[1].trim() || match[1].includes('\u00A0')) {
          console.log(`FOUND WEIRD LABEL in ${file}: '${match[1]}'`);
      }
  }
  while ((match = categoryRegex.exec(content)) !== null) {
      if (match[1].startsWith(' ') || match[1] !== match[1].trim() || match[1].includes('\u00A0')) {
          console.log(`FOUND WEIRD CATEGORY in ${file}: '${match[1]}'`);
      }
  }
  console.log(`Checked ${file}`);
}

checkIndent('src/app/[tenant]/agapay-pintig/page.tsx');
checkIndent('src/app/[tenant]/agapay-tanaw/page.tsx');
