const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// 1. สร้าง Pool การเชื่อมต่อ
// Pool จะอ่าน DATABASE_URL จาก Environment Variables ที่เราตั้งไว้บน Render โดยอัตโนมัติ
// การเชื่อมต่อกับ PostgreSQL บน Render จำเป็นต้องใช้ SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 2. สร้างฟังก์ชันสำหรับสร้างตารางและข้อมูลเริ่มต้น
// เราจะใช้ async/await เพราะการเชื่อมต่อฐานข้อมูลบนเครือข่ายเป็นแบบ Asynchronous
async function initializeDatabase() {
  console.log('Initializing database schema for PostgreSQL...');
  // ยืม connection 1 อันจาก pool มาเพื่อทำงานตั้งค่า
  const client = await pool.connect();

  try {
    // 3. แปลง SQL Syntax ให้เป็นของ PostgreSQL
    // INTEGER PRIMARY KEY AUTOINCREMENT  ->  SERIAL PRIMARY KEY
    // DATETIME                         ->  TIMESTAMPTZ (Timestamp with Time Zone)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        phone  TEXT,
        hn TEXT,
        patient_type TEXT CHECK(patient_type IN ('รายใหม่', 'รายเก่า')),
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        service_type TEXT NOT NULL,
        created_by INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(created_by) REFERENCES users(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action TEXT NOT NULL,
        target_id INTEGER,
        description TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Tables are successfully created or already exist.');

    // 4. เพิ่มข้อมูล admin เริ่มต้น (ถ้ายังไม่มี)
    // ใช้ Parameterized Query ($1, $2, $3) เพื่อความปลอดภัย
    // และใช้ ON CONFLICT DO NOTHING แทน INSERT OR IGNORE ของ SQLite
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    const adminUserQuery = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING;
    `;
    await client.query(adminUserQuery, ['admin', hash, 'admin']);
    console.log('✅ Admin user checked/created.');

  } catch (err) {
    console.error('❌ Error during database initialization:', err);
    throw err; // โยน error ออกไปเพื่อให้แอปพลิเคชันรู้ว่ามีปัญหา
  } finally {
    client.release(); // คืน connection ให้กับ pool ไม่ว่าจะสำเร็จหรือล้มเหลว (สำคัญมาก!)
    console.log('Database initialization complete.');
  }
}

// เรียกใช้ฟังก์ชัน initialize ตอนที่แอปเริ่มทำงาน
initializeDatabase().catch(err => {
    console.error("Failed to initialize the database. Exiting.", err);
    process.exit(1); // หากตั้งค่า DB ไม่สำเร็จ ควรปิดแอปไปเลย
});


// 5. Export object ที่มี method `query`
// เพื่อให้ไฟล์อื่นสามารถเรียกใช้ได้ง่ายๆ และ Pool จะจัดการเรื่อง connection ให้เอง
module.exports = {
  query: (text, params) => pool.query(text, params),
};