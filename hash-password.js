// hash-password.js
const bcrypt = require('bcryptjs');

const plainPassword = process.argv[2] || 'yourpassword';

if (!process.argv[2]) {
  console.log('\n❌ Usage: node hash-password.js <your_password>');
  console.log('   Example: node hash-password.js mySecret123\n');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(plainPassword, salt);

console.log(`\n🔐 Plain Password: ${plainPassword}`);
console.log(`🔑 Hashed Password: ${hash}\n`);
console.log('✅ Copy the "Hashed Password" above and use it in your SQLite INSERT command.\n');