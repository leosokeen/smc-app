const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // เราจะยัง import User model เหมือนเดิม
const router = express.Router();

// 1. เปลี่ยนฟังก์ชัน route handler ให้เป็น async
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 2. ใช้ try...catch block เพื่อจัดการ errors ทั้งหมด
  try {
    // 3. เรียกใช้ User.findByUsername ด้วย await และรอรับผลลัพธ์โดยตรง
    const user = await User.findByUsername(username);

    // 4. ตรวจสอบ user และ password ในลำดับที่อ่านง่ายขึ้น
    // ถ้าไม่เจอ user หรือ password ไม่ตรงกัน ให้ไปที่เดียวกัน
    if (!user) {
      // ❌ Username ผิด
      return res.redirect('/login?error=invalid');
    }

    // bcrypt.compare สามารถใช้กับ await ได้เช่นกัน ทำให้โค้ดไม่ซ้อนกัน
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // ❌ Password ผิด
      return res.redirect('/login?error=invalid');
    }

    // ✅ Login สำเร็จ: ตั้งค่า session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    // redirect ไปหน้า dashboard พร้อมสถานะ
    res.redirect('/?login=success');

  } catch (err) {
    // 5. หากเกิด error ที่ไม่คาดฝัน (เช่น DB ล่ม) ให้ log และแจ้งผู้ใช้
    console.error('Login Error:', err);
    res.redirect('/login?error=server');
  }
});

// ส่วนของ logout ไม่มีการเชื่อมต่อฐานข้อมูล จึงไม่ต้องแก้ไข
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;