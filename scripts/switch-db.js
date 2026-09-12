const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'postgres' or 'sqlite'
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (!target || !['postgres', 'postgresql', 'sqlite'].includes(target)) {
  console.log("Usage: node scripts/switch-db.js <postgres|sqlite>");
  process.exit(1);
}

const provider = target === 'sqlite' ? 'sqlite' : 'postgresql';
let content = fs.readFileSync(schemaPath, 'utf8');

content = content.replace(
  /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*["'][^"']+["']/,
  `datasource db {\n  provider = "${provider}"`
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log(`\n✅ Successfully switched Prisma provider to: "${provider}" in prisma/schema.prisma!`);
