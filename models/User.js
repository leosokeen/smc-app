const db = require('../database/db'); // การ import ยังเหมือนเดิม

class User {
  // 1. เปลี่ยนฟังก์ชันให้เป็น async และลบ callback parameter ออก
  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = $1'; // 2. เปลี่ยน ? เป็น $1
    try {
      // 3. ใช้ await db.query และส่งค่า parameter เป็น array ตัวที่สอง
      const { rows } = await db.query(sql, [username]);
      // 4. db.query จะคืนค่าเป็น array เสมอ, เราต้องการแค่ตัวแรก (ถ้ามี)
      return rows[0]; 
    } catch (err) {
      console.error('Error finding user by username:', err);
      throw err; // โยน error กลับไปให้ส่วนที่เรียก (routes/auth.js) จัดการต่อ
    }
  }

  // แก้ไขฟังก์ชัน findById ไปพร้อมกันเลย
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    try {
      const { rows } = await db.query(sql, [id]);
      return rows[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }
}

module.exports = User;