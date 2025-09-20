const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findByUsername(username, (err, user) => {
    if (err || !user) {
      // ❌ Username ผิด
      return res.redirect('/login?error=invalid');
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        // ❌ Password ผิด
        return res.redirect('/login?error=invalid');
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      // ✅ Login สำเร็จ → redirect ไปหน้า dashboard พร้อมสถานะ
      res.redirect('/?login=success');
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;