const { Patient, User, Appointment, Prescription, LabResult, MedicalImage, Medication, VitalSign, Doctor } = require('../models');
const { Op } = require('sequelize');

exports.getMyProfile = async (req, res) => {
  const patient = await Patient.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] }],
  });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
  res.json({ success: true, data: patient });
};

exports.updateMyProfile = async (req, res) => {
  const patient = await Patient.findOne({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

  const allowedFields = ['dateOfBirth', 'gender', 'bloodGroup', 'address', 'city', 'country',
    'emergencyContact', 'emergencyContactName', 'allergies', 'chronicConditions',
    'currentMedications', 'insuranceProvider', 'insuranceNumber', 'height', 'weight', 'occupation', 'notes'];

  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  await patient.update(updateData);

  if (req.body.firstName || req.body.lastName || req.body.phone) {
    const userUpdate = {};
    if (req.body.firstName) userUpdate.firstName = req.body.firstName;
    if (req.body.lastName) userUpdate.lastName = req.body.lastName;
    if (req.body.phone) userUpdate.phone = req.body.phone;
    await User.update(userUpdate, { where: { id: req.user.id } });
  }

  const updated = await Patient.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] }],
  });

  res.json({ success: true, message: 'Profile updated successfully', data: updated });
};

exports.getDashboardStats = async (req, res) => {
  const patient = await Patient.findOne({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const [appointments, prescriptions, labResults, medications, vitals] = await Promise.all([
    Appointment.count({ where: { patientId: patient.id } }),
    Prescription.count({ where: { patientId: patient.id, status: 'active' } }),
    LabResult.count({ where: { patientId: patient.id } }),
    Medication.count({ where: { patientId: patient.id, status: 'active' } }),
    VitalSign.findAll({
      where: { patientId: patient.id },
      order: [['recordedAt', 'DESC']],
      limit: 7,
    }),
  ]);

  const upcomingAppointments = await Appointment.findAll({
    where: {
      patientId: patient.id,
      appointmentDate: { [Op.gte]: new Date() },
      status: { [Op.in]: ['pending', 'confirmed'] },
    },
    include: [{
      model: Doctor,
      as: 'doctor',
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar'] }],
    }],
    order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
    limit: 5,
  });

  res.json({
    success: true,
    data: {
      stats: { totalAppointments: appointments, activePrescriptions: prescriptions, totalLabResults: labResults, activeMedications: medications },
      upcomingAppointments,
      recentVitals: vitals,
    },
  });
};

exports.getAllPatients = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const userWhere = search ? {
    [Op.or]: [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ],
  } : {};

  const { count, rows } = await Patient.findAndCountAll({
    include: [{ model: User, as: 'user', where: userWhere, attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar', 'createdAt'] }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[{ model: User, as: 'user' }, 'firstName', 'ASC']],
  });

  res.json({ success: true, data: { patients: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
};

exports.getPatientById = async (req, res) => {
  const patient = await Patient.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] }],
  });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, data: patient });
};
