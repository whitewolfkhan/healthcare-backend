const { Prescription, Patient, Doctor, User, Appointment } = require('../models');
const { Op } = require('sequelize');

const includes = [
  { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }] },
  { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
];

exports.getPrescriptions = async (req, res) => {
  let where = {};
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    where.patientId = patient?.id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    where.doctorId = doctor?.id;
  }
  if (req.query.status) where.status = req.query.status;
  if (req.query.patientId) where.patientId = req.query.patientId;

  const prescriptions = await Prescription.findAll({ where, include: includes, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: prescriptions });
};

exports.createPrescription = async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(403).json({ success: false, message: 'Doctor profile not found' });

  const { patientId, appointmentId, diagnosis, medications, instructions, nextVisitDate, notes } = req.body;

  const prescription = await Prescription.create({
    patientId, doctorId: doctor.id, appointmentId, diagnosis, medications, instructions, nextVisitDate, notes,
  });

  const full = await Prescription.findByPk(prescription.id, { include: includes });
  res.status(201).json({ success: true, message: 'Prescription created', data: full });
};

exports.getPrescriptionById = async (req, res) => {
  const prescription = await Prescription.findByPk(req.params.id, { include: includes });
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
  res.json({ success: true, data: prescription });
};

exports.updatePrescription = async (req, res) => {
  const prescription = await Prescription.findByPk(req.params.id);
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

  const { diagnosis, medications, instructions, nextVisitDate, status, notes } = req.body;
  await prescription.update({ diagnosis, medications, instructions, nextVisitDate, status, notes });

  const updated = await Prescription.findByPk(prescription.id, { include: includes });
  res.json({ success: true, message: 'Prescription updated', data: updated });
};

exports.deletePrescription = async (req, res) => {
  const prescription = await Prescription.findByPk(req.params.id);
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
  await prescription.destroy();
  res.json({ success: true, message: 'Prescription deleted' });
};
