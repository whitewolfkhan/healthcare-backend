const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.use(authenticate);

router.get('/profile', async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ success: true, data: user });
});

router.put('/profile', async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findByPk(req.user.id);
  await user.update({ firstName, lastName, phone });
  res.json({ success: true, message: 'Profile updated', data: user });
});

router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Avatar updated', data: { avatar: avatarUrl } });
});

module.exports = router;
