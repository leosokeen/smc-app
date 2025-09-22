const express = require('express');
const Patient = require('../models/Patient');
const router = express.Router();

const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

// 1. เปลี่ยน route handler เป็น async
router.get('/', requireLogin, async (req, res) => {
  try {
    // 2. เรายังคงใช้ Promise.all แต่จะดูสะอาดขึ้นมาก
    // เพราะฟังก์ชัน Model ของเราตอนนี้คืนค่า Promise โดยตรง ไม่ต้องห่อด้วย new Promise อีกต่อไป
    const [total, byType, byService, byMonth] = await Promise.all([
      Patient.getTotal(),
      Patient.countByType(),
      Patient.countByService(),
      Patient.countByMonth()
    ]);

    // 3. Logic การประมวลผลข้อมูลยังคงเหมือนเดิม
    const typeData = {
      labels: byType.map(r => String(r.patient_type)),
      values: byType.map(r => Number(r.count))
    };

    const serviceData = {
      labels: byService.map(r => String(r.service_type)),
      values: byService.map(r => Number(r.count))
    };

    // ปรับปรุงเล็กน้อยเพื่อประสิทธิภาพ: reverse array แค่ครั้งเดียว
    const reversedByMonth = [...byMonth].reverse(); // สร้าง copy แล้ว reverse
    const monthData = {
      labels: reversedByMonth.map(r => String(r.month)),
      values: reversedByMonth.map(r => Number(r.count))
    };

    res.render('dashboard', {
      totalPatients: total,
      typeData,
      serviceData,
      monthData,
      username: req.session.username
    });

  } catch (err) {
    // 4. catch block จะดักจับ error จาก Promise.all ได้ทั้งหมด
    console.error("Error fetching dashboard data:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;