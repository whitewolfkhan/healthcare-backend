const { MedicalRecord, Patient, User } = require('../models');
const { Op } = require('sequelize');

const includes = [
  { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }] },
  { model: User, as: 'uploader', attributes: ['firstName', 'lastName', 'role'] },
];

exports.getMedicalRecords = async (req, res) => {
  let where = {};
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    where.patientId = patient?.id;
  } else if (req.query.patientId) {
    where.patientId = req.query.patientId;
  }
  if (req.query.type) where.type = req.query.type;

  const records = await MedicalRecord.findAll({
    where,
    include: includes,
    order: [['date', 'DESC']],
  });
  res.json({ success: true, data: records });
};

exports.createMedicalRecord = async (req, res) => {
  const { patientId, title, type, description, date, tags, isConfidential } = req.body;

  let resolvedPatientId = patientId;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    resolvedPatientId = patient?.id;
  }

  const fileUrl = req.file ? `/uploads/documents/${req.file.filename}` : null;
  const fileName = req.file ? req.file.originalname : null;
  const fileSize = req.file ? req.file.size : null;
  const mimeType = req.file ? req.file.mimetype : null;

  const record = await MedicalRecord.create({
    patientId: resolvedPatientId,
    uploadedBy: req.user.id,
    title,
    type: type || 'other',
    description,
    date: date || new Date(),
    fileUrl,
    fileName,
    fileSize,
    mimeType,
    tags: tags ? JSON.parse(tags) : [],
    isConfidential: isConfidential === 'true',
  });

  const full = await MedicalRecord.findByPk(record.id, { include: includes });
  res.status(201).json({ success: true, message: 'Medical record created', data: full });
};

exports.getMedicalRecordById = async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id, { include: includes });
  if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
  res.json({ success: true, data: record });
};

exports.updateMedicalRecord = async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
  const { title, type, description, date, tags, isConfidential } = req.body;
  await record.update({ title, type, description, date, tags: tags ? JSON.parse(tags) : record.tags, isConfidential });
  const updated = await MedicalRecord.findByPk(record.id, { include: includes });
  res.json({ success: true, message: 'Record updated', data: updated });
};

exports.deleteMedicalRecord = async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
  await record.destroy();
  res.json({ success: true, message: 'Record deleted' });
};
