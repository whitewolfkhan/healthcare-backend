const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Patient, Doctor } = require('../models');
const sendEmail = require('../utils/email');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
};

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, role, phone, specialization, licenseNumber } = req.body;

  const existingUser = await User.scope('withPassword').findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ firstName, lastName, email, password, role: role || 'patient', phone });

  if (role === 'patient' || !role) {
    await Patient.create({
      userId: user.id,
      city: 'Chattagram',
      country: 'Bangladesh',
    });
  } else if (role === 'doctor') {
    if (!specialization || !licenseNumber) {
      await user.destroy();
      return res.status(400).json({ success: false, message: 'Specialization and license number required for doctors' });
    }
    await Doctor.create({ userId: user.id, specialization, licenseNumber });
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await User.update({ refreshToken, lastLogin: new Date() }, { where: { id: user.id } });

  logger.info(`New user registered: ${user.email} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token, refreshToken },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await User.update({ refreshToken, lastLogin: new Date() }, { where: { id: user.id } });

  const safeUser = await User.findByPk(user.id);

  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ where: { userId: user.id } });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ where: { userId: user.id } });
  }

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: safeUser, profile, token, refreshToken },
  });
};

exports.logout = async (req, res) => {
  await User.update({ refreshToken: null }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ where: { userId: user.id } });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ where: { userId: user.id } });
  }
  res.json({ success: true, data: { user, profile } });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.scope('withSensitive').findOne({ where: { email } });

  if (!user) {
    return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await User.update(
    { passwordResetToken: hashedToken, passwordResetExpires: expires },
    { where: { id: user.id } }
  );

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  let emailSent = false;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - HealthCare System',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#0ea5e9">Reset Your Password</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:20px 0">Reset Password</a>
          <p>This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          <p>HealthCare System, Chattagram, Bangladesh</p>
        </div>
      `,
    });
    emailSent = true;
  } catch (err) {
    logger.error('Email send failed:', err);
  }

  // In development, return the reset URL directly so users can test without email config
  const isDev = process.env.NODE_ENV !== 'production';
  res.json({
    success: true,
    message: emailSent
      ? 'Reset link sent to your email.'
      : 'Email service not configured. Use the reset link below (development mode only).',
    ...(isDev && { resetUrl, devNote: 'Configure EMAIL_USER and EMAIL_PASS in .env to enable real emails.' }),
  });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.scope('withSensitive').findOne({
    where: {
      passwordResetToken: hashedToken,
    },
  });

  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  await User.update(
    { password, passwordResetToken: null, passwordResetExpires: null },
    { where: { id: user.id }, individualHooks: true }
  );

  res.json({ success: true, message: 'Password reset successfully' });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.scope('withSensitive').findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const newToken = generateToken(user.id);
    res.json({ success: true, data: { token: newToken } });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.scope('withPassword').findByPk(req.user.id);

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  await User.update({ password: newPassword }, { where: { id: user.id }, individualHooks: true });
  res.json({ success: true, message: 'Password changed successfully' });
};

exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Google credential required' });

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ success: false, message: 'Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID in .env' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid Google credential' });
  }

  const { email, given_name: firstName, family_name: lastName, picture: avatar } = payload;

  let user = await User.findOne({ where: { email } });

  if (!user) {
    // New user — register as patient by default
    const randomPass = crypto.randomBytes(16).toString('hex');
    user = await User.create({
      firstName: firstName || 'User',
      lastName: lastName || '',
      email,
      password: randomPass,
      role: 'patient',
      avatar: avatar || null,
      isActive: true,
      isEmailVerified: true,
    });
    await Patient.create({ userId: user.id, city: 'Chattagram', country: 'Bangladesh' });
    logger.info(`New Google user registered: ${email}`);
  } else {
    // Update avatar from Google if not set
    if (!user.avatar && avatar) {
      await User.update({ avatar, lastLogin: new Date() }, { where: { id: user.id } });
    } else {
      await User.update({ lastLogin: new Date() }, { where: { id: user.id } });
    }
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await User.update({ refreshToken }, { where: { id: user.id } });

  const safeUser = await User.findByPk(user.id);
  let profile = null;
  if (user.role === 'patient') profile = await Patient.findOne({ where: { userId: user.id } });
  else if (user.role === 'doctor') profile = await Doctor.findOne({ where: { userId: user.id } });

  res.json({
    success: true,
    message: 'Google login successful',
    data: { user: safeUser, profile, token, refreshToken },
  });
};
