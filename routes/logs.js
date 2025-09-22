const express = require('express');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    // แนะนำให้ redirect ไปหน้า login แทนการส่ง Forbidden
    // เพื่อประสบการณ์ผู้ใช้ที่ดีกว่า
    return res.redirect('/login'); 
  }
  next();
};

// เปลี่ยน route handler เป็น async
router.get('/all', requireLogin, async (req, res) => {
  try {
    // เรียกใช้ AuditLog.findAll ด้วย await
    const logs = await AuditLog.findAll();
    res.json(logs);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;