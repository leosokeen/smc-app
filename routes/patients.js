const express = require('express');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

// Middleware: ไม่ต้องแก้ไขส่วนนี้
const requireLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
};

// CREATE: Add new patient
// 1. เปลี่ยน route handler เป็น async
router.post('/add', requireLogin, async (req, res) => {
  const patientData = { ...req.body, created_by: req.session.userId };
  
  // 2. ใช้ try...catch block สำหรับ error handling
  try {
    // 3. เรียก Patient.create ด้วย await และรอรับข้อมูล patient ที่สร้างเสร็จ (พร้อม ID)
    const newPatient = await Patient.create(patientData);

    const desc = `${req.session.username} added patient: ${newPatient.firstname} ${newPatient.lastname}`;
    // 4. เรียก AuditLog.create ด้วย await และใช้ ID จาก newPatient
    await AuditLog.create(req.session.userId, 'CREATE', newPatient.id, desc);

    res.redirect('/list-patients?action=created');
  } catch (err) {
    console.error("Error saving patient:", err);
    res.status(500).send('Error saving patient: ' + err.message);
  }
});

// READ (API): Get all patients
router.get('/all', requireLogin, async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    console.error("Database error fetching all patients:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// READ (Page): Show edit form
router.get('/edit/:id', requireLogin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send('Patient not found');
    }
    // Express ไม่ได้ใช้ render ผ่าน callback เราจึงไม่ต้องเปลี่ยนส่วนนี้มาก
    res.render('edit-patient', { patient }); 
  } catch (err) {
    console.error("Error finding patient for edit:", err);
    res.status(500).send('Server error');
  }
});

// UPDATE: Update patient data
router.post('/update/:id', requireLogin, async (req, res) => {
  try {
    await Patient.update(req.params.id, req.body);

    const desc = `${req.session.username} updated patient ID: ${req.params.id}`;
    await AuditLog.create(req.session.userId, 'UPDATE', req.params.id, desc);

    res.redirect('/list-patients?action=updated');
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).send('Error updating patient: ' + err.message);
  }
});

// DELETE: Remove patient
// โค้ดส่วนนี้จะอ่านง่ายขึ้นมากด้วย async/await
router.get('/delete/:id', requireLogin, async (req, res) => {
  try {
    // 1. ดึงข้อมูล patient มาก่อนเพื่อใช้ชื่อในการ log (เหมือนเดิม)
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).send('Patient not found');
    }

    // 2. สั่งลบข้อมูล (โค้ดจะรอจนลบเสร็จ)
    await Patient.delete(req.params.id);

    // 3. สร้าง log (เมื่อลบข้อมูลสำเร็จแล้ว)
    const desc = `${req.session.username} deleted patient: ${patient.firstname} ${patient.lastname}`;
    await AuditLog.create(req.session.userId, 'DELETE', req.params.id, desc);
    
    res.redirect('/list-patients?action=deleted');
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).send('Error deleting: ' + err.message);
  }
});

module.exports = router;