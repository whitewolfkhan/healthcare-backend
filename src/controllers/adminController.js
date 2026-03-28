const { User, Patient, Doctor, Appointment, Department, Prescription, LabResult } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getAnalytics = async (req, res) => {
  const [totalUsers, totalPatients, totalDoctors, totalAppointments, totalDepartments] = await Promise.all([
    User.count(),
    Patient.count(),
    Doctor.count(),
    Appointment.count(),
    Department.count(),
  ]);

  const appointmentsByStatus = await Appointment.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const appointmentsByDay = await Appointment.findAll({
    where: { createdAt: { [Op.gte]: last30Days } },
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true,
  });

  const newUsers30Days = await User.count({ where: { createdAt: { [Op.gte]: last30Days } } });

  const recentAppointments = await Appointment.findAll({
    include: [
      { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
      { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  res.json({
    success: true,
    data: {
      overview: { totalUsers, totalPatients, totalDoctors, totalAppointments, totalDepartments, newUsers30Days },
      appointmentsByStatus,
      appointmentsByDay,
      recentAppointments,
    },
  });
};

exports.getAllUsers = async (req, res) => {
  const { search, role, isActive, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where, limit: parseInt(limit), offset,
    order: [['createdAt', 'DESC']],
  });

  res.json({ success: true, data: { users: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { firstName, lastName, email, phone, role, isActive } = req.body;
  await user.update({ firstName, lastName, email, phone, role, isActive });
  res.json({ success: true, message: 'User updated', data: user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  await User.update({ isActive: false }, { where: { id: req.params.id } });
  res.json({ success: true, message: 'User deactivated' });
};

exports.getDepartments = async (req, res) => {
  const departments = await Department.findAll({
    include: [{ model: Doctor, as: 'doctors', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] }],
  });
  res.json({ success: true, data: departments });
};

exports.createDepartment = async (req, res) => {
  const { name, description, icon } = req.body;
  const department = await Department.create({ name, description, icon });
  res.status(201).json({ success: true, message: 'Department created', data: department });
};

exports.updateDepartment = async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  await dept.update(req.body);
  res.json({ success: true, message: 'Department updated', data: dept });
};

exports.deleteDepartment = async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  await dept.update({ isActive: false });
  res.json({ success: true, message: 'Department deactivated' });
};
