const express = require('express');
const Patient = require('../models/Patient');
const router = express.Router();

const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

router.get('/', requireLogin, (req, res) => {
  Promise.all([
    new Promise((resolve, reject) =>
      Patient.getTotal((err, result) => {
        if (err) return reject(err);
        resolve(result?.total || 0);
      })
    ),
    new Promise((resolve, reject) =>
      Patient.countByType((err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      })
    ),
    new Promise((resolve, reject) =>
      Patient.countByService((err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      })
    ),
    new Promise((resolve, reject) =>
      Patient.countByMonth((err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      })
    )
  ])
    .then(([total, byType, byService, byMonth]) => {
      const typeData = {
        labels: byType.map(r => String(r.patient_type)),
        values: byType.map(r => Number(r.count))
      };

      const serviceData = {
        labels: byService.map(r => String(r.service_type)),
        values: byService.map(r => Number(r.count))
      };

      const monthData = {
        labels: byMonth.reverse().map(r => String(r.month)),
        values: byMonth.reverse().map(r => Number(r.count))
      };


      res.render('dashboard', {
        totalPatients: total,
        typeData,
        serviceData,
        monthData,
        username: req.session.username
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});

module.exports = router;