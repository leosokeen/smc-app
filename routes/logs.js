const express = require('express');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.status(403).send('Forbidden');
  next();
};

router.get('/all', requireLogin, (req, res) => {
  AuditLog.findAll((err, logs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(logs);
  });
});

module.exports = router;