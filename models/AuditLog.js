const db = require('../database/db');

class AuditLog {
  static async create(userId, action, targetId, description) {
    const sql = `
      INSERT INTO audit_logs (user_id, action, target_id, description)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [userId, action, targetId, description];
    
    try {
      // สำหรับการสร้าง Log เราไม่จำเป็นต้องรอรับค่าอะไรกลับมา
      await db.query(sql, values);
    } catch (err) {
      console.error('Error creating audit log:', err);
      // ในกรณีนี้ เราอาจจะไม่ throw err เพื่อไม่ให้ action หลัก (เช่น update patient) ล้มเหลว
      // แค่ log error ไว้ก็เพียงพอ แต่ถ้าต้องการให้เข้มงวดก็สามารถ throw err ได้
    }
  }

  static async findAll() {
    const sql = `
      SELECT l.*, u.username 
      FROM audit_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.timestamp DESC
    `;
    try {
      const { rows } = await db.query(sql);
      return rows;
    } catch (err) {
      console.error('Error finding all audit logs:', err);
      throw err;
    }
  }
}

module.exports = AuditLog;