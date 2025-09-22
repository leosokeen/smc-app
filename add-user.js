// โหลดค่าจาก .env เข้าสู่ process.env
require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./database/db');

async function main() {
  const action = process.argv[2];
  const username = process.argv[3];

  if (!action || !username) {
    console.log('\n❌ Usage:');
    console.log('   To add a user: node add-user.js add <username> <password> [role]');
    console.log('   To delete a user: node add-user.js delete <username>\n');
    return;
  }

  if (action === 'add') {
    const plainPassword = process.argv[4];
    const role = process.argv[5] || 'staff';

    if (!plainPassword) {
      console.error('\n❌ Error: Password is required for adding a user.\n');
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    // ใช้ RETURNING id เพื่อให้ DB คืนค่า id ที่เพิ่งสร้างกลับมา
    const sql = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id`;
    
    try {
      const result = await db.query(sql, [username, hashedPassword, role]);
      const newUserId = result.rows[0].id;
      console.log(`\n✅ User "${username}" created successfully with ID: ${newUserId}\n`);
    } catch (err) {
      if (err.code === '23505') { // โค้ด Error สำหรับ Unique Violation ใน PostgreSQL
        console.error(`\n❌ Username "${username}" already exists.\n`);
      } else {
        console.error(`\n❌ Database Error: ${err.message}\n`);
      }
    }

  } else if (action === 'delete') {
    const sql = `DELETE FROM users WHERE username = $1`;
    try {
      const result = await db.query(sql, [username]);
      if (result.rowCount > 0) {
        console.log(`\n✅ User "${username}" deleted successfully.\n`);
      } else {
        console.log(`\n🟡 User "${username}" not found.\n`);
      }
    } catch (err) {
      console.error(`\n❌ Error deleting user: ${err.message}\n`);
    }

  } else {
    console.error(`\n❌ Error: Unknown action '${action}'. Use 'add' or 'delete'.\n`);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    // ปิด connection pool เพื่อให้ script จบการทำงานเสมอ
    db.pool.end();
  });