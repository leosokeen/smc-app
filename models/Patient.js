const db = require('../database/db');

class Patient {
  // CREATE
  static async create(data) {
    // 1. ใช้ RETURNING * เพื่อให้ PostgreSQL คืนค่าข้อมูลแถวที่เพิ่ง insert กลับมา
    const sql = `
      INSERT INTO patients (
        title, firstname, lastname, phone, hn, patient_type,
        appointment_date, appointment_time, service_type, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      data.title,
      data.firstname,
      data.lastname,
      data.phone,
      data.hn || null,
      data.patient_type,
      data.appointment_date,
      data.appointment_time,
      data.service_type,
      data.created_by
    ];

    try {
      const { rows } = await db.query(sql, values);
      return rows[0]; // คืนค่า object ของ patient ที่เพิ่งสร้างใหม่
    } catch (err) {
      console.error('Error creating patient:', err);
      throw err;
    }
  }

  // READ ALL
  static async findAll() {
    const sql = `
      SELECT p.*, u.username as created_by_name 
      FROM patients p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `;
    try {
      const { rows } = await db.query(sql);
      return rows;
    } catch (err) {
      console.error('Error finding all patients:', err);
      throw err;
    }
  }

  // READ ONE
  static async findById(id) {
    const sql = `SELECT * FROM patients WHERE id = $1`;
    try {
      const { rows } = await db.query(sql, [id]);
      return rows[0];
    } catch (err) {
      console.error(`Error finding patient with id ${id}:`, err);
      throw err;
    }
  }

  // UPDATE
  static async update(id, data) {
    // 2. ไม่ต้องใช้ CURRENT_TIMESTAMP ใน SQL เพราะเราตั้งค่า default ไว้ใน DB แล้ว
    // แต่เพื่อความชัดเจน, การใส่ updated_at = NOW() ก็เป็นวิธีที่ดีเช่นกัน
    const sql = `
      UPDATE patients SET
        title = $1, firstname = $2, lastname = $3, phone = $4, hn = $5, 
        patient_type = $6, appointment_date = $7, appointment_time = $8, 
        service_type = $9, updated_at = NOW()
      WHERE id = $10
    `;
    const values = [
      data.title, data.firstname, data.lastname, data.phone, data.hn || null,
      data.patient_type, data.appointment_date, data.appointment_time, 
      data.service_type, id
    ];
    try {
      // สำหรับ UPDATE, เราอาจจะไม่ต้องคืนค่าอะไรก็ได้
      await db.query(sql, values);
    } catch (err) {
      console.error(`Error updating patient with id ${id}:`, err);
      throw err;
    }
  }

  // DELETE
  static async delete(id) {
    const sql = `DELETE FROM patients WHERE id = $1`;
    try {
      await db.query(sql, [id]);
    } catch (err) {
      console.error(`Error deleting patient with id ${id}:`, err);
      throw err;
    }
  }

  // --- ฟังก์ชันสำหรับ Dashboard ---

  static async countByType() {
    const sql = `SELECT patient_type, COUNT(*) as count FROM patients GROUP BY patient_type`;
    try {
      const { rows } = await db.query(sql);
      return rows;
    } catch (err) {
      console.error('Error counting patients by type:', err);
      throw err;
    }
  }

  static async countByService() {
    const sql = `SELECT service_type, COUNT(*) as count FROM patients GROUP BY service_type`;
    try {
      const { rows } = await db.query(sql);
      return rows;
    } catch (err) {
      console.error('Error counting patients by service:', err);
      throw err;
    }
  }

  static async countByMonth() {
    // 3. เปลี่ยน strftime('%Y-%m', created_at) เป็น TO_CHAR(created_at, 'YYYY-MM')
    const sql = `
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
      FROM patients
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
    try {
      const { rows } = await db.query(sql);
      return rows;
    } catch (err) {
      console.error('Error counting patients by month:', err);
      throw err;
    }
  }

  static async getTotal() {
    const sql = `SELECT COUNT(*) as total FROM patients`;
    try {
      const { rows } = await db.query(sql);
      // COUNT(*) จะคืนค่าเป็น string, ควรแปลงเป็นตัวเลข
      return rows[0] ? parseInt(rows[0].total, 10) : 0;
    } catch (err) {
      console.error('Error getting total patients:', err);
      throw err;
    }
  }
}

module.exports = Patient;