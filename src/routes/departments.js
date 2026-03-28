const express = require('express');
const router = express.Router();
const { Department, Doctor, User } = require('../models');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const departments = await Department.findAll({
    where: { isActive: true },
    include: [{
      model: Doctor,
      as: 'doctors',
      where: { isAvailable: true },
      required: false,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar'] }],
    }],
  });
  res.json({ success: true, data: departments });
});

router.get('/:id', async (req, res) => {
  const dept = await Department.findByPk(req.params.id, {
    include: [{
      model: Doctor,
      as: 'doctors',
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'avatar'] }],
    }],
  });
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: dept });
});

module.exports = router;
