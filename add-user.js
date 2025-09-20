// add-user.js — วางโค้ดนี้ในไฟล์
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'smc.db');
const db = new sqlite3.Database(dbPath);

const username = process.argv[2];
const plainPassword = process.argv[3];
const role = process.argv[4] || 'staff'; // default = staff

if (!username || !plainPassword) {
  console.log('\n❌ Usage: node add-user.js <username> <password> [role]');
  console.log('   Example: node add-user.js nurse01 nursePass123 staff');
  console.log('   Example: node add-user.js manager01 mgrSecret admin\n');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(plainPassword, salt);

db.run(
  `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
  [username, hashedPassword, role],
  function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log(`\n❌ Username "${username}" already exists.\n`);
      } else {
        console.log(`\n❌ Database Error: ${err.message}\n`);
      }
    } else {
      console.log(`\n✅ User "${username}" created successfully with ID: ${this.lastID}\n`);
    }
    db.close();
  }
);