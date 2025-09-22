// hash-password.js
const bcrypt = require('bcryptjs');

// อ่านรหัสผ่านจาก command line argument ตัวแรก
const plainPassword = process.argv[2];

// ตรวจสอบว่าผู้ใช้ใส่รหัสผ่านเข้ามาหรือไม่
if (!plainPassword) {
  console.log('\n❌ Usage: node hash-password.js <your_password>');
  console.log('   Example: node hash-password.js mySecret123\n');
  process.exit(1); // จบการทำงานถ้าไม่ใส่ password
}

// สร้าง salt และ hash password
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(plainPassword, salt);

// แสดงผลลัพธ์
console.log(`\n🔐 Plain Password: ${plainPassword}`);
console.log(`🔑 Hashed Password: ${hash}\n`);
console.log('✅ Copy the "Hashed Password" above and use it in your PostgreSQL UPDATE command.\n');