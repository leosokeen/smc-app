const express = require('express');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

// Middleware: redirect to login if not logged in
const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

// CREATE: Add new patient
router.post('/add', requireLogin, (req, res) => {
  const patientData = { ...req.body, created_by: req.session.userId };
  
  Patient.create(patientData, function (err) {
    if (err) {
      console.error("Error saving patient:", err.message);
      return res.status(500).send('Error saving patient: ' + err.message);
    }

    const desc = `${req.session.username} added patient: ${patientData.firstname} ${patientData.lastname}`;
    AuditLog.create(req.session.userId, 'CREATE', this.lastID, desc, () => {});

    // Redirect with success status for SweetAlert
    res.redirect('/list-patients?action=created');
  });
});

// READ (API): Get all patients
router.get('/all', requireLogin, (req, res) => {
  Patient.findAll((err, patients) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(patients);
  });
});

// READ (Page): Show edit form
router.get('/edit/:id', requireLogin, (req, res) => {
  Patient.findById(req.params.id, (err, patient) => {
    if (err || !patient) return res.status(404).send('Patient not found');
    res.render('edit-patient', { patient });
  });
});

// UPDATE: Update patient data
router.post('/update/:id', requireLogin, (req, res) => {
  Patient.update(req.params.id, req.body, (err) => {
    if (err) {
      console.error("Error updating patient:", err.message);
      return res.status(500).send('Error updating patient: ' + err.message);
    }

    const desc = `${req.session.username} updated patient ID: ${req.params.id}`;
    AuditLog.create(req.session.userId, 'UPDATE', req.params.id, desc, () => {});

    // Redirect with success status for SweetAlert
    res.redirect('/list-patients?action=updated');
  });
});

// DELETE: Remove patient
router.get('/delete/:id', requireLogin, (req, res) => {
  Patient.findById(req.params.id, (err, patient) => {
    if (err || !patient) return res.status(404).send('Patient not found');

    Patient.delete(req.params.id, (err) => {
      if (err) {
        console.error("Error deleting patient:", err.message);
        return res.status(500).send('Error deleting: ' + err.message);
      }

      const desc = `${req.session.username} deleted patient: ${patient.firstname} ${patient.lastname}`;
      AuditLog.create(req.session.userId, 'DELETE', req.params.id, desc, () => {});

      // Redirect with success status for SweetAlert
      res.redirect('/list-patients?action=deleted');
    });
  });
});

module.exports = router;