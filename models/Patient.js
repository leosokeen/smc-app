const db = require('../database/db');

class Patient {
  static create(data, callback) {
    const sql = `
      INSERT INTO patients (
        title, firstname, lastname, phone, hn, patient_type,
        appointment_date, appointment_time, service_type, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    console.log("Create Patient Data:", data);
    db.run(sql, [
      data.title,
      data.firstname,
      data.lastname,
      data.phone,
      data.hn || null,   // 👈 ถ้าไม่ใส่ hn (รายใหม่) จะ insert เป็น NULL
      data.patient_type,
      data.appointment_date,
      data.appointment_time,
      data.service_type,
      data.created_by
    ], function(err) {
      if (callback) callback.call(this, err);
    });
  }

  static findAll(callback) {
    db.all(`
      SELECT p.*, u.username as created_by_name 
      FROM patients p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `, callback);
  }

  static findById(id, callback) {
    db.get(`SELECT * FROM patients WHERE id = ?`, [id], callback);
  }

  static update(id, data, callback) {
    const sql = `
      UPDATE patients SET
        title = ?, firstname = ?, lastname = ?, phone = ?, hn = ?, patient_type = ?,
        appointment_date = ?, appointment_time = ?, service_type = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.run(sql, [
      data.title,
      data.firstname,
      data.lastname,
      data.phone,
      data.hn || null,
      data.patient_type,
      data.appointment_date,
      data.appointment_time,
      data.service_type,
      id
    ], callback);
  }

  static delete(id, callback) {
    db.run(`DELETE FROM patients WHERE id = ?`, [id], callback);
  }

  // ฟังก์ชันนับสถิติสำหรับ Dashboard
  static countByType(callback) {
    db.all(`
      SELECT patient_type, COUNT(*) as count
      FROM patients
      GROUP BY patient_type
    `, callback);
  }

  static countByService(callback) {
    db.all(`
      SELECT service_type, COUNT(*) as count
      FROM patients
      GROUP BY service_type
    `, callback);
  }

  static countByMonth(callback) {
    db.all(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM patients
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `, callback);
  }

  static getTotal(callback) {
    db.get(`SELECT COUNT(*) as total FROM patients`, callback);
  }
}

module.exports = Patient;