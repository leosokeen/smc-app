const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const logRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard'); // 👈 เพิ่มใหม่

require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key-super-strong-123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/logs', logRoutes);
app.use('/dashboard', dashboardRoutes); // 👈 เพิ่มใหม่

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Middleware: Check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes for pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/', requireLogin, (req, res) => {
  res.redirect('/dashboard'); // 👈 เปลี่ยนจาก dashboard.html → /dashboard route
});

app.get('/add-patient', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add-patient.html'));
});

app.get('/list-patients', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'list-patients.html'));
});

app.get('/logs', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'logs.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🌐 Or access via your IP: http://[ip]:${PORT}`);
});