const { Doctor, User, Department, Appointment, Patient } = require('../models');
const { Op } = require('sequelize');

const doctorInclude = [
  { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] },
  { model: Department, as: 'department', attributes: ['id', 'name'] },
];

exports.getAllDoctors = async (req, res) => {
  const { search, specialization, departmentId, isAvailable } = req.query;
  let userWhere = {};
  let doctorWhere = {};

  if (search) {
    userWhere[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (specialization) doctorWhere.specialization = { [Op.iLike]: `%${specialization}%` };
  if (departmentId) doctorWhere.departmentId = departmentId;
  if (isAvailable !== undefined) doctorWhere.isAvailable = isAvailable === 'true';

  const doctors = await Doctor.findAll({
    where: doctorWhere,
    include: [
      { model: User, as: 'user', where: userWhere, attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
    ],
    order: [[{ model: User, as: 'user' }, 'firstName', 'ASC']],
  });

  res.json({ success: true, data: doctors });
};

exports.getDoctorById = async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id, { include: doctorInclude });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
};

exports.getMyProfile = async (req, res) => {
  const doctor = await Doctor.findOne({
    where: { userId: req.user.id },
    include: doctorInclude,
  });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
  res.json({ success: true, data: doctor });
};

exports.updateMyProfile = async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

  const allowedFields = ['specialization', 'bio', 'consultationFee', 'availableDays', 'availableTimeStart', 'availableTimeEnd', 'isAvailable', 'qualifications', 'experience', 'clinicName', 'clinicAddress', 'clinicCity', 'clinicPhone'];
  const updateData = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
  await doctor.update(updateData);

  if (req.body.firstName || req.body.lastName || req.body.phone) {
    const userUpdate = {};
    if (req.body.firstName) userUpdate.firstName = req.body.firstName;
    if (req.body.lastName) userUpdate.lastName = req.body.lastName;
    if (req.body.phone) userUpdate.phone = req.body.phone;
    await User.update(userUpdate, { where: { id: req.user.id } });
  }

  const updated = await Doctor.findOne({ where: { userId: req.user.id }, include: doctorInclude });
  res.json({ success: true, message: 'Profile updated', data: updated });
};

exports.getDoctorDashboard = async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const today = new Date().toISOString().split('T')[0];
  const [totalAppointments, todayAppointments, totalPatients, pendingAppointments] = await Promise.all([
    Appointment.count({ where: { doctorId: doctor.id } }),
    Appointment.count({ where: { doctorId: doctor.id, appointmentDate: today } }),
    Appointment.count({ where: { doctorId: doctor.id, status: 'completed' } }),
    Appointment.count({ where: { doctorId: doctor.id, status: 'pending' } }),
  ]);

  const recentAppointments = await Appointment.findAll({
    where: { doctorId: doctor.id, appointmentDate: { [Op.gte]: today } },
    include: [{
      model: Patient, as: 'patient',
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar'] }],
    }],
    order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
    limit: 10,
  });

  res.json({
    success: true,
    data: {
      stats: { totalAppointments, todayAppointments, totalPatients, pendingAppointments },
      recentAppointments,
    },
  });
};
