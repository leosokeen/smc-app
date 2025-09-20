const db = require('../database/db');

class AuditLog {
  static create(userId, action, targetId, description, callback) {
    const sql = `
      INSERT INTO audit_logs (user_id, action, target_id, description)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [userId, action, targetId, description], callback);
  }

  static findAll(callback) {
    const sql = `
      SELECT l.*, u.username 
      FROM audit_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.timestamp DESC
    `;
    db.all(sql, callback);
  }
}

module.exports = AuditLog;