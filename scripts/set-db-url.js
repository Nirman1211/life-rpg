const fs = require('fs');
const path = require('path');

const newUrl = process.argv[2];
const envPath = path.join(__dirname, '..', '.env');

if (!newUrl) {
  console.log("❌ Error: Please provide the database URL.");
  console.log('Usage: node scripts/set-db-url.js "postgresql://user:pass@host/db"');
  process.exit(1);
}

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (envContent.includes('DATABASE_URL=')) {
  envContent = envContent.replace(/DATABASE_URL=["'][^"']*["']/g, `DATABASE_URL="${newUrl}"`);
} else {
  envContent = `DATABASE_URL="${newUrl}"\n` + envContent;
}

fs.writeFileSync(envPath, envContent, 'utf8');
console.log("\n✅ Successfully updated DATABASE_URL in .env!");
