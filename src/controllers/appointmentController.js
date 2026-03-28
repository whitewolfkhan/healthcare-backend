const { Appointment, Patient, Doctor, User, Department } = require('../models');
const { Op } = require('sequelize');

const doctorInclude = {
  model: Doctor,
  as: 'doctor',
  include: [
    { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] },
    { model: Department, as: 'department', attributes: ['name'] },
  ],
};
const patientInclude = {
  model: Patient,
  as: 'patient',
  include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone', 'avatar'] }],
};

exports.getAppointments = async (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    where.patientId = patient.id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    where.doctorId = doctor.id;
  }

  if (status) where.status = status;
  if (startDate || endDate) {
    where.appointmentDate = {};
    if (startDate) where.appointmentDate[Op.gte] = startDate;
    if (endDate) where.appointmentDate[Op.lte] = endDate;
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    include: [doctorInclude, patientInclude],
    limit: parseInt(limit),
    offset,
    order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
  });

  res.json({ success: true, data: { appointments: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
};

exports.createAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, type, reason, symptoms } = req.body;

  const patient = await Patient.findOne({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  if (!doctor.isAvailable) return res.status(400).json({ success: false, message: 'Doctor is not available' });

  const conflict = await Appointment.findOne({
    where: { doctorId, appointmentDate, appointmentTime, status: { [Op.in]: ['pending', 'confirmed'] } },
  });
  if (conflict) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

  const appointment = await Appointment.create({
    patientId: patient.id,
    doctorId,
    appointmentDate,
    appointmentTime,
    type: type || 'consultation',
    reason,
    symptoms,
    fee: doctor.consultationFee,
  });

  const full = await Appointment.findByPk(appointment.id, { include: [doctorInclude, patientInclude] });
  res.status(201).json({ success: true, message: 'Appointment booked successfully', data: full });
};

exports.getAppointmentById = async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, { include: [doctorInclude, patientInclude] });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, data: appointment });
};

exports.updateAppointment = async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const allowedFields = ['status', 'notes', 'diagnosis', 'followUpDate', 'cancelReason', 'videoCallLink', 'isPaid'];
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (appointment.patientId !== patient?.id) return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const updateData = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
  await appointment.update(updateData);

  const updated = await Appointment.findByPk(appointment.id, { include: [doctorInclude, patientInclude] });
  res.json({ success: true, message: 'Appointment updated', data: updated });
};

exports.cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (['completed', 'cancelled'].includes(appointment.status)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
  }
  await appointment.update({ status: 'cancelled', cancelReason: req.body.reason || 'Cancelled by user' });
  res.json({ success: true, message: 'Appointment cancelled' });
};

exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ success: false, message: 'doctorId and date required' });

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const bookedAppointments = await Appointment.findAll({
    where: { doctorId, appointmentDate: date, status: { [Op.in]: ['pending', 'confirmed'] } },
    attributes: ['appointmentTime'],
  });

  const bookedTimes = bookedAppointments.map(a => a.appointmentTime);
  const slots = [];
  const startHour = parseInt((doctor.availableTimeStart || '09:00').split(':')[0]);
  const endHour = parseInt((doctor.availableTimeEnd || '17:00').split(':')[0]);

  for (let hour = startHour; hour < endHour; hour++) {
    for (const min of ['00', '30']) {
      const time = `${String(hour).padStart(2, '0')}:${min}:00`;
      slots.push({ time, available: !bookedTimes.includes(time) });
    }
  }

  res.json({ success: true, data: slots });
};
