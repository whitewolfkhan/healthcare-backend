const { LabResult, Patient, Doctor, User } = require('../models');
const path = require('path');

const includes = [
  { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }] },
  { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
];

exports.getLabResults = async (req, res) => {
  let where = {};
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    where.patientId = patient?.id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    where.doctorId = doctor?.id;
  }
  if (req.query.patientId) where.patientId = req.query.patientId;
  if (req.query.status) where.status = req.query.status;

  const results = await LabResult.findAll({ where, include: includes, order: [['testDate', 'DESC']] });
  res.json({ success: true, data: results });
};

exports.createLabResult = async (req, res) => {
  const { patientId, testName, testDate, resultDate, category, results, summary, labName, interpretation, isAbnormal, doctorNotes } = req.body;

  let doctorId = null;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    doctorId = doctor?.id;
  }

  const fileUrl = req.file ? `/uploads/documents/${req.file.filename}` : null;
  const fileName = req.file ? req.file.originalname : null;

  const labResult = await LabResult.create({
    patientId, doctorId, testName, testDate, resultDate, category,
    results: results ? JSON.parse(results) : [], summary, labName, interpretation,
    isAbnormal: isAbnormal === 'true', doctorNotes,
    fileUrl, fileName,
    status: resultDate ? 'completed' : 'pending',
  });

  const full = await LabResult.findByPk(labResult.id, { include: includes });
  res.status(201).json({ success: true, message: 'Lab result added', data: full });
};

exports.getLabResultById = async (req, res) => {
  const result = await LabResult.findByPk(req.params.id, { include: includes });
  if (!result) return res.status(404).json({ success: false, message: 'Lab result not found' });
  res.json({ success: true, data: result });
};

exports.updateLabResult = async (req, res) => {
  const labResult = await LabResult.findByPk(req.params.id);
  if (!labResult) return res.status(404).json({ success: false, message: 'Lab result not found' });

  const { summary, interpretation, doctorNotes, status, results, isAbnormal, resultDate } = req.body;
  await labResult.update({
    summary, interpretation, doctorNotes, status,
    results: results ? JSON.parse(results) : labResult.results,
    isAbnormal: isAbnormal !== undefined ? isAbnormal === 'true' : labResult.isAbnormal,
    resultDate: resultDate || labResult.resultDate,
  });

  const updated = await LabResult.findByPk(labResult.id, { include: includes });
  res.json({ success: true, message: 'Lab result updated', data: updated });
};

exports.deleteLabResult = async (req, res) => {
  const labResult = await LabResult.findByPk(req.params.id);
  if (!labResult) return res.status(404).json({ success: false, message: 'Lab result not found' });
  await labResult.destroy();
  res.json({ success: true, message: 'Lab result deleted' });
};
