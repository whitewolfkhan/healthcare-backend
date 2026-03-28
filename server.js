require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

// Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const patientRoutes = require('./src/routes/patients');
const doctorRoutes = require('./src/routes/doctors');
const appointmentRoutes = require('./src/routes/appointments');
const prescriptionRoutes = require('./src/routes/prescriptions');
const labResultRoutes = require('./src/routes/labResults');
const medicalImageRoutes = require('./src/routes/medicalImages');
const medicationRoutes = require('./src/routes/medications');
const vitalRoutes = require('./src/routes/vitals');
const departmentRoutes = require('./src/routes/departments');
const medicalRecordRoutes = require('./src/routes/medicalRecords');
const adminRoutes = require('./src/routes/admin');
const notificationRoutes = require('./src/routes/notifications');

const app = express();

// Trust proxy — required for Render, Heroku, Vercel etc.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.',
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare API is running', timestamp: new Date().toISOString() });
});

// Manual seed trigger (one-time use)
app.get('/api/run-seed', async (req, res) => {
  try {
    const { User } = require('./src/models');
    const adminExists = await User.findOne({ where: { email: 'admin@healthcare.com' } });
    if (adminExists) {
      return res.json({ success: true, message: 'Seed already done. Admin exists.' });
    }
    const seedData = require('./src/utils/seed');
    await seedData(false);
    res.json({ success: true, message: 'Seed completed! You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/medical-images', medicalImageRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors.map(e => e.message) });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ success: false, message: 'Duplicate entry', errors: err.errors.map(e => e.message) });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

const autoSeed = async () => {
  try {
    const { User } = require('./src/models');
    const adminExists = await User.findOne({ where: { email: 'admin@healthcare.com' } });
    if (!adminExists) {
      logger.info('No seed data found. Running auto-seed...');
      require('./src/utils/seed');
    } else {
      logger.info('Seed data already exists. Skipping auto-seed.');
    }
  } catch (err) {
    logger.error('Auto-seed error:', err.message);
  }
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized.');
    await autoSeed();
    app.listen(PORT, () => {
      logger.info(`Healthcare API server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
